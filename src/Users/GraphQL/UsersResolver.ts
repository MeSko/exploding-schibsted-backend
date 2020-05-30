import { Arg, Ctx, Mutation, Query, Root, Resolver, FieldResolver, ID } from "type-graphql";
import { ContainerInstance } from "typedi";
import { UsersService } from "../UsersService";
import { User } from "./Types/User";
import { Auth } from "../../Context";
import { UserWithToken } from "./Types/UserWithToken";
import { AuthorizationService } from "../../Authorization/AuthorizationService";

@Resolver(type => User)
export class UsersResolver {
    @FieldResolver(type => String)
    public async name(@Root() user: User, @Ctx("container") container: ContainerInstance) {
        const userData = await container.get(UsersService).getUser({ id: user.id });
        return userData?.name || "";
    }

    @Query(() => UserWithToken, { nullable: true })
    public async whoami(
        @Ctx("auth") auth: Auth | undefined,
        @Ctx("container") container: ContainerInstance
    ): Promise<UserWithToken | undefined> {
        if (!auth?.userId) {
            return;
        }
        const token = await container
            .get(AuthorizationService)
            .generateToken({ userId: auth?.userId });
        return {
            token,
            user: { id: auth.userId }
        };
    }
    @Query(() => [User])
    public getUsers(@Ctx("container") container: ContainerInstance): Promise<User[]> {
        return container.get(UsersService).allUsers();
    }

    @Mutation(type => UserWithToken)
    public async addUser(
        @Arg("name", type => String) name: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<UserWithToken> {
        const user = await container.get(UsersService).addUser({ name });
        const token = await container.get(AuthorizationService).generateToken({ userId: user.id });
        return {
            token,
            user: {
                id: user.id
            }
        };
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
