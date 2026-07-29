import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateSectionRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  courseId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order: number;
}
