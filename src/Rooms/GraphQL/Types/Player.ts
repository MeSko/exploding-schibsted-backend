import { Field, ID, ObjectType } from "type-graphql";
import { BaseCard } from "./Cards/BaseCard";

@ObjectType()
export class Player {
    @Field(type => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field(type => [BaseCard])
    public handCard: Array<BaseCard> = [];
}
