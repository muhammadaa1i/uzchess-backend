import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateGameCommand} from "@/features/home/game/commands/create-game/create-game.command";
import {Game} from "@/features/home/entities/game/game.entity";
import {Player} from "@/features/home/entities/player/player.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateGameResponse} from "@/features/home/game/commands/create-game/create-game.response";
import {Cache} from "@nestjs/cache-manager";
import {
    GAMES_FILTERS_CACHE_KEY,
    GAMES_LIST_CACHE_KEY,
    GAMES_RECENT_CACHE_KEY,
} from "@/features/home/game/game.cache";

@CommandHandler(CreateGameCommand)
export class CreateGameHandler implements ICommandHandler<CreateGameCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: CreateGameCommand) {
        const whitePlayerExists = await Player.existsBy({
            id: cmd.payload.whitePlayerId,
        });
        DoesNotExistException.ThrowIf(!whitePlayerExists, "White player not found");

        const blackPlayerExists = await Player.existsBy({
            id: cmd.payload.blackPlayerId,
        });
        DoesNotExistException.ThrowIf(!blackPlayerExists, "Black player not found");

        const game = Game.create({
            whitePlayerId: cmd.payload.whitePlayerId,
            blackPlayerId: cmd.payload.blackPlayerId,
            whiteScore: cmd.payload.whiteScore,
            blackScore: cmd.payload.blackScore,
            gameType: cmd.payload.gameType,
            movesCount: cmd.payload.movesCount,
            playedAt: new Date(cmd.payload.playedAt),
        });
        const saved = await Game.save(game);

        await Promise.all([
            this.cache.del(GAMES_LIST_CACHE_KEY),
            this.cache.del(GAMES_FILTERS_CACHE_KEY),
            this.cache.del(GAMES_RECENT_CACHE_KEY),
        ]);

        return plainToInstance(CreateGameResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
