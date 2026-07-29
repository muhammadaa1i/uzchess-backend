import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CourseSectionDto } from "./course-section.dto";

export class GetCoursesByIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  discountPrice: number | null;

  @ApiProperty()
  @Expose()
  cover: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  sectionsCount: number;

  @ApiProperty()
  @Expose()
  lessonsCount: number;

  @ApiProperty()
  @Expose()
  categoryId: number;

  @ApiProperty()
  @Expose()
  difficultyId: number;

  @ApiProperty()
  @Expose()
  languageId: number;

  @ApiProperty({ type: [Number] })
  @Expose()
  authorIds: number[];

  @ApiProperty()
  @Expose()
  averageRating: number;

  @ApiProperty()
  @Expose()
  ratingsCount: number;

  @ApiProperty({ type: [CourseSectionDto] })
  @Expose()
  @Type(() => CourseSectionDto)
  sections: CourseSectionDto[];
}
