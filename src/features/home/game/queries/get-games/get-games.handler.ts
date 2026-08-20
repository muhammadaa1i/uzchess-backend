import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetGamesQuery} from "@/features/home/game/queries/get-games/get-games.query";
import {Game} from "@/features/home/entities/game/game.entity";
import {plainToInstance} from "class-transformer";
import {GetGamesResponse} from "@/features/home/game/queries/get-games/get-games.response";
import {Cache} from "@nestjs/cache-manager";
import {GAMES_RECENT_CACHE_KEY} from "@/features/home/game/game.cache";

@QueryHandler(GetGamesQuery)
export class GetGamesHandler implements IQueryHandler<GetGamesQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetGamesQuery) {
        const isDefaultQuery = query.payload.limit === undefined;

        if (isDefaultQuery) {
            const cached = await this.cache.get<GetGamesResponse[]>(
                GAMES_RECENT_CACHE_KEY,
            );
            if (cached) return cached;
        }

        const games = await Game.find({
            relations: {whitePlayer: true, blackPlayer: true},
            order: {playedAt: "DESC"},
            take: query.payload.limit ?? 5,
        });

        const result = plainToInstance(
            GetGamesResponse,
            games.map((game) => ({
                ...game,
                whitePlayerName: game.whitePlayer.name,
                whitePlayerAvatarUrl: game.whitePlayer.avatarUrl,
                whitePlayerRating: game.whitePlayer.classicalRating,
                blackPlayerName: game.blackPlayer.name,
                blackPlayerAvatarUrl: game.blackPlayer.avatarUrl,
                blackPlayerRating: game.blackPlayer.classicalRating,
            })),
            {excludeExtraneousValues: true},
        );

        if (isDefaultQuery) await this.cache.set(GAMES_RECENT_CACHE_KEY, result);

        return result;
    }
}
