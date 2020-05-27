/* eslint-disable no-console */
import "reflect-metadata"; // tslint:disable
import { ApolloServer } from "apollo-server";
import { buildSchema, ResolverData } from "type-graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis, { RedisOptions } from "ioredis";
import { inspect } from "util";
import { Container } from "typedi";
import { authChecker } from "./Authorization/authChecker";
import { generateContextFromRequest } from "./Context/generateContextFromRequest";
import { parse } from "url";
import { Logger, loggerError, loggerInfo } from "./logger";
import { Context } from "./Context";
import { GraphQLFormattedError } from "graphql";

let pubSub: RedisPubSub;
//Gracefully Stop
process.on("SIGINT", async function() {
    loggerInfo("Gracefully stopping");
    try {
        if (pubSub) {
            await pubSub.close();
        }
        process.exit(0);
    } catch (e) {
        loggerError(e);
        process.exit(1);
    }
});

void (async function bootstrap() {
    loggerInfo("Bootstraping");
    const redisUrl = parse(process.env.REDIS_URL || "");
    const options: RedisOptions = {
        host: redisUrl.hostname || undefined,
        port: Number(redisUrl.port) || undefined,
        retryStrategy: times => Math.max(times * 100, 3000)
    };
    const auth = redisUrl?.auth?.split(":")[1];
    if (auth) {
        options.port = Number(redisUrl.port) + 1;
        options.password = auth;
        options.db = 0;
        options.tls = {
            rejectUnauthorized: false,
            requestCert: true,
            //@ts-ignore
            agent: false
        };
    }
    // create Redis-based pub-sub
    pubSub = new RedisPubSub({
        publisher: new Redis(options),
        subscriber: new Redis(options)
    });

    loggerInfo("building GraphQL Schema");
    //build TypeGraphQL executable schema
    const schema = await buildSchema({
        container: ({ context }: ResolverData<Context>) => context.container,
        resolvers: [__dirname + "/**/*Resolver.ts"],
        pubSub,
        authChecker
    });

    loggerInfo("starting server");
    // Create GraphQL server
    const server = new ApolloServer({
        schema,
        cors: {
            origin: [/^http:\/\/localhost:(\d)*$/],
            maxAge: 1728000,
            credentials: true
        },
        context: ({ req, connection }) => {
            const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            const container = setupScopedContainer(requestId);
            return {
                ...generateContextFromRequest(container, req, connection),
                requestId,
                container
            };
        },
        playground: {
            settings: {
                "request.credentials": "include"
            }
        },
        plugins: [
            {
                requestDidStart: ({ context }) => {
                    loggerInfo("Start of RequestId-%d ", context.requestId);
                    return {
                        willSendResponse({ context }) {
                            // @link https://github.com/MichalLytek/type-graphql/blob/master/examples/using-scoped-container/index.ts#L36
                            loggerInfo("End of RequestId-%d ", context.requestId);
                            // remember to dispose the scoped container to prevent memory leaks
                            Container.reset(context.requestId);
                        }
                    };
                }
            }
        ],
        extensions: [
            () => ({
                willSendResponse: o => {
                    const { context, graphqlResponse } = o;
                    if (graphqlResponse.errors) {
                        graphqlResponse.errors = graphqlResponse.errors.map(err =>
                            formatGraphQlError(err, context.requestId)
                        );
                    }
                    return o;
                }
            })
        ],
        introspection: true
    });

    // Start the server
    const { url } = await server.listen(process.env.PORT);
    loggerInfo(`Server is running, GraphQL Playground available at ${url}`);
})().catch(e => {
    console.error(e);

    loggerError(e);
});

function formatGraphQlError(error: GraphQLFormattedError, requestId: number | undefined) {
    loggerError(`Error RequestId-%d: ${error.message} %j`, requestId, {
        error: error,
        stack: inspect(error.extensions?.exception)
    });
    return error;
}

function setupScopedContainer(requestId: number) {
    const container = Container.of(requestId);
    container.set("requestId", requestId);
    container.set(Logger, new Logger(requestId));
    return container;
}
