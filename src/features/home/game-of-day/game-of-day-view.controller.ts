import {Controller, Get, Param, ParseIntPipe} from "@nestjs/common";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {QueryBus} from "@nestjs/cqrs";
import {GetGameOfDaysQuery} from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.query";
import {GetGameOfDaysResponse} from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.response";
import {
    GetGameOfDaysByIdQuery
} from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import {
    GetGameOfDaysByIdResponse
} from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.response";
import {
    GetActiveGameOfDayQuery
} from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.query";
import {
    GetActiveGameOfDayResponse
} from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.response";

@ApiTags("Game of the Day")
@Controller("game-of-day")
export class GameOfDayViewController {
    constructor(private readonly queryBus: QueryBus) {
    }

    @Get("read")
    @ApiOkResponse({type: [GetGameOfDaysResponse]})
    async getAll() {
        return await this.queryBus.execute(new GetGameOfDaysQuery());
    }

    @Get("read/:id")
    @ApiOkResponse({type: GetGameOfDaysByIdResponse})
    async getById(@Param("id", ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetGameOfDaysByIdQuery(id));
    }

    @Get("active")
    @ApiOkResponse({type: GetActiveGameOfDayResponse})
    async getActive() {
        return await this.queryBus.execute(new GetActiveGameOfDayQuery());
    }
}
