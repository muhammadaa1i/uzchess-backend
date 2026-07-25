import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteLanguageCommand} from "@/features/library/languages/commands/delete-language/delete-language.command";
import {Language} from "../../../entities/languages/language.entity";
import {plainToInstance} from "class-transformer";
import {DeleteLanguageResponse} from "@/features/library/languages/commands/delete-language/delete-language.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(DeleteLanguageCommand)
export class DeleteLanguageHandler implements ICommandHandler<DeleteLanguageCommand> {
    async execute(cmd: DeleteLanguageCommand) {
        const language = await Language.findOneBy({id: cmd.id})
        DoesNotExistException.ThrowIfNull(language, "Language not found")

        await Language.remove(language)

        return plainToInstance(DeleteLanguageResponse, {
            message: "Language deleted successfully",
        })
    }
}
