import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetCourseReviewsResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty()
  @Expose()
  userFullName: string;

  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  comment: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;
}
