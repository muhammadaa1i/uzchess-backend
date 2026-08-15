import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileCleanupInterceptor } from "@/core/interceptors/file-cleanup.interceptor";
import { GAME_OF_DAY_FILES_INTERCEPTOR } from "@/core/interceptors/game-of-day-files.interceptor";
import type { GameOfDayFiles } from "@/core/interceptors/game-of-day-files.interceptor";
import { ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateGameOfDayRequest } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.request";
import { CreateGameOfDayCommand } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.command";
import { CreateGameOfDayResponse } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.response";
import { UpdateGameOfDayRequest } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.request";
import { UpdateGameOfDayCommand } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.command";
import { UpdateGameOfDayResponse } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.response";
import { DeleteGameOfDayCommand } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.command";
import { DeleteGameOfDayResponse } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.response";
import { GetGameOfDaysQuery } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.query";
import { GetGameOfDaysResponse } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.response";
import { GetGameOfDaysByIdQuery } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import { GetGameOfDaysByIdResponse } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.response";
import { GetActiveGameOfDayQuery } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.query";
import { GetActiveGameOfDayResponse } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.response";

@ApiTags("Game of the Day")
@Roles(Role.Admin)
@Controller("game-of-day")
export class GameOfDayController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetGameOfDaysResponse] })
  async getAll() {
    return await this.queryBus.execute(new GetGameOfDaysQuery());
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetGameOfDaysByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetGameOfDaysByIdQuery(id));
  }

  @Public()
  @Get("active")
  @ApiOkResponse({ type: GetActiveGameOfDayResponse })
  async getActive() {
    return await this.queryBus.execute(new GetActiveGameOfDayQuery());
  }

  @Post("create")
  @ApiOkResponse({ type: CreateGameOfDayResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(GAME_OF_DAY_FILES_INTERCEPTOR, FileCleanupInterceptor)
  async create(
    @Body() payload: CreateGameOfDayRequest,
    @UploadedFiles() files: GameOfDayFiles,
  ) {
    const video = files?.video?.[0];
    const thumbnail = files?.thumbnail?.[0];
    if (!video || !thumbnail) throw new BadRequestException();

    return await this.cmdBus.execute(
      new CreateGameOfDayCommand(payload, video.path, thumbnail.path),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateGameOfDayResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(GAME_OF_DAY_FILES_INTERCEPTOR, FileCleanupInterceptor)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateGameOfDayRequest,
    @UploadedFiles() files: GameOfDayFiles,
  ) {
    const video = files?.video?.[0];
    const thumbnail = files?.thumbnail?.[0];

    return await this.cmdBus.execute(
      new UpdateGameOfDayCommand(id, payload, video?.path, thumbnail?.path),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteGameOfDayResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteGameOfDayCommand(id));
  }
}
