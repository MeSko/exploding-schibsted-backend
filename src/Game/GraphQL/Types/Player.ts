import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Player {
    @Field()
    public isDead: boolean = false;

    @Field()
    public isWinner: boolean = false;

    @Field()
    public isActive: boolean = false;
}
