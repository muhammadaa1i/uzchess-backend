import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { GameType } from "@/core/enums/game-type.enum";

export class UpdateGameOfDayRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  whitePlayerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  blackPlayerId?: number;

  @ApiProperty({ required: false, description: "Duration in seconds" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @ApiProperty({
    required: false,
    description: "When the featured live game started",
  })
  @IsOptional()
  @IsDateString()
  liveStartTime?: string;

  @ApiProperty({ enum: GameType, required: false })
  @IsOptional()
  @IsEnum(GameType)
  gameType?: GameType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === "true",
  )
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: "string", format: "binary", required: false })
  video?: any;

  @ApiProperty({ type: "string", format: "binary", required: false })
  thumbnail?: any;
}
