import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetSectionsResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  courseId: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  order: number;
}
