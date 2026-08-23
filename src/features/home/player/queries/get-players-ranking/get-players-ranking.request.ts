import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";

export enum RankingSortBy {
  Classical = "classical",
  Rapid = "rapid",
  Blitz = "blitz",
}

export class GetPlayersRankingRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  size?: number;

  @ApiProperty({ required: false, description: "ISO country code filter" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @ApiProperty({ enum: PlayerTitle, required: false })
  @IsOptional()
  @IsEnum(PlayerTitle)
  title?: PlayerTitle;

  @ApiProperty({ enum: RankingSortBy, required: false })
  @IsOptional()
  @IsEnum(RankingSortBy)
  sortBy?: RankingSortBy;
}
