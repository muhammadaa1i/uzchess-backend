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
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorageOptions } from "@/core/configs/multer.config";
import { FileCleanupInterceptor } from "@/core/interceptors/file-cleanup.interceptor";
import { ApiConsumes, ApiOkResponse } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateLessonRequest } from "@/features/common/lesson/commands/create-lesson/create-lesson.request";
import { CreateLessonCommand } from "@/features/common/lesson/commands/create-lesson/create-lesson.command";
import { CreateLessonResponse } from "@/features/common/lesson/commands/create-lesson/create-lesson.response";
import { UpdateLessonRequest } from "@/features/common/lesson/commands/update-lesson/update-lesson.request";
import { UpdateLessonCommand } from "@/features/common/lesson/commands/update-lesson/update-lesson.command";
import { UpdateLessonResponse } from "@/features/common/lesson/commands/update-lesson/update-lesson.response";
import { DeleteLessonCommand } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.command";
import { DeleteLessonResponse } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.response";
import { GetLessonsQuery } from "@/features/common/lesson/queries/get-lessons/get-lessons.query";
import { GetLessonsRequest } from "@/features/common/lesson/queries/get-lessons/get-lessons.request";
import { GetLessonsResponse } from "@/features/common/lesson/queries/get-lessons/get-lessons.response";
import { GetLessonsByIdQuery } from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.query";
import { GetLessonsByIdResponse } from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.response";

const LESSON_FILES_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ],
  {
    storage: multerStorageOptions({
      destination: "lessons",
      extensions: ["mp4", "webm", "mov", "jpg", "jpeg", "png"],
    }),
    limits: {
      fileSize: 1024 * 1024 * 200,
      files: 2,
    },
  },
);

type LessonFiles = {
  video?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
};

@Roles(Role.Admin)
@Controller("courses/lessons")
export class LessonController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetLessonsResponse] })
  async getAll(@Query() payload: GetLessonsRequest) {
    return await this.queryBus.execute(
      new GetLessonsQuery(payload.sectionId),
    );
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetLessonsByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetLessonsByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateLessonResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(LESSON_FILES_INTERCEPTOR, FileCleanupInterceptor)
  async create(
    @Body() payload: CreateLessonRequest,
    @UploadedFiles() files: LessonFiles,
  ) {
    const video = files.video?.[0];
    if (!video) throw new BadRequestException();
    const thumbnail = files.thumbnail?.[0];

    return await this.cmdBus.execute(
      new CreateLessonCommand(
        payload.sectionId,
        payload.title,
        payload.duration,
        payload.order,
        video.path,
        thumbnail?.path,
      ),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateLessonResponse })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(LESSON_FILES_INTERCEPTOR, FileCleanupInterceptor)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateLessonRequest,
    @UploadedFiles() files: LessonFiles,
  ) {
    const video = files.video?.[0];
    const thumbnail = files.thumbnail?.[0];

    return await this.cmdBus.execute(
      new UpdateLessonCommand(
        id,
        payload.title,
        payload.duration,
        payload.order,
        video?.path,
        thumbnail?.path,
      ),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteLessonResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteLessonCommand(id));
  }
}
