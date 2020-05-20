import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    Query,
    Root,
    Subscription,
    PubSubEngine,
    Resolver
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { PlayersService } from "../PlayersService";
import { Player } from "./Types/Player";

@Resolver()
export class PlayersResolver {
    @Subscription(type => Player, {
        topics: ({ args }) => {
            return args.topic;
        }
    })
    newPlayer(
        @Root() newPlayer: Player,
        @Arg("topic", type => String) topic: string
    ) {
        return newPlayer;
    }


    @Subscription(type => Player, {
        topics: "PLAYERS"
    })
    newPlayerOnPlayers(@Root() newPlayer: Player) {
        return newPlayer;
    }

    @Query(() => [Player])
    public getPlayers(@Ctx("container") container: ContainerInstance): Promise<Player[]> {
        return container.get(PlayersService).allPlayers();
    }

    @Mutation(type => Player)
    public async addPlayer(
        @Arg("name", type => String) name: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ): Promise<Player> {
        const player = await container.get(PlayersService).addPlayer({ name });
        await pubSub.publish("PLAYERS", player);
        return player;
    }
}
