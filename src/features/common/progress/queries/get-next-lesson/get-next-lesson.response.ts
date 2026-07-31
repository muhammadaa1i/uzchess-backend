import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetNextLessonResponse {
  @ApiProperty()
  @Expose()
  hasNext: boolean;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  lessonId: number | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  locked: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  video: string | null;
}
