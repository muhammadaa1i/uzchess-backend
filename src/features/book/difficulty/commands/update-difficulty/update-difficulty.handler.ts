import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    UpdateDifficultyCommand
} from "@/features/book/difficulty/commands/update-difficulty/update-difficulty.command";

@CommandHandler(UpdateDifficultyCommand)
export class UpdateDifficultyHandler implements ICommandHandler<UpdateDifficultyCommand> {

}