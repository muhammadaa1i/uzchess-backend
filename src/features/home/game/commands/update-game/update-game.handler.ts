import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateGameCommand} from "@/features/home/game/commands/update-game/update-game.command";
import {Game} from "@/features/home/entities/game/game.entity";
import {Player} from "@/features/home/entities/player/player.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {UpdateGameResponse} from "@/features/home/game/commands/update-game/update-game.response";
import {Cache} from "@nestjs/cache-manager";
import {
    GAMES_FILTERS_CACHE_KEY,
    GAMES_LIST_CACHE_KEY,
    GAMES_RECENT_CACHE_KEY,
    gameByIdCacheKey,
} from "@/features/home/game/game.cache";

@CommandHandler(UpdateGameCommand)
export class UpdateGameHandler implements ICommandHandler<UpdateGameCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: UpdateGameCommand) {
        const game = await Game.findOneBy({id: cmd.id});
        DoesNotExistException.ThrowIfNull(game, "Game not found");

        if (cmd.payload.whitePlayerId !== undefined) {
            const whitePlayerExists = await Player.existsBy({
                id: cmd.payload.whitePlayerId,
            });
            DoesNotExistException.ThrowIf(
                !whitePlayerExists,
                "White player not found",
            );
        }

        if (cmd.payload.blackPlayerId !== undefined) {
            const blackPlayerExists = await Player.existsBy({
                id: cmd.payload.blackPlayerId,
            });
            DoesNotExistException.ThrowIf(
                !blackPlayerExists,
                "Black player not found",
            );
        }

        if (cmd.payload.whitePlayerId !== undefined)
            game.whitePlayerId = cmd.payload.whitePlayerId;
        if (cmd.payload.blackPlayerId !== undefined)
            game.blackPlayerId = cmd.payload.blackPlayerId;
        if (cmd.payload.whiteScore !== undefined)
            game.whiteScore = cmd.payload.whiteScore;
        if (cmd.payload.blackScore !== undefined)
            game.blackScore = cmd.payload.blackScore;
        if (cmd.payload.gameType !== undefined)
            game.gameType = cmd.payload.gameType;
        if (cmd.payload.movesCount !== undefined)
            game.movesCount = cmd.payload.movesCount;
        if (cmd.payload.playedAt !== undefined)
            game.playedAt = new Date(cmd.payload.playedAt);

        const saved = await game.save();

        await Promise.all([
            this.cache.del(GAMES_LIST_CACHE_KEY),
            this.cache.del(GAMES_FILTERS_CACHE_KEY),
            this.cache.del(GAMES_RECENT_CACHE_KEY),
            this.cache.del(gameByIdCacheKey(cmd.id)),
        ]);

        return plainToInstance(UpdateGameResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
