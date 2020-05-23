import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    Query,
    Root,
    Subscription,
    PubSubEngine,
    Resolver,
    FieldResolver, ID
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { UsersService } from "../UsersService";
import { User } from "./Types/User";

@Resolver(type => User)
export class UsersResolver {
    @FieldResolver(type => String)
    public async name(@Root() user: User, @Ctx("container") container: ContainerInstance) {
        const userData = await container.get(UsersService).getUser(user.id);
        return userData?.name || "";
    }

    @Mutation(type => User)
    public async addUser(
        @Arg("name", type => String) name: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<User> {
        return await container.get(UsersService).addUser({ name });
    }

    @Mutation(type => User)
    public async editUser(
        @Arg("id", type => ID) id: string,
        @Arg("name", type => String) name: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<User> {
        return await container.get(UsersService).editUser({ id, name });
    }
}
