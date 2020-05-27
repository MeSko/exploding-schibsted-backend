import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../PersistenceService";
import {
    Attack,
    BearCat,
    Boom,
    Card,
    Defuse,
    Favor,
    Future,
    MelonCat,
    No,
    RainbowCat,
    Shuffle,
    Skip,
    TacoCat,
    WtfCat
} from "./GraphQL/Types/Card";

export type DiscardCardType = {
    time: number;
    activeTurn: boolean;
    card: Card;
    targetPlayer?: string;
};
export type PlayerType = {
    isActive: boolean;
    isDead: boolean;
    isWinner: boolean;
    isUnderAttack: boolean;
    userId: string;
    cards: Card[];
};
export type GameType = {
    id: string;
    players: PlayerType[];
    draw: Card[];
    discard: DiscardCardType[];
    finished?: boolean;
};

export const StartCards = [
    ...Attack,
    ...No,
    ...Skip,
    ...Shuffle,
    ...Favor,
    ...Future,
    ...TacoCat,
    ...MelonCat,
    ...WtfCat,
    ...BearCat,
    ...RainbowCat
];

function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const intervalBetweenMove = 5 * 1000; // 5 seconds;

@Service()
export class GameService {
    constructor(private db: PersistenceService) {}

    public async createGame({
        usersIds,
        roomId
    }: {
        roomId: string;
        usersIds: string[];
    }): Promise<GameType> {
        const id = uuidv4();
        const defuseCards = shuffle([...Defuse]);
        const draw: Card[] = shuffle([...StartCards]);
        const players = usersIds.map(
            (userId, index): PlayerType => {
                const defuse = defuseCards.pop();
                if (!defuse) {
                    throw new Error("Ups defuse me");
                }
                const cards = [defuse, ...draw.splice(0, 7)];
                return {
                    isActive: index === 0,
                    isDead: false,
                    isWinner: false,
                    isUnderAttack: false,
                    userId,
                    cards
                };
            }
        );
        const game: GameType = {
            id,
            players,
            draw: shuffle([...draw, ...Boom.slice(0, players.length)]),
            discard: []
        };
        await this.db.set(`game.${id}`, game);
        await this.db.set(`room2game.${roomId}`, game.id);
        return game;
    }

    public async getGameInRoom(roomId: string) {
        const gameId = await this.db.get<string>(`room2game.${roomId}`);
        if (gameId) {
            return await this.db.get<GameType>(`game.${gameId}`);
        }
    }

    public async playCard({
        card,
        gameId,
        targetPlayerId
    }: {
        card: Card;
        gameId: string;
        targetPlayerId: string | undefined;
    }) {
        const game = await this.db.get<GameType>(`game.${gameId}`);
        if (!game) {
            throw new Error("No such game");
        }
        if (!this.isCardOnPlayersHand(game, card)) {
            throw new Error("No such card");
        }
        game.players.forEach(player => {
            player.cards = player.cards.filter(playerCard => playerCard !== card);
        });

        game.discard.unshift({
            time: Date.now(),
            card,
            activeTurn: true,
            targetPlayer: targetPlayerId
        });

        await this.db.set(`game.${gameId}`, game);
        return game;
    }

    public async play2Cards({
        cards,
        gameId,
        targetPlayerId
    }: {
        cards: Card[];
        gameId: string;
        targetPlayerId: string | undefined;
    }) {
        const game = await this.db.get<GameType>(`game.${gameId}`);
        if (!game) {
            throw new Error("No such game");
        }
        cards.forEach(card => {
            if (!this.isCardOnPlayersHand(game, card)) {
                throw new Error("No such card");
            }
        });
        cards.forEach(card => {
            game.players.forEach(player => {
                player.cards = player.cards.filter(playerCard => playerCard !== card);
            });
            game.discard.unshift({
                time: Date.now(),
                card,
                activeTurn: true,
                targetPlayer: targetPlayerId
            });
        });

        await this.db.set(`game.${gameId}`, game);
        return game;
    }

    public async showFuture(gameId: string) {
        const game = await this.doActionOnGame(gameId);
        if (!this.canSeeFuture(game)) {
            throw new Error("Can't shuffle");
        }
        const cards = game.draw.slice(0, 3);
        return cards;
    }

    public async shuffleDeck(gameId: string) {
        const game = await this.doActionOnGame(gameId);
        if (!this.canShuffle(game)) {
            throw new Error("Can't shuffle");
        }
        game.draw = shuffle(game.draw);
        await this.db.set(`game.${gameId}`, game);
        return game;
    }

    public async moveTurn(gameId: string) {
        const game = await this.doActionOnGame(gameId);
        console.log("moveTurn", game);
        if (!this.canSkip(game)) {
            this.pickTop(game);
        }
        if (game.players.filter(player => player.isWinner)) {
            game.finished = true;
            return game;
        }
        this.moveTurnToNextPlayer(game);
        game.discard = game.discard.map(discard => ({ ...discard, activeTurn: false }));
        await this.db.set(`game.${gameId}`, game);
        return game;
    }

    public async grabRandomCard(gameId: string) {
        const game = await this.doActionOnGame(gameId);
        if (!this.canGrabRandomCard(game)) {
            throw new Error("Can't grab random card");
        }
        const playedCards = game.discard
            .filter(discard => discard.activeTurn)
            .filter(card => !!card.targetPlayer);

        const targetUserId = playedCards[0].targetPlayer;

        let grabbedCard: Card;
        // Draw one card from attacked player
        game.players.forEach(player => {
            if (player.userId === targetUserId) {
                grabbedCard = player.cards[Math.floor(Math.random() * player.cards.length)];
                player.cards = player.cards.filter(card => card !== grabbedCard);
            }
        });

        // Push drown card for attacking player
        game.players.forEach(player => {
            if (player.isActive) {
                player.cards.push(grabbedCard);
            }
        });
        await this.db.set(`game.${gameId}`, game);
        return game;
    }

    public canSeeFuture(game: GameType) {
        return this.isInDiscardedWithoutNoBefore(game, Future);
    }
    public canShuffle(game: GameType) {
        return this.isInDiscardedWithoutNoBefore(game, Shuffle);
    }
    public canSkip(game: GameType) {
        return (
            this.isInDiscardedWithoutNoBefore(game, Skip) ||
            this.isInDiscardedWithoutNoBefore(game, Attack)
        );
    }
    public canGrabRandomCard(game: GameType) {
        return (
            this.isInDiscardedWithoutNoBefore(game, MelonCat) ||
            this.isInDiscardedWithoutNoBefore(game, WtfCat) ||
            this.isInDiscardedWithoutNoBefore(game, RainbowCat) ||
            this.isInDiscardedWithoutNoBefore(game, BearCat) ||
            this.isInDiscardedWithoutNoBefore(game, TacoCat)
        );
    }

    private isCardOnPlayersHand(game: GameType, card: Card) {
        return !!game.players.find(player => player.cards.includes(card));
    }
    private async doActionOnGame(gameId: string) {
        const game = await this.db.get<GameType>(`game.${gameId}`);
        if (!game) {
            throw new Error("No such game");
        }
        const playedCards = game.discard.filter(discard => discard.activeTurn);
        const lastPlayedTime = Math.max(...playedCards.map(playedCard => playedCard.time));
        if (lastPlayedTime + intervalBetweenMove > Date.now()) {
            throw new Error("Not too fast ?!");
        }
        return game;
    }

    private pickTop(game: GameType) {
        const topCard = game.draw.shift();
        console.log("pickTop", topCard);
        if (!topCard) {
            throw new Error("Where are my cards ?!");
        }
        if (Boom.includes(topCard)) {
            this.defuseBoom(topCard, game);
        } else {
            console.log("player got card before", game);
            this.getActivePlayer(game).cards.push(topCard);
            console.log("player got card after", game);
        }
    }

    private getLastDiscardedWithoutNoBefore(game: GameType, cardKind: Card[]) {
        const discardedCards = game.discard.filter(discard => discard.activeTurn);
        let discarded: DiscardCardType | undefined;
        let ignoreNextCard = false;
        discardedCards.forEach(discardedCard => {
            if (ignoreNextCard) {
                ignoreNextCard = false;
                return;
            }
            if (cardKind.includes(discardedCard.card)) {
                discarded = discardedCard;
                return;
            }
            if (No.includes(discardedCard.card)) {
                ignoreNextCard = true;
                return;
            }
        });

        return discarded;
    }

    private isInDiscardedWithoutNoBefore(game: GameType, cardKind: Card[]) {
        const discardedCards = game.discard.filter(discard => discard.activeTurn);
        let isThere = false;
        let ignoreNextCard = false;
        discardedCards.forEach(discardedCard => {
            if (ignoreNextCard) {
                ignoreNextCard = false;
                return;
            }
            if (cardKind.includes(discardedCard.card)) {
                isThere = true;
                return;
            }
            if (No.includes(discardedCard.card)) {
                ignoreNextCard = true;
                return;
            }
        });

        return isThere;
    }

    private defuseBoom(topCard: Card, game: GameType) {
        console.log("defuseBoom", topCard);
        const defusedCardIndex = this.getActivePlayer(game).cards.findIndex(card =>
            Defuse.includes(card)
        );
        if (defusedCardIndex === -1) {
            this.getActivePlayer(game).isDead = true;
            console.log("dead", game);
            const deadPlayers = game.players.filter(player => player.isDead);
            //Set winner
            if (deadPlayers.length + 1 === game.players.length) {
                game.players
                    .filter(player => !player.isDead)
                    .forEach(player => {
                        player.isWinner = true;
                    });
                console.log("winner", game);
            }
        } else {
            const defuseCard = this.getActivePlayer(game).cards.splice(defusedCardIndex, 1);
            const randomIndex = Math.floor(Math.random() * game.draw.length);
            game.draw.splice(randomIndex, 0, topCard);
            game.discard.unshift({
                time: Date.now(),
                card: defuseCard[0],
                activeTurn: false
            });
        }
    }

    private getActivePlayer(game: GameType) {
        const activePlayer = game.players.find(player => player.isActive);
        if (!activePlayer) {
            throw new Error("Where are my player");
        }
        return activePlayer;
    }

    private moveTurnToNextPlayer(game: GameType) {
        let attackDiscardedCard = this.getLastDiscardedWithoutNoBefore(game, Attack);
        if (game.players.filter(player => player.isUnderAttack && !player.isDead)) {
            game.players = game.players.map(player => ({
                ...player,
                isUnderAttack: false
            }));
            //don't move index as this is additional turn after attack card
            return;
        }
        const activePlayerIndex = game.players.findIndex(player => player.isActive);
        let nextActivePlayerIndex: number;
        if (attackDiscardedCard === undefined) {
            let lookingForPlayer = true;
            while(lookingForPlayer) {
                nextActivePlayerIndex = (activePlayerIndex + 1) % game.players.length;
                if(game.players[nextActivePlayerIndex].isDead === false) {
                    lookingForPlayer = false;
                }
            }
            game.players = game.players.map(player => ({
                ...player,
                isUnderAttack: false
            }));
        } else {
            let nextPlayerId = attackDiscardedCard!.targetPlayer;
            nextActivePlayerIndex = game.players.findIndex(
                player => player.userId === nextPlayerId
            );
            game.players = game.players.map((player, index) => ({
                ...player,
                isUnderAttack: index === nextActivePlayerIndex
            }));
        }
        game.players = game.players.map((player, index) => ({
            ...player,
            isActive: index === nextActivePlayerIndex
        }));
    }
}
