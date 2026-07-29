import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetCourseReviewsRequest {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  page?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  size?: number;
}
