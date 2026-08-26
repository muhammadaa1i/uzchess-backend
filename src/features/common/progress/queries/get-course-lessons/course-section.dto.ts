import {ApiProperty} from "@nestjs/swagger";
import {Expose, Type} from "class-transformer";
import {CourseLessonProgressDto} from "./course-lesson.dto";

export class CourseSectionProgressDto {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    order: number;

    @ApiProperty({type: [CourseLessonProgressDto]})
    @Expose()
    @Type(() => CourseLessonProgressDto)
    lessons: CourseLessonProgressDto[];
}
