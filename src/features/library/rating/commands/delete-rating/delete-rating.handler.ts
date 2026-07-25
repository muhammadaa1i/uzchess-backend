import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteRatingCommand} from "@/features/library/rating/commands/delete-rating/delete-rating.command";
import {Rating} from "@/features/library/entities/rating/rating.entity";
import {plainToInstance} from "class-transformer";
import {DeleteRatingResponse} from "@/features/library/rating/commands/delete-rating/delete-rating.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(DeleteRatingCommand)
export class DeleteRatingHandler implements ICommandHandler<DeleteRatingCommand> {
    async execute(cmd: DeleteRatingCommand) {
        const rating = await Rating.findOneBy({bookId: cmd.bookId, userId: cmd.userId})
        DoesNotExistException.ThrowIfNull(rating, "Rating not found")

        await Rating.remove(rating)

        return plainToInstance(DeleteRatingResponse, {
            message: 'Rating deleted successfully'
        })
    }
}
