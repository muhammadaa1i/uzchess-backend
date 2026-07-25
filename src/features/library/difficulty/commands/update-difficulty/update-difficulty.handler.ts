import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    UpdateDifficultyCommand
} from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.command";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {ILike, Not} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    UpdateDifficultyResponse
} from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.response";
import {unlink} from "node:fs/promises";

@CommandHandler(UpdateDifficultyCommand)
export class UpdateDifficultyHandler implements ICommandHandler<UpdateDifficultyCommand> {
    async execute(cmd: UpdateDifficultyCommand) {
        const difficulty = await Difficulty.findOneBy({id: cmd.id})
        DoesNotExistException.ThrowIfNull(difficulty, "Difficulty not found")

        if (cmd.degree) {
            const alreadyExist = await Difficulty.existsBy({
                id: Not(cmd.id),
                degree: ILike(cmd.degree)
            })
            AlreadyExistException.ThrowIf(alreadyExist)
            difficulty.degree = cmd.degree
        }

        if (cmd.iconPath) {
            const oldIcon = difficulty.icon
            difficulty.icon = cmd.iconPath
            await unlink(oldIcon).catch(() => {
            })
        }
        return plainToInstance(UpdateDifficultyResponse, await difficulty.save(), {
            excludeExtraneousValues: true
        })
    }
}