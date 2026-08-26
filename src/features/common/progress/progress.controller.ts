import {Controller, Get, Param, ParseIntPipe, Post, Req} from "@nestjs/common";
import type {Request} from "express";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {GetCourseLessonsQuery} from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.query";
import {
    GetCourseLessonsResponse
} from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.response";
import {GetNextLessonQuery} from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.query";
import {GetNextLessonResponse} from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.response";
import {
    CreateLessonProgressCommand
} from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.command";
import {
    CreateLessonProgressResponse
} from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.response";

@ApiTags("Lesson Progress")
@Controller("courses")
export class ProgressController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Get(":id/lessons")
    @ApiOkResponse({type: GetCourseLessonsResponse})
    async getAll(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return await this.queryBus.execute(
            new GetCourseLessonsQuery(id, req.user!.id),
        );
    }

    @Get("lessons/:id/next")
    @ApiOkResponse({type: GetNextLessonResponse})
    async getNext(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return await this.queryBus.execute(
            new GetNextLessonQuery(id, req.user!.id),
        );
    }

    @Post("lessons/:id/complete")
    @ApiOkResponse({type: CreateLessonProgressResponse})
    async create(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return await this.cmdBus.execute(
            new CreateLessonProgressCommand(req.user!.id, id),
        );
    }
}
