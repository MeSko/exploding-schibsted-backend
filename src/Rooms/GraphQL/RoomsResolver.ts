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
import { RoomsService, RoomType } from "../RoomsService";
import { Room } from "./Types/Room";
import { Game } from "../../Game/GraphQL/Types/Game";
import { GameService, GameType } from "../../Game/GameService";
import { User } from "../../Users/GraphQL/Types/User";

@Resolver(type => Room)
export class RoomsResolver {
    @Subscription(type => Room, {
        topics: "ROOMS"
    })
    newRoom(@Root() newRoom: Room) {
        return newRoom;
    }

    @Subscription(type => Room, {
        topics: ({ args, payload, context }) => `ROOM${args.roomId}`
    })
    room(@Root() room: RoomType, @Arg("roomId", type => ID) roomId: string) {
        return room;
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

    @FieldResolver(type => [User])
    public async users(
        @Root() room: RoomType,
        @Ctx("container") container: ContainerInstance
    ): Promise<User[]> {
        return room.users
            ? room.users.map(userId => ({
                  id: userId
              }))
            : [];
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
    public async addUserToRoom(
        @Arg("id", type => ID) id: string,
        @Arg("userId", type => ID) userId: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ): Promise<Room> {
        const room = await container.get(RoomsService).addUser({ id, userId });
        await pubSub.publish(`ROOM${id}`, room);
        return room;
    }

    @Mutation(type => Room)
    public async removeUserToRoom(
        @Arg("id", type => ID) id: string,
        @Arg("userId", type => ID) userId: string,
        @PubSub() pubSub: PubSubEngine,
        @Ctx("container") container: ContainerInstance
    ): Promise<Room> {
        const room = await container.get(RoomsService).removeUser({ id, userId });
        await pubSub.publish(`ROOM${id}`, room);
        return room;
    }
}
