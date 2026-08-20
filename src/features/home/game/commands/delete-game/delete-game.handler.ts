import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteGameCommand} from "@/features/home/game/commands/delete-game/delete-game.command";
import {Game} from "@/features/home/entities/game/game.entity";
import {plainToInstance} from "class-transformer";
import {DeleteGameResponse} from "@/features/home/game/commands/delete-game/delete-game.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {
    GAMES_FILTERS_CACHE_KEY,
    GAMES_LIST_CACHE_KEY,
    GAMES_RECENT_CACHE_KEY,
    gameByIdCacheKey,
} from "@/features/home/game/game.cache";

@CommandHandler(DeleteGameCommand)
export class DeleteGameHandler implements ICommandHandler<DeleteGameCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: DeleteGameCommand) {
        const game = await Game.findOneBy({id: cmd.id});

        DoesNotExistException.ThrowIfNull(game, "Game not found");

        await Game.remove(game);

        await Promise.all([
            this.cache.del(GAMES_LIST_CACHE_KEY),
            this.cache.del(GAMES_FILTERS_CACHE_KEY),
            this.cache.del(GAMES_RECENT_CACHE_KEY),
            this.cache.del(gameByIdCacheKey(cmd.id)),
        ]);

        return plainToInstance(DeleteGameResponse, {
            message: "Game deleted successfully",
        });
    }
}
