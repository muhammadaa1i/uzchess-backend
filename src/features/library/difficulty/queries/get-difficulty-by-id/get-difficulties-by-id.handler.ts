import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {
    GetDifficultiesByIdQuery
} from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.query";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    GetDifficultiesByIdResponse
} from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.response";

@QueryHandler(GetDifficultiesByIdQuery)
export class GetDifficultiesByIdHandler implements IQueryHandler<GetDifficultiesByIdQuery> {
    async execute(query: GetDifficultiesByIdQuery
    ) {
        const difficulty = await Difficulty.findOneBy({id: query.id})

        DoesNotExistException.ThrowIfNull(difficulty, 'Difficulty not found')

        return plainToInstance(GetDifficultiesByIdResponse, difficulty, {
            excludeExtraneousValues: true
        })
    }
}