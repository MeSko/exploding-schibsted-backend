import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    Query,
    Root,
    Subscription,
    PubSubEngine,
    Resolver
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { RoomsService } from "../RoomsService";
import { Room } from "./Types/Room";

@Resolver()
export class RoomsResolver {
    @Subscription(type => Room, {
        topics: "ROOMS"
    })
    newRoom(@Root() newRoom: Room) {
        return newRoom;
    }

    @Query(() => [Room])
    public getRooms(@Ctx("container") container: ContainerInstance): Promise<Room[]> {
        return container.get(RoomsService).allRooms();
    }

    @Query(type => String)
    public test() {
        return "test";
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
}
