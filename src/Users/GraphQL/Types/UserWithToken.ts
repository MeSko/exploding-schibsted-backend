import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class UserWithToken {
    @Field(type => User)
    public user!: User;

    @Field()
    public token!: string;
}
