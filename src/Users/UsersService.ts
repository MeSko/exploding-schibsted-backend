import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "../PersistenceService";

type UserType = {
    id: string;
    name: string;
};
@Service()
export class UsersService {
    constructor(private db: PersistenceService) {}

    public async addUser({ name }: { name: string }): Promise<UserType> {
        const id = uuidv4();
        const user = { id, name };
        await this.db.set(`user.${id}`, user);

        return user;
    }
    public async editUser({ id, name }: { id: string; name: string }): Promise<UserType> {
        const user = { id, name };
        await this.db.set(`user.${id}`, user);
        return user;
    }

    public async getUser({ id }: { id: string }): Promise<UserType | undefined> {
        return await this.db.get<UserType>(`user.${id}`);
    }

    public async allUsers() {
        const keys = await this.db.getKeys("user.*");
        return await this.db.mget<UserType>(keys);
    }
}
