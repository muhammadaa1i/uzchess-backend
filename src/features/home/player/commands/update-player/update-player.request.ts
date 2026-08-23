import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";

export class UpdatePlayerRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  country?: string;

  @ApiProperty({ enum: PlayerTitle, required: false })
  @IsOptional()
  @IsEnum(PlayerTitle)
  title?: PlayerTitle;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classicalRating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classicalRatingChange?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rapidRating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rapidRatingChange?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  blitzRating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  blitzRatingChange?: number;

  @ApiProperty({
    required: false,
    description: "Leaderboard position change since last update; positive = moved up, negative = moved down",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rankChange?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  avatar?: any;
}
