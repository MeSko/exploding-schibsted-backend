import { FieldResolver, Resolver, Root } from "type-graphql";
import { PlayerType } from "../GameService";
import { Player } from "./Types/Player";
import { User } from "../../Users/GraphQL/Types/User";
import { Hand } from "./Types/Hand";

@Resolver(type => Player)
export class PlayerResolver {
    @FieldResolver(type => User)
    public async user(@Root() player: PlayerType): Promise<User> {
        return {
            id: player.userId
        };
    }

    @FieldResolver(type => Hand)
    public async hand(@Root() player: PlayerType): Promise<Hand> {
        //TODO DO CHECK IS MY HAND ;)
        return {
            total: player.cards.length,
            cards: player.cards
        };
    }
}
