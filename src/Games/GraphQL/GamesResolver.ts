import { Arg, Ctx, Mutation, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";
import { Game } from "./Types/Game";
import { ContainerInstance } from "typedi";
import { GamesService } from "../Domain/GamessService";

@Resolver()
export class GamesResolver {
    @Subscription(type => Game, {
        topics: "GAMES"
    })
    newGame(@Root() newGame: Game) {
        return newGame;
    }

    @Query(() => [Game])
    public getGames(@Ctx("container") container: ContainerInstance): Promise<Game[]> {
        return container.get(GamesService).allGames();
    }

    @Query(type => String)
    public test() {
        return "test";
    }

    @Mutation(type => Game)
    public async addGame(
        @Arg("name", type => String) name: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ): Promise<Game> {
        const game = await container.get(GamesService).addGame({ name });
        await pubSub.publish("GAMES", game);
        return game;
    }
}