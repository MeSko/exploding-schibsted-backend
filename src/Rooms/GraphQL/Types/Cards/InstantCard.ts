import { Field, ID, ObjectType } from "type-graphql";
import { BaseCard } from "./BaseCard";
import { CardTypes } from "./CardTypes";

@ObjectType()
export class InstantCard extends BaseCard {
    @Field()
    public cardType: string = CardTypes['InstantCard'];
}
