import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";
import {Public} from "@/core/decorators/public.decorator";
import {CreateGameRequest} from "@/features/home/game/commands/create-game/create-game.request";
import {CreateGameCommand} from "@/features/home/game/commands/create-game/create-game.command";
import {CreateGameResponse} from "@/features/home/game/commands/create-game/create-game.response";
import {UpdateGameRequest} from "@/features/home/game/commands/update-game/update-game.request";
import {UpdateGameCommand} from "@/features/home/game/commands/update-game/update-game.command";
import {UpdateGameResponse} from "@/features/home/game/commands/update-game/update-game.response";
import {DeleteGameCommand} from "@/features/home/game/commands/delete-game/delete-game.command";
import {DeleteGameResponse} from "@/features/home/game/commands/delete-game/delete-game.response";
import {GetGamesQuery} from "@/features/home/game/queries/get-games/get-games.query";
import {GetGamesRequest} from "@/features/home/game/queries/get-games/get-games.request";
import {GetGamesResponse} from "@/features/home/game/queries/get-games/get-games.response";
import {GetGamesByIdQuery} from "@/features/home/game/queries/get-games-by-id/get-games-by-id.query";
import {GetGamesByIdResponse} from "@/features/home/game/queries/get-games-by-id/get-games-by-id.response";
import {GetGamesListQuery} from "@/features/home/game/queries/get-games-list/get-games-list.query";
import {GetGamesListRequest} from "@/features/home/game/queries/get-games-list/get-games-list.request";
import {GetGamesListResponse} from "@/features/home/game/queries/get-games-list/get-games-list.response";
import {GetGamesFiltersQuery} from "@/features/home/game/queries/get-games-filters/get-games-filters.query";
import {GetGamesFiltersResponse} from "@/features/home/game/queries/get-games-filters/get-games-filters.response";
import {PaginatedResultDto} from "@/core/dtos/paginated-result.dto";

@ApiTags("Games")
@Roles(Role.Admin)
@Controller("games")
export class GameController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @Get("read")
    @ApiOkResponse({type: [GetGamesResponse]})
    async getAll(@Query() payload: GetGamesRequest) {
        return await this.queryBus.execute(new GetGamesQuery(payload));
    }

    @Public()
    @Get("read/:id")
    @ApiOkResponse({type: GetGamesByIdResponse})
    async getById(@Param("id", ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetGamesByIdQuery(id));
    }

    @Public()
    @Get("list")
    @ApiOkResponse({type: PaginatedResultDto(GetGamesListResponse)})
    async getGamesList(@Query() payload: GetGamesListRequest) {
        return await this.queryBus.execute(new GetGamesListQuery(payload));
    }

    @Public()
    @Get("filters")
    @ApiOkResponse({type: GetGamesFiltersResponse})
    async getGamesFilters() {
        return await this.queryBus.execute(new GetGamesFiltersQuery());
    }

    @Post("create")
    @ApiOkResponse({type: CreateGameResponse})
    async create(@Body() payload: CreateGameRequest) {
        return await this.cmdBus.execute(new CreateGameCommand(payload));
    }

    @Patch("update/:id")
    @ApiOkResponse({type: UpdateGameResponse})
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateGameRequest,
    ) {
        return await this.cmdBus.execute(new UpdateGameCommand(id, payload));
    }

    @Delete("delete/:id")
    @ApiOkResponse({type: DeleteGameResponse})
    async delete(@Param("id", ParseIntPipe) id: number) {
        return await this.cmdBus.execute(new DeleteGameCommand(id));
    }
}
