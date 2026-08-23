import {GetGamesHandler} from "@/features/home/game/queries/get-games/get-games.handler";
import {GetGamesQuery} from "@/features/home/game/queries/get-games/get-games.query";
import {GetGamesRequest} from "@/features/home/game/queries/get-games/get-games.request";
import {Game} from "@/features/home/entities/game/game.entity";
import {GameType} from "@/core/enums/game-type/game-type.enum";

describe("GetGamesHandler", () => {
    let handler: GetGamesHandler;
    let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

    beforeEach(() => {
        cache = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn().mockResolvedValue(undefined),
        };
        handler = new GetGamesHandler(cache as any);
    });

    afterEach(() => jest.restoreAllMocks());

    it("returns the cached recent games on a default (no-limit) query when a cache hit exists", async () => {
        cache.get.mockResolvedValue([{id: 1, whitePlayerName: "Cached"}]);
        const findSpy = jest.spyOn(Game, "find");

        const payload: GetGamesRequest = {};
        const result = await handler.execute(new GetGamesQuery(payload));

        expect(result).toEqual([{id: 1, whitePlayerName: "Cached"}]);
        expect(findSpy).not.toHaveBeenCalled();
    });

    it("returns games ordered by playedAt desc with flattened player summaries, defaulting to top 5", async () => {
        const findSpy = jest.spyOn(Game, "find").mockResolvedValue([
            {
                id: 1,
                whitePlayerId: 1,
                blackPlayerId: 2,
                whitePlayer: {name: "Magnus Carlsen", avatarUrl: null, classicalRating: 2830, rapidRating: 2800, blitzRating: 2900},
                blackPlayer: {name: "Hikaru Nakamura", avatarUrl: null, classicalRating: 2780, rapidRating: 2750, blitzRating: 2850},
                whiteScore: 1,
                blackScore: 0,
                gameType: GameType.Blitz,
                movesCount: 40,
                playedAt: new Date("2026-08-01"),
            },
        ] as any);

        const payload: GetGamesRequest = {};
        const result = await handler.execute(new GetGamesQuery(payload));

        expect(findSpy).toHaveBeenCalledWith({
            relations: {whitePlayer: true, blackPlayer: true},
            order: {playedAt: "DESC"},
            take: 5,
        });
        expect(result).toHaveLength(1);
        expect(result[0].whitePlayerName).toBe("Magnus Carlsen");
        expect(result[0].blackPlayerRating).toBe(2850);
        expect(cache.set).toHaveBeenCalledWith("games:recent", result);
    });

    it("picks the rating matching the game's gameType (rapid/blitz), falling back to classicalRating for bullet", async () => {
        const player = {
            name: "Player",
            avatarUrl: null,
            classicalRating: 2000,
            rapidRating: 1900,
            blitzRating: 2100,
        };
        const baseGame = {
            id: 1,
            whitePlayerId: 1,
            blackPlayerId: 2,
            whitePlayer: player,
            blackPlayer: player,
            whiteScore: 1,
            blackScore: 0,
            movesCount: 40,
            playedAt: new Date("2026-08-01"),
        };

        jest.spyOn(Game, "find").mockResolvedValue([
            {...baseGame, gameType: GameType.Rapid},
        ] as any);
        let result = await handler.execute(new GetGamesQuery({}));
        expect(result[0].whitePlayerRating).toBe(1900);

        jest.spyOn(Game, "find").mockResolvedValue([
            {...baseGame, gameType: GameType.Blitz},
        ] as any);
        result = await handler.execute(new GetGamesQuery({}));
        expect(result[0].whitePlayerRating).toBe(2100);

        jest.spyOn(Game, "find").mockResolvedValue([
            {...baseGame, gameType: GameType.Bullet},
        ] as any);
        result = await handler.execute(new GetGamesQuery({limit: 1}));
        expect(result[0].whitePlayerRating).toBe(2000);
    });

    it("respects a custom limit and does not use or populate the default cache", async () => {
        const findSpy = jest.spyOn(Game, "find").mockResolvedValue([]);

        const payload: GetGamesRequest = {limit: 3};
        await handler.execute(new GetGamesQuery(payload));

        expect(findSpy).toHaveBeenCalledWith({
            relations: {whitePlayer: true, blackPlayer: true},
            order: {playedAt: "DESC"},
            take: 3,
        });
        expect(cache.get).not.toHaveBeenCalled();
        expect(cache.set).not.toHaveBeenCalled();
    });
});
