import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { GameStatus } from "@/core/enums/game-status/game-status.enum";

export enum GamesListSortBy {
  Date = "date",
  Moves = "moves",
  GameType = "gameType",
}

export class GetGamesListRequest {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age?: number;

  @ApiProperty({ enum: GamesListSortBy, required: false })
  @IsOptional()
  @IsEnum(GamesListSortBy)
  sortBy?: GamesListSortBy;

  @ApiProperty({ enum: GameStatus, required: false })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
