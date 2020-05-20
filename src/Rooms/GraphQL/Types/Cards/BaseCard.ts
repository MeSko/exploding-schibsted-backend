import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export abstract class BaseCard {
    @Field(type => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field()
    public cardType!: string;
}
