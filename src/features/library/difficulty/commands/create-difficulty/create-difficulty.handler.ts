import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    CreateDifficultyCommand
} from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.command";
import {Difficulty} from "../../../entities/difficulty/difficulty.entity";
import {ILike} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    CreateDifficultyResponse
} from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.response";

@CommandHandler(CreateDifficultyCommand)
export class CreateDifficultyHandler implements ICommandHandler<CreateDifficultyCommand> {
    async execute(cmd: CreateDifficultyCommand) {
        const alreadyExist = await Difficulty.existsBy({
            degree: ILike(cmd.degree)
        })
        AlreadyExistException.ThrowIf(alreadyExist)

        const newDifficulty = {degree: cmd.degree, icon: cmd.iconPath} as Difficulty
        return plainToInstance(CreateDifficultyResponse, await Difficulty.save(newDifficulty), {
            excludeExtraneousValues: true,
        })
    }
}