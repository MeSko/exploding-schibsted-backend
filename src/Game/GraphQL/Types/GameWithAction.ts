import { Field, ID, ObjectType } from "type-graphql";
import { Game } from "./Game";
import { GameActionsUnion } from "./GameActions";

@ObjectType()
export class GameWithAction {
    @Field(type => Game)
    public game!: Game;

    @Field(type => GameActionsUnion)
    public actions!: Array<typeof GameActionsUnion>;
}
