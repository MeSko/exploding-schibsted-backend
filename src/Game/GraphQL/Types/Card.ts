import { registerEnumType } from "type-graphql";

export enum Card {
    ATTACK1 = "ATTACK1",
    ATTACK2 = "ATTACK2",
    ATTACK3 = "ATTACK3",
    ATTACK4 = "ATTACK4",
    BOOM1 = "BOOM1",
    BOOM2 = "BOOM2",
    BOOM3 = "BOOM3",
    BOOM4 = "BOOM4",
    DEFUSE1 = "DEFUSE1",
    DEFUSE2 = "DEFUSE2",
    DEFUSE3 = "DEFUSE3",
    DEFUSE4 = "DEFUSE4",
    DEFUSE5 = "DEFUSE5",
    DEFUSE6 = "DEFUSE6",
    NO1 = "NO1",
    NO2 = "NO2",
    NO3 = "NO3",
    NO4 = "NO4",
    SKIP1 = "SKIP1",
    SKIP2 = "SKIP2",
    SKIP3 = "SKIP3",
    SKIP4 = "SKIP4",
    FAVOR1 = "FAVOR1",
    FAVOR2 = "FAVOR2",
    FAVOR3 = "FAVOR3",
    FAVOR4 = "FAVOR4",
    SHUFFLE1 = "SHUFFLE1",
    SHUFFLE2 = "SHUFFLE2",
    SHUFFLE3 = "SHUFFLE3",
    SHUFFLE4 = "SHUFFLE4",
    FUTURE1 = "FUTURE1",
    FUTURE2 = "FUTURE2",
    FUTURE3 = "FUTURE3",
    FUTURE4 = "FUTURE4",
    FUTURE5 = "FUTURE5",
    TACOCAT1 = "TACOCAT1",
    TACOCAT2 = "TACOCAT2",
    TACOCAT3 = "TACOCAT3",
    TACOCAT4 = "TACOCAT4",
    MELONCAT1 = "MELONCAT1",
    MELONCAT2 = "MELONCAT2",
    MELONCAT3 = "MELONCAT3",
    MELONCAT4 = "MELONCAT4",
    WTFCAT1 = "WTFCAT1",
    WTFCAT2 = "WTFCAT2",
    WTFCAT3 = "WTFCAT3",
    WTFCAT4 = "WTFCAT4",
    BEARCAT1 = "BEARCAT1",
    BEARCAT2 = "BEARCAT2",
    BEARCAT3 = "BEARCAT3",
    BEARCAT4 = "BEARCAT4",
    RAINBOWCAT1 = "RAINBOWCAT1",
    RAINBOWCAT2 = "RAINBOWCAT2",
    RAINBOWCAT3 = "RAINBOWCAT3",
    RAINBOWCAT4 = "RAINBOWCAT4"
}

export const Attack = [Card.ATTACK1, Card.ATTACK2, Card.ATTACK3, Card.ATTACK4];

export const Boom = [Card.BOOM1, Card.BOOM2, Card.BOOM3, Card.BOOM4];
export const Defuse = [
    Card.DEFUSE1,
    Card.DEFUSE2,
    Card.DEFUSE3,
    Card.DEFUSE4,
    Card.DEFUSE5,
    Card.DEFUSE6
];

export const No = [Card.NO1, Card.NO2, Card.NO3, Card.NO4];

export const Skip = [Card.SKIP1, Card.SKIP2, Card.SKIP3, Card.SKIP4];

export const Favor = [Card.FAVOR1, Card.FAVOR2, Card.FAVOR3, Card.FAVOR4];
export const Shuffle = [Card.SHUFFLE1, Card.SHUFFLE2, Card.SHUFFLE3, Card.SHUFFLE4];
export const Future = [Card.FUTURE1, Card.FUTURE2, Card.FUTURE3, Card.FUTURE4, Card.FUTURE5];

export const TacoCat = [Card.TACOCAT1, Card.TACOCAT2, Card.TACOCAT3, Card.TACOCAT4];

export const MelonCat = [Card.MELONCAT1, Card.MELONCAT2, Card.MELONCAT3, Card.MELONCAT4];
export const WtfCat = [Card.WTFCAT1, Card.WTFCAT2, Card.WTFCAT3, Card.WTFCAT4];
export const BearCat = [Card.BEARCAT1, Card.BEARCAT2, Card.BEARCAT3, Card.BEARCAT4];
export const RainbowCat = [Card.RAINBOWCAT1, Card.RAINBOWCAT2, Card.RAINBOWCAT3, Card.RAINBOWCAT4];

registerEnumType(Card, {
    name: "Card"
});
