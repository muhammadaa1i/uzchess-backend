import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AddCourseFavouriteResponse {
  @ApiProperty()
  @Expose()
  courseId: number;

  @ApiProperty()
  @Expose()
  message: string;
}
