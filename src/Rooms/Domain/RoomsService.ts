import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../../PersistenceService";

type RoomType = {
    id: string;
    name: string;
};
@Service()
export class RoomsService {
    constructor(private db: PersistenceService) {}

    public async addRoom({ name }: { name: string }): Promise<RoomType> {
        const id = uuidv4();
        const room = { id, name };
        await this.db.set(`room.${id}`, room);

        return room;
    }

    public async allRooms() {
        const keys = await this.db.getKeys("room.*");
        return await this.db.mget<RoomType>(keys);
    }
}
