import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../PersistenceService";

export type RoomType = {
    id: string;
    name: string;
    gameId?: string;
    users?: string[];
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

    public async addUser({ id, userId }: { id: string; userId: string }): Promise<RoomType> {
        const room = await this.db.get<RoomType>(`room.${id}`);
        if (!room) {
            throw new Error("No such room");
        }
        if (!room.users) {
            room.users = [];
        }
        room.users.push(userId);
        await this.db.set(`room.${id}`, room);
        return room;
    }

    public async removeUser({ id, userId }: { id: string; userId: string }): Promise<RoomType> {
        const room = await this.db.get<RoomType>(`room.${id}`);
        if (!room) {
            throw new Error("No such room");
        }
        if (!room.users) {
            room.users = [];
        }
        room.users.filter(user => user != userId);
        await this.db.set(`room.${id}`, room);
        return room;
    }

    public async editRoom({ id, name }: { id: string; name: string }): Promise<RoomType> {
        const room = await this.db.get<RoomType>(`room.${id}`);
        if (!room) {
            throw new Error("No such room");
        }
        room.name = name;
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
