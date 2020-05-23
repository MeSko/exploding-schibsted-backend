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
    discard: Card[];
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
}
