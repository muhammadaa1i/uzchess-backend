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
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorageOptions } from "@/core/configs/multer/multer.config";
import { FileCleanupInterceptor } from "@/core/interceptors/file-cleanup.interceptor";
import { ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateNewsRequest } from "@/features/home/news/commands/create-news/create-news.request";
import { CreateNewsCommand } from "@/features/home/news/commands/create-news/create-news.command";
import { CreateNewsResponse } from "@/features/home/news/commands/create-news/create-news.response";
import { UpdateNewsRequest } from "@/features/home/news/commands/update-news/update-news.request";
import { UpdateNewsCommand } from "@/features/home/news/commands/update-news/update-news.command";
import { UpdateNewsResponse } from "@/features/home/news/commands/update-news/update-news.response";
import { DeleteNewsCommand } from "@/features/home/news/commands/delete-news/delete-news.command";
import { DeleteNewsResponse } from "@/features/home/news/commands/delete-news/delete-news.response";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { GetNewsRequest } from "@/features/home/news/queries/get-news/get-news.request";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { GetNewsByIdResponse } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.response";

@ApiTags("News")
@Roles(Role.Admin)
@Controller("news")
export class NewsController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetNewsResponse] })
  async getAll(@Query() payload: GetNewsRequest) {
    return await this.queryBus.execute(new GetNewsQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetNewsByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetNewsByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateNewsResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multerStorageOptions({
        destination: "newsImages",
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
    payload: CreateNewsRequest,
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new CreateNewsCommand(payload, image?.path),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateNewsResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multerStorageOptions({
        destination: "newsImages",
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
    payload: UpdateNewsRequest,
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new UpdateNewsCommand(id, payload, image?.path),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteNewsResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteNewsCommand(id));
  }
}
