import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {CourseController} from "@/features/common/courses/course.controller";
import {CreateCourseHandler} from "@/features/common/courses/commands/create-course/create-course.handler";
import {UpdateCourseHandler} from "@/features/common/courses/commands/update-course/update-course.handler";
import {DeleteCourseHandler} from "@/features/common/courses/commands/delete-course/delete-course.handler";
import {GetCoursesHandler} from "@/features/common/courses/queries/get-courses/get-courses.handler";
import {GetCoursesByIdHandler} from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.handler";

@Module({
    imports: [CqrsModule],
    controllers: [CourseController],
    providers: [
        GetCoursesHandler,
        GetCoursesByIdHandler,
        CreateCourseHandler,
        UpdateCourseHandler,
        DeleteCourseHandler,
    ],
})
export class CourseModule {
}
