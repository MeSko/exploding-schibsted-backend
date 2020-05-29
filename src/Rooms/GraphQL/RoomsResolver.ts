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
    FieldResolver,
    ID
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { checkIsDefined, RoomsService } from "../RoomsService";
import { Room } from "./Types/Room";
import { Game } from "../../Game/GraphQL/Types/Game";
import { GameService } from "../../Game/GameService";
import { UsersService } from "../../Users/UsersService";

@Resolver(type => Room)
export class RoomsResolver {
    @Subscription(type => Room, {
        topics: "ROOMS"
    })
    newRoom(@Root() newRoom: Room) {
        return newRoom;
    }

    @Query(() => Room, { nullable: true })
    public getRoom(
        @Arg("id", type => ID) id: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<Room | undefined> {
        return container.get(RoomsService).getRoom({ id });
    }

    @Query(() => [Room])
    public getRooms(@Ctx("container") container: ContainerInstance): Promise<Room[]> {
        return container.get(RoomsService).allRooms();
    }

    @FieldResolver(type => Game, { nullable: true })
    public async game(
        @Root() room: Room,
        @Ctx("container") container: ContainerInstance
    ): Promise<Game | undefined> {
        return await container.get(GameService).getGameInRoom(room.id);
    }

    @Mutation(type => Room)
    public async addRoom(
        @Arg("name", type => String) name: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ): Promise<Room> {
        const room = await container.get(RoomsService).addRoom({ name });
        await pubSub.publish("ROOMS", room);
        return room;
    }

    @Mutation(type => Room)
    public async joinUserToRoom(
        @Arg("roomId", type => String) roomId: string,
        @Arg("userId", type => String) userId: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ) {
        let room = await container.get(RoomsService).getRoom({ id: roomId });
        let user = await container.get(UsersService).getUser({ id: userId });
        user = checkIsDefined({obj: user, name: "User"});
        // if (user === undefined) {
        //     throw new Error("User not found");
        // }
        if (room.users === undefined) {
            room.users = [];
        }
        room.users.push(user);
    }
}
