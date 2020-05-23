import { Service } from "typedi";
import { PersistenceService } from "../../PersistenceService";
import { v4 as uuidv4 } from "uuid";
import { Player } from "../../Players/GraphQL/Types/Player";
import { BaseCard } from "../../Rooms/GraphQL/Types/Cards/BaseCard";

type GameType = {
    id: string;
    name: string;
    players: Array<Player>;
    playerTurn?: Player;
    deck: Array<BaseCard>;
    discardPile: Array<BaseCard>
};

@Service()
export class GamesService {
    constructor(private db: PersistenceService) {
    }

    public async addGame({ name }: { name: string }): Promise<GameType> {
        const id = uuidv4();
        const game = { id, name, players: [], playerTurn: undefined, deck: [], discardPile: [] };
        await this.db.set(`game.${id}`, game);

        return game;
    }

    public async allGames() {
        const keys = await this.db.getKeys("game.*");
        return await this.db.mget<GameType>(keys);
    }
}