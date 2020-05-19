import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Room {
    @Field(type => ID)
    public id!: string;

    @Field()
    public name!: string;
}
