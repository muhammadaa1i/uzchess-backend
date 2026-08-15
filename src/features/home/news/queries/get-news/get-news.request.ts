import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetNewsRequest {
  @ApiProperty({
    required: false,
    description: "Max number of news articles to return, most recent first",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
