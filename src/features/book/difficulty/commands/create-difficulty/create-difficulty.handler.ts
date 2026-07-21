import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    CreateDifficultyCommand
} from "@/features/book/difficulty/commands/create-difficulty/create-difficulty.command";
import {Difficulty} from "@/features/book/entities/difficulty.entity";
import {ILike} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";

@CommandHandler(CreateDifficultyCommand)
export class CreateDifficultyHandler implements ICommandHandler<CreateDifficultyCommand> {
    async execute(cmd: CreateDifficultyCommand) {
        const alreadyExist = await Difficulty.existsBy({
            degree: ILike(cmd.degree)
        })
        AlreadyExistException.ThrowIf(alreadyExist)

        const newDifficulty = {degree: cmd.degree, icon: cmd.iconPath} as Difficulty
        return await Difficulty.save(newDifficulty)
    }
}