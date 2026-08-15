import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CreateBannerRequest } from "@/features/home/banner/commands/create-banner/create-banner.request";
import { CreateBannerCommand } from "@/features/home/banner/commands/create-banner/create-banner.command";
import { CreateBannerResponse } from "@/features/home/banner/commands/create-banner/create-banner.response";
import { UpdateBannerRequest } from "@/features/home/banner/commands/update-banner/update-banner.request";
import { UpdateBannerCommand } from "@/features/home/banner/commands/update-banner/update-banner.command";
import { UpdateBannerResponse } from "@/features/home/banner/commands/update-banner/update-banner.response";
import { DeleteBannerCommand } from "@/features/home/banner/commands/delete-banner/delete-banner.command";
import { DeleteBannerResponse } from "@/features/home/banner/commands/delete-banner/delete-banner.response";
import { GetBannersQuery } from "@/features/home/banner/queries/get-banners/get-banners.query";
import { GetBannersResponse } from "@/features/home/banner/queries/get-banners/get-banners.response";
import { GetBannersByIdQuery } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.query";
import { GetBannersByIdResponse } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.response";

@ApiTags("Banners")
@Roles(Role.Admin)
@Controller("banners")
export class BannerController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetBannersResponse] })
  async getAll() {
    return await this.queryBus.execute(new GetBannersQuery());
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetBannersByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetBannersByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateBannerResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multerStorageOptions({
        destination: "bannerImages",
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
    payload: CreateBannerRequest,
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new CreateBannerCommand(payload, image?.path),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateBannerResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multerStorageOptions({
        destination: "bannerImages",
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
    payload: UpdateBannerRequest,
    @UploadedFile()
    image: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new UpdateBannerCommand(id, payload, image?.path),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteBannerResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteBannerCommand(id));
  }
}
