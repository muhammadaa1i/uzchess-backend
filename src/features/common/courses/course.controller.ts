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
import { ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateCourseRequest } from "@/features/common/courses/commands/create-course/create-course.request";
import { CreateCourseCommand } from "@/features/common/courses/commands/create-course/create-course.command";
import { CreateCourseResponse } from "@/features/common/courses/commands/create-course/create-course.response";
import { UpdateCourseRequest } from "@/features/common/courses/commands/update-course/update-course.request";
import { UpdateCourseCommand } from "@/features/common/courses/commands/update-course/update-course.command";
import { UpdateCourseResponse } from "@/features/common/courses/commands/update-course/update-course.response";
import { DeleteCourseCommand } from "@/features/common/courses/commands/delete-course/delete-course.command";
import { DeleteCourseResponse } from "@/features/common/courses/commands/delete-course/delete-course.response";
import { GetCoursesQuery } from "@/features/common/courses/queries/get-courses/get-courses.query";
import { GetCoursesRequest } from "@/features/common/courses/queries/get-courses/get-courses.request";
import { GetCoursesResponse } from "@/features/common/courses/queries/get-courses/get-courses.response";
import { GetCoursesByIdQuery } from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.query";
import { GetCoursesByIdResponse } from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";

@ApiTags("Courses")
@Roles(Role.Admin)
@Controller("courses")
export class CourseController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: PaginatedResultDto(GetCoursesResponse) })
  async getAll(@Query() payload: GetCoursesRequest) {
    return await this.queryBus.execute(
      new GetCoursesQuery(
        payload.search,
        payload.categoryId,
        payload.difficultyId,
        payload.languageId,
        payload.minRating,
        payload.page,
        payload.size,
      ),
    );
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetCoursesByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetCoursesByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateCourseResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("cover", {
      storage: multerStorageOptions({
        destination: "courseCovers",
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
    payload: CreateCourseRequest,
    @UploadedFile()
    cover: Express.Multer.File,
  ) {
    if (!cover) throw new BadRequestException();

    return await this.cmdBus.execute(
      new CreateCourseCommand(
        payload.title,
        payload.price,
        payload.discountPrice,
        payload.description,
        payload.categoryId,
        payload.difficultyId,
        payload.languageId,
        payload.authorIds,
        cover.path,
      ),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateCourseResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("cover", {
      storage: multerStorageOptions({
        destination: "courseCovers",
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
    payload: UpdateCourseRequest,
    @UploadedFile()
    cover: Express.Multer.File,
  ) {
    return await this.cmdBus.execute(
      new UpdateCourseCommand(
        id,
        payload.title,
        payload.price,
        payload.discountPrice,
        payload.description,
        payload.categoryId,
        payload.difficultyId,
        payload.languageId,
        payload.authorIds,
        cover?.path,
      ),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteCourseResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteCourseCommand(id));
  }
}
