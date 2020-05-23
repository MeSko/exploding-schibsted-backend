import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    PubSub,
    PubSubEngine,
    Resolver,
    Root,
    Subscription
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { Game } from "./Types/Game";
import { GameService, GameType } from "../GameService";
import { Card } from "./Types/Card";
import { Player } from "./Types/Player";

@Resolver(type => Game)
export class GameResolver {
    @Subscription(type => Game, {
        topics: ({ args, payload, context }) => `GAME${args.gameId}`
    })
    game(@Root() game: GameType, @Arg("gameId", type => ID) gameId: string) {
        return game;
    }

    @Mutation(type => Game)
    async playCard(
        @Arg("card", type => Card) card: Card,
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        // TODO check is card in my hand
        const game = await container.get(GameService).playCard({ card, gameId });
        await pubSub.publish(`GAME${gameId}`, game);
        return game;
    }

    @Mutation(type => Game)
    async moveTurn(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        const game = await container.get(GameService).moveTurn(gameId);
        await pubSub.publish(`GAME${gameId}`, game);
        return game;
    }

    @Mutation(type => Game)
    async createGame(
        @Arg("usersIds", type => [ID]) usersIds: string[],
        @Arg("roomId", type => ID) roomId: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<Game> {
        return await container.get(GameService).createGame({ usersIds, roomId });
    }

    @FieldResolver(type => Number)
    public drawPile(@Root() game: GameType) {
        return game.draw.length;
    }

    @FieldResolver(type => [Card])
    public discardPile(@Root() game: GameType): Card[] {
        return game.discard.map(discard => discard.card);
    }

    @FieldResolver(type => [Player])
    public players(@Root() game: GameType): Player[] {
        return game.players;
    }
}
