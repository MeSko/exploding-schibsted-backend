import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Game {
    @Field(type => ID)
    public id!: string;
}
