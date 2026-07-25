import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateLanguageCommand} from "@/features/library/languages/commands/update-language/update-language.command";
import {Language} from "../../../entities/languages/language.entity";
import {ILike, Not} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {UpdateLanguageResponse} from "@/features/library/languages/commands/update-language/update-language.response";

@CommandHandler(UpdateLanguageCommand)
export class UpdateLanguageHandler implements ICommandHandler<UpdateLanguageCommand> {
    async execute(cmd: UpdateLanguageCommand) {
        const language = await Language.findOneBy({id: cmd.id})
        DoesNotExistException.ThrowIfNull(language, "Language not found")

        const titleExists = await Language.existsBy({id: Not(cmd.id), title: ILike(cmd.title)})
        const codeExists = await Language.existsBy({id: Not(cmd.id), code: ILike(cmd.code)})
        AlreadyExistException.ThrowIf(titleExists || codeExists, "Language with this title or code already exists")

        language.title = cmd.title
        language.code = cmd.code

        return plainToInstance(UpdateLanguageResponse, await language.save(), {
            excludeExtraneousValues: true,
        })
    }
}
