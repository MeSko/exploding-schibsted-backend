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
    userId: string;
    cards: Card[];
};
export type GameType = {
    id: string;
    players: PlayerType[];
    draw: Card[];
    discard: DiscardCardType[];
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

    public async playCard({ card, gameId, targetPlayerId }: { card: Card; gameId: string, targetPlayerId: string | undefined }) {
        const game = await this.db.get<GameType>(`game.${gameId}`);
        if (!game) {
            throw new Error("No such game");
        }
        game.players.forEach(player => {
            player.cards = player.cards.filter(playerCard => playerCard !== card);
        });

        game.discard.push({
            time: Date.now(),
            card,
            activeTurn: true,
            targetPlayer: targetPlayerId
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
        if (!this.canSkip(game)) {
            this.pickTop(game);
        }
        this.moveTurnToNextPlayer(game);
        game.discard = game.discard.map(discard => ({ ...discard, activeTurn: false }));
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
        return this.isInDiscardedWithoutNoBefore(game, Skip);
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
        const topCard = game.draw.pop();
        if (!topCard) {
            throw new Error("Where are my cards ?!");
        }
        if (Boom.includes(topCard)) {
            this.defuseBoom(topCard, game);
        } else {
            this.getActivePlayer(game).cards.push(topCard);
        }
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
        const defusedCardIndex = this.getActivePlayer(game).cards.findIndex(card =>
            Defuse.includes(card)
        );
        if (defusedCardIndex === -1) {
            this.getActivePlayer(game).isDead = true;
        } else {
            const defuseCard = this.getActivePlayer(game).cards.splice(defusedCardIndex, 1);
            game.discard.push({
                time: Date.now(),
                card: topCard,
                activeTurn: false
            });
            game.discard.push({
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
        const activePlayerIndex = game.players.findIndex(player => player.isActive);
        const nextActivePlayerIndex = (activePlayerIndex + 1) % game.players.length;
        game.players = game.players.map((player, index) => ({
            ...player,
            isActive: index === nextActivePlayerIndex
        }));
    }
}
