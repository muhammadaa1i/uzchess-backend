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
import { GameType } from "@/core/enums/game-type/game-type.enum";

export class CreateGameOfDayRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  whitePlayerId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  blackPlayerId: number;

  @ApiProperty({ description: "Duration in seconds" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationSeconds: number;

  @ApiProperty({ description: "When the featured live game started" })
  @IsDateString()
  liveStartTime: string;

  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === "true",
  )
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: "string", format: "binary" })
  video: any;

  @ApiProperty({ type: "string", format: "binary" })
  thumbnail: any;
}
