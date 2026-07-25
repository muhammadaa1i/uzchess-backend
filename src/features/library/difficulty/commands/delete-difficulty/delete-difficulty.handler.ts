import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteDifficultyCommand} from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.command";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {plainToInstance} from "class-transformer";
import {
    DeleteDifficultyResponse
} from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {unlink} from "node:fs/promises";

@CommandHandler(DeleteDifficultyCommand)
export class DeleteDifficultyHandler implements ICommandHandler<DeleteDifficultyCommand> {
    async execute(cmd: DeleteDifficultyCommand) {
        const difficulty = await Difficulty.findOneBy({id: cmd.id})

        DoesNotExistException.ThrowIfNull(difficulty, "Difficulty not found")

        await Difficulty.remove(difficulty)
        await unlink(difficulty.icon).catch(() => {})

        return plainToInstance(DeleteDifficultyResponse, {
            message: 'Difficulty deleted successfully'
        })
    }
}