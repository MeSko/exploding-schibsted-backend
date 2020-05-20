import { registerEnumType } from "type-graphql";

export enum CardTypes {
    NormalCard = 'NormalCard',
    InstantCard = 'InstantCard',
}

registerEnumType(CardTypes, {
    name: "CardTypes",
    description: "Types card, normal card you can play just during your turn, instant any time during a game",
});