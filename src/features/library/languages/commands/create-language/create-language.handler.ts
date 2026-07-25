import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateLanguageCommand} from "@/features/library/languages/commands/create-language/create-language.command";
import {Language} from "../../../entities/languages/language.entity";
import {ILike} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateLanguageResponse} from "@/features/library/languages/commands/create-language/create-language.response";

@CommandHandler(CreateLanguageCommand)
export class CreateLanguageHandler implements ICommandHandler<CreateLanguageCommand> {
    async execute(cmd: CreateLanguageCommand) {
        const titleExists = await Language.existsBy({title: ILike(cmd.title)})
        const codeExists = await Language.existsBy({code: ILike(cmd.code)})
        AlreadyExistException.ThrowIf(titleExists || codeExists, "Language with this title or code already exists")

        const newLanguage = Language.create({title: cmd.title, code: cmd.code})
        return plainToInstance(CreateLanguageResponse, await Language.save(newLanguage), {
            excludeExtraneousValues: true,
        })
    }
}
