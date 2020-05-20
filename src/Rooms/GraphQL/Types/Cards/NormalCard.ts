import { Field, ID, ObjectType } from "type-graphql";
import { BaseCard } from "./BaseCard";
import { CardTypes } from "./CardTypes";

@ObjectType()
export class NormalCard extends BaseCard {
    @Field()
    public cardType: string = CardTypes['NormalCard'];
}
