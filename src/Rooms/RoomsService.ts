import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../PersistenceService";
import { UserType } from "../Users/UsersService";

type RoomType = {
    id: string;
    name: string;
    gameId?: string;
    users?: UserType[];
};

export function checkIsDefined<T>({obj, name}: {obj: T, name: string}): T {
    if (obj === undefined) {
        throw new Error(`${name} is not defined`)
    }
    
    return obj;
}

@Service()
export class RoomsService {
    constructor(private db: PersistenceService) {}

    public async addRoom({ name }: { name: string }): Promise<RoomType> {
        const id = uuidv4();
        const room = { id, name };
        await this.db.set(`room.${id}`, room);

        return room;
    }

    public async editRoom({ id, name }: { id: string; name: string }): Promise<RoomType> {
        const room = { id, name };
        await this.db.set(`room.${id}`, room);

        return room;
    }

    public async getRoom({ id }: { id: string }): Promise<RoomType | undefined> {
        return await this.db.get<RoomType>(`room.${id}`);
    }
    public async allRooms() {
        const keys = await this.db.getKeys("room.*");
        return await this.db.mget<RoomType>(keys);
    }
}
