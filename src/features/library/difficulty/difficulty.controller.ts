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
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorageOptions } from "@/core/configs/multer/multer.config";
import { FileCleanupInterceptor } from "@/core/interceptors/file-cleanup.interceptor";
import { CreateDifficultyRequest } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.request";
import { UpdateDifficultyRequest } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.request";
import { ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateDifficultyCommand } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.command";
import { UpdateDifficultyCommand } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.command";
import { DeleteDifficultyCommand } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.command";
import { CreateDifficultyResponse } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.response";
import { UpdateDifficultyResponse } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.response";
import { DeleteDifficultyResponse } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.response";
import { GetDifficultiesQuery } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.query";
import { GetDifficultiesRequest } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.request";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { GetDifficultiesResponse } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.response";
import { GetDifficultiesByIdResponse } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.response";
import { GetDifficultiesByIdQuery } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.query";

@ApiTags("Difficulty")
@Roles(Role.Admin)
@Controller("difficulty")
export class DifficultyController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetDifficultiesResponse] })
  async getAll(@Query() payload: GetDifficultiesRequest) {
    return await this.queryBus.execute(new GetDifficultiesQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetDifficultiesByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetDifficultiesByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateDifficultyResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("icon", {
      storage: multerStorageOptions({
        destination: "icons",
        extensions: ["jpg", "png", "jpeg", "svg"],
      }),
      limits: {
        fileSize: 1024 * 1024 * 2,
        files: 1,
      },
    }),
    FileCleanupInterceptor,
  )
  async create(
    @Body()
    payload: CreateDifficultyRequest,
    @UploadedFile()
    icon: Express.Multer.File,
  ) {
    if (!icon) throw new BadRequestException();

    return await this.cmdBus.execute(
      new CreateDifficultyCommand(payload, icon.path),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateDifficultyResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("icon", {
      storage: multerStorageOptions({
        destination: "icons",
        extensions: ["jpg", "png", "jpeg", "svg"],
      }),
      limits: {
        fileSize: 1024 * 1024 * 2,
        files: 1,
      },
    }),
    FileCleanupInterceptor,
  )
  async update(
    @Param("id", ParseIntPipe)
    id: number,
    @Body()
    payload: UpdateDifficultyRequest,
    @UploadedFile()
    icon: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new UpdateDifficultyCommand(id, payload, icon?.path),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteDifficultyResponse })
  async delete(
    @Param("id", ParseIntPipe)
    id: number,
  ) {
    return await this.cmdBus.execute(new DeleteDifficultyCommand(id));
  }
}
