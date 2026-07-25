import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetDifficultiesQuery} from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.query";
import {FindOptionsWhere, ILike} from "typeorm";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {plainToInstance} from "class-transformer";
import {
    GetDifficultiesResponse
} from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.response";

@QueryHandler(GetDifficultiesQuery)
export class GetDifficultiesHandler implements IQueryHandler<GetDifficultiesQuery> {
    async execute(query: GetDifficultiesQuery) {
        const where: FindOptionsWhere<Difficulty> = {}
        if (query.search) where.degree = ILike(`%${query.search}%`)

        const difficulties = await Difficulty.find({where})
        return plainToInstance(GetDifficultiesResponse, difficulties, {
            excludeExtraneousValues: true
        })
    }
}