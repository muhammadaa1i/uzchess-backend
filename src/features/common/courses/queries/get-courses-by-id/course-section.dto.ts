import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CourseLessonDto } from "./course-lesson.dto";

export class CourseSectionDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  order: number;

  @ApiProperty({ type: [CourseLessonDto] })
  @Expose()
  @Type(() => CourseLessonDto)
  lessons: CourseLessonDto[];
}
