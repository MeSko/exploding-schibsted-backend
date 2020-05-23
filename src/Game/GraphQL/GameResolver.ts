import { Arg, Ctx, FieldResolver, ID, Mutation, Resolver, Root } from "type-graphql";
import { ContainerInstance } from "typedi";
import { Game } from "./Types/Game";
import { GameService, GameType } from "../GameService";
import { Card } from "./Types/Card";
import { Player } from "./Types/Player";

@Resolver(type => Game)
export class GameResolver {
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
        return game.discard;
    }

    @FieldResolver(type => [Player])
    public players(@Root() game: GameType): Player[] {
        return game.players;
    }
}
