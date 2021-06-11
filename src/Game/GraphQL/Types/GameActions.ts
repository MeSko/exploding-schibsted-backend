import { createUnionType, ObjectType, Field } from "type-graphql";
import { User } from "../../../Users/GraphQL/Types/User";
import { Card } from "./Card";

@ObjectType()
export class DeckShuffled {
    constructor(who: User) {
        this.who = who;
    }
    @Field(type => User)
    readonly who!: User;
}

@ObjectType()
export class PlayerFinishedTurn {
    constructor(who: User) {
        this.who = who;
    }
    @Field(type => User)
    readonly who!: User;
}

@ObjectType()
export class PlayerDied {
    constructor(who: User) {
        this.who = who;
    }
    @Field(type => User)
    readonly who!: User;
}

@ObjectType()
export class CardsPlayed {
    constructor(who: User, cards: Card[]) {
        this.who = who;
        this.cards = cards;
    }
    @Field(type => User)
    readonly who!: User;

    @Field(type => [Card])
    readonly cards!: Card[];
}

@ObjectType()
export class PayerJoined {
    @Field(type => User)
    readonly who!: User;

    constructor(who: User) {
        this.who = who;
    }
}

@ObjectType()
export class CardStolen {
    @Field(type => User)
    readonly from!: User;

    @Field(type => User)
    readonly to!: User;

    @Field(type => Card, { nullable: true })
    readonly card?: Card;

    constructor(from: User, to: User, card?: Card) {
        this.from = from;
        this.to = to;
        this.card = card;
    }
}

@ObjectType()
export class Exploded {
    @Field(type => User)
    readonly who!: User;
}

@ObjectType()
export class PlayerSaved {
    @Field(type => User)
    readonly who!: User;
}

@ObjectType()
export class PlayerWon {
    @Field(type => User)
    readonly who!: User;
}

type ActionTypes = [
    typeof DeckShuffled,
    typeof CardsPlayed,
    typeof PayerJoined,
    typeof PlayerFinishedTurn,
    typeof CardStolen,
    typeof Exploded,
    typeof PlayerSaved,
    typeof PlayerDied,
    typeof PlayerWon
];
export const GameActionsUnion = createUnionType({
    name: "GameActions", // the name of the GraphQL union
    types: () =>
        [
            DeckShuffled,
            CardsPlayed,
            PayerJoined,
            PlayerFinishedTurn,
            CardStolen,
            Exploded,
            PlayerSaved,
            PlayerDied,
            PlayerWon
        ] as ActionTypes // function that returns tuple of object types classes
});
