import { Field, Int, ObjectType } from "type-graphql";
import { Card } from "./Card";

@ObjectType()
export class Hand {
    @Field(type => Int)
    public total!: number;

    @Field(type => [Card])
    public cards!: Card[];
}
