import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class CreateLessonProgressResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    lessonId: number;

    @ApiProperty()
    @Expose()
    userId: number;
}
