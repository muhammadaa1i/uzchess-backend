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
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {multerStorageOptions} from "@/core/configs/multer/multer.config";
import {FileCleanupInterceptor} from "@/core/interceptors/file-cleanup.interceptor";
import {ApiConsumes, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";
import {Public} from "@/core/decorators/public.decorator";
import {CreatePlayerRequest} from "@/features/home/player/commands/create-player/create-player.request";
import {CreatePlayerCommand} from "@/features/home/player/commands/create-player/create-player.command";
import {CreatePlayerResponse} from "@/features/home/player/commands/create-player/create-player.response";
import {UpdatePlayerRequest} from "@/features/home/player/commands/update-player/update-player.request";
import {UpdatePlayerCommand} from "@/features/home/player/commands/update-player/update-player.command";
import {UpdatePlayerResponse} from "@/features/home/player/commands/update-player/update-player.response";
import {DeletePlayerCommand} from "@/features/home/player/commands/delete-player/delete-player.command";
import {DeletePlayerResponse} from "@/features/home/player/commands/delete-player/delete-player.response";
import {GetPlayersQuery} from "@/features/home/player/queries/get-players/get-players.query";
import {GetPlayersRequest} from "@/features/home/player/queries/get-players/get-players.request";
import {GetPlayersResponse} from "@/features/home/player/queries/get-players/get-players.response";
import {GetPlayersByIdQuery} from "@/features/home/player/queries/get-players-by-id/get-players-by-id.query";
import {GetPlayersByIdResponse} from "@/features/home/player/queries/get-players-by-id/get-players-by-id.response";
import {GetPlayersRankingQuery} from "@/features/home/player/queries/get-players-ranking/get-players-ranking.query";
import {GetPlayersRankingRequest} from "@/features/home/player/queries/get-players-ranking/get-players-ranking.request";
import {
    GetPlayersRankingResponse
} from "@/features/home/player/queries/get-players-ranking/get-players-ranking.response";
import {GetRankingFiltersQuery} from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.query";
import {
    GetRankingFiltersResponse
} from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.response";
import {PaginatedResultDto} from "@/core/dtos/paginated-result.dto";

@ApiTags("Players")
@Roles(Role.Admin)
@Controller("players")
export class PlayerController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @Get("read")
    @ApiOkResponse({type: [GetPlayersResponse]})
    async getAll(@Query() payload: GetPlayersRequest) {
        return await this.queryBus.execute(new GetPlayersQuery(payload));
    }

    @Public()
    @Get("read/:id")
    @ApiOkResponse({type: GetPlayersByIdResponse})
    async getById(@Param("id", ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetPlayersByIdQuery(id));
    }

    @Public()
    @Get("ranking")
    @ApiOkResponse({type: PaginatedResultDto(GetPlayersRankingResponse)})
    async getRanking(@Query() payload: GetPlayersRankingRequest) {
        return await this.queryBus.execute(new GetPlayersRankingQuery(payload));
    }

    @Public()
    @Get("ranking/filters")
    @ApiOkResponse({type: GetRankingFiltersResponse})
    async getRankingFilters() {
        return await this.queryBus.execute(new GetRankingFiltersQuery());
    }

    @Post("create")
    @ApiOkResponse({type: CreatePlayerResponse})
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(
        FileInterceptor("avatar", {
            storage: multerStorageOptions({
                destination: "playerAvatars",
                extensions: ["jpg", "png", "jpeg", "svg"],
            }),
            limits: {
                fileSize: 1024 * 1024 * 5,
                files: 1,
            },
        }),
        FileCleanupInterceptor,
    )
    async create(
        @Body()
        payload: CreatePlayerRequest,
        @UploadedFile()
        avatar: Express.Multer.File,
    ) {
        return await this.cmdBus.execute(
            new CreatePlayerCommand(payload, avatar?.path),
        );
    }

    @Patch("update/:id")
    @ApiOkResponse({type: UpdatePlayerResponse})
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(
        FileInterceptor("avatar", {
            storage: multerStorageOptions({
                destination: "playerAvatars",
                extensions: ["jpg", "png", "jpeg", "svg"],
            }),
            limits: {
                fileSize: 1024 * 1024 * 5,
                files: 1,
            },
        }),
        FileCleanupInterceptor,
    )
    async update(
        @Param("id", ParseIntPipe)
        id: number,
        @Body()
        payload: UpdatePlayerRequest,
        @UploadedFile()
        avatar: Express.Multer.File,
    ) {
        return await this.cmdBus.execute(
            new UpdatePlayerCommand(id, payload, avatar?.path),
        );
    }

    @Delete("delete/:id")
    @ApiOkResponse({type: DeletePlayerResponse})
    async delete(@Param("id", ParseIntPipe) id: number) {
        return await this.cmdBus.execute(new DeletePlayerCommand(id));
    }
}
