import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    PubSub,
    PubSubEngine,
    Resolver,
    Root,
    Subscription
} from "type-graphql";
import { ContainerInstance } from "typedi";
import { Game } from "./Types/Game";
import { GameService, GameType } from "../GameService";
import { Card } from "./Types/Card";
import { Player } from "./Types/Player";
import { GameWithAction } from "./Types/GameWithAction";
import {
    CardsPlayed,
    CardStolen,
    DeckShuffled,
    GameActionsUnion,
    PayerJoined,
    PlayerFinishedTurn
} from "./Types/GameActions";
import { Auth } from "../../Context";

type gameChangedPayload = {
    game: GameType;
    actions: Array<typeof GameActionsUnion>;
};
@Resolver(type => Game)
export class GameResolver {
    @Subscription(type => Game, {
        topics: ({ args, payload, context }) => `GAME${args.gameId}`
    })
    game(@Root() payload: gameChangedPayload, @Arg("gameId", type => ID) gameId: string): GameType {
        return payload.game;
    }

    @Subscription(type => GameWithAction, {
        topics: ({ args, payload, context }) => `GAME${args.gameId}`
    })
    gameAction(
        @Root() payload: gameChangedPayload,
        @Arg("gameId", type => ID) gameId: string
    ): GameWithAction {
        return payload;
    }

    @Mutation(type => Game)
    async playCard(
        @Arg("card", type => Card) card: Card,
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @Ctx("auth") auth: Auth | undefined,
        @PubSub() pubSub: PubSubEngine,
        @Arg("targetPlayerId", type => ID, { nullable: true }) targetPlayerId: string | undefined
    ): Promise<Game> {
        const userId = auth?.userId;
        if (!userId) {
            throw new Error("Invalid user");
        }
        // TODO check is card in my hand
        const game = await container.get(GameService).playCard({ card, gameId, targetPlayerId });

        const payload: gameChangedPayload = {
            game,
            actions: [new CardsPlayed({ id: userId }, [card])]
        };

        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @Mutation(type => Game)
    async play2Cards(
        @Arg("cards", type => [Card]) cards: Card[],
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @Ctx("auth") auth: Auth | undefined,
        @PubSub() pubSub: PubSubEngine,
        @Arg("targetPlayerId", type => ID) targetPlayerId: string
    ): Promise<Game> {
        const userId = auth?.userId;
        if (!userId) {
            throw new Error("Invalid user");
        }
        // TODO check is card in my hand
        const game = await container.get(GameService).play2Cards({ cards, gameId, targetPlayerId });
        const payload: gameChangedPayload = {
            game,
            actions: [new CardsPlayed({ id: userId }, cards)]
        };

        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @Mutation(type => Game)
    async shuffle(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @Ctx("auth") auth: Auth | undefined,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        const userId = auth?.userId;
        if (!userId) {
            throw new Error("Invalid user");
        }
        const game = await container.get(GameService).shuffleDeck(gameId);
        const payload: gameChangedPayload = {
            game,
            actions: [new DeckShuffled({ id: userId })]
        };
        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @Mutation(type => [Card])
    async showFuture(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Card[]> {
        const cards = await container.get(GameService).showFuture(gameId);
        return cards;
    }

    @Mutation(type => Game)
    async moveTurn(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance,
        @Ctx("auth") auth: Auth | undefined,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        const userId = auth?.userId;
        if (!userId) {
            throw new Error("Invalid user");
        }
        const game = await container.get(GameService).moveTurn(gameId);

        const payload: gameChangedPayload = {
            game,
            actions: [new PlayerFinishedTurn({ id: userId })]
        };
        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @Mutation(type => Game)
    async createGame(
        @Arg("roomId", type => ID) roomId: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<Game> {
        return await container.get(GameService).createGame({ roomId });
    }

    @Mutation(type => Game)
    async startGame(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("container") container: ContainerInstance
    ): Promise<Game> {
        return await container.get(GameService).startGame({ gameId });
    }

    @Mutation(type => Game)
    async joinPlayer(
        @Arg("userId", type => ID) userId: string,
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("auth") auth: Auth | undefined,
        @Ctx("container") container: ContainerInstance,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        const game = await container.get(GameService).joinPlayer({ userId, gameId });

        const payload: gameChangedPayload = {
            game,
            actions: [new PayerJoined({ id: userId })]
        };
        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @Mutation(type => Game)
    async grabRandomCard(
        @Arg("gameId", type => ID) gameId: string,
        @Ctx("auth") auth: Auth | undefined,
        @Ctx("container") container: ContainerInstance,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Game> {
        const userId = auth?.userId;
        if (!userId) {
            throw new Error("Invalid user");
        }
        const { game, targetUserId, grabbedCard } = await container
            .get(GameService)
            .grabRandomCard(gameId);

        const payload: gameChangedPayload = {
            game,
            actions: [new CardStolen({ id: userId }, { id: targetUserId }, grabbedCard)]
        };
        await pubSub.publish(`GAME${gameId}`, payload);
        return game;
    }

    @FieldResolver(type => Number)
    public drawPile(@Root() game: GameType) {
        return game.draw.length;
    }
    @FieldResolver(type => [Card])
    public drawPileDebug(@Root() game: GameType) {
        return game.draw;
    }

    @FieldResolver(type => [Card])
    public discardPile(@Root() game: GameType): Card[] {
        return game.discard.map(discard => discard.card);
    }

    @FieldResolver(type => [Player])
    public players(@Root() game: GameType): Player[] {
        return game.players;
    }
}
