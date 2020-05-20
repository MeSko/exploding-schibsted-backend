import { Field, ID, ObjectType } from "type-graphql";
import { Player } from "./Player";
import { BaseCard } from "./Cards/BaseCard";

@ObjectType()
export class Game {
    @Field(type => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field(type => [Player])
    public players: Array<Player> = [];

    @Field(type => Player)
    public playerTurn?: Player;

    @Field(type => BaseCard)
    public deck: Array<BaseCard> = [];

    @Field(type => BaseCard)
    public discardPile: Array<BaseCard> = [];
}
