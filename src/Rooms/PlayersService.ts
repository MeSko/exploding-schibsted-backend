import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../PersistenceService";
import { BaseCard } from "./GraphQL/Types/Cards/BaseCard";

type PlayerType = {
    id: string;
    name: string;
    handCard: Array<BaseCard>;
};
@Service()
export class PlayersService {
    constructor(private db: PersistenceService) {}

    public async addPlayer({ name }: { name: string }): Promise<PlayerType> {
        const id = uuidv4();
        const player = { id, name, handCard: [] };
        await this.db.set(`player.${id}`, player);

        return player;
    }

    public async allPlayers() {
        const keys = await this.db.getKeys("player.*");
        return await this.db.mget<PlayerType>(keys);
    }
}
