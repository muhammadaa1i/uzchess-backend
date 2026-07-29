import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";
import { Type } from "class-transformer";

export class GetSectionsRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  courseId: number;
}
