import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { GameType } from "@/core/enums/game-type/game-type.enum";

export class CreateGameOfDayResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  videoUrl: string;

  @ApiProperty()
  @Expose()
  thumbnailUrl: string;

  @ApiProperty()
  @Expose()
  durationSeconds: number;

  @ApiProperty()
  @Expose()
  liveStartTime: Date;

  @ApiProperty({ enum: GameType })
  @Expose()
  gameType: GameType;

  @ApiProperty()
  @Expose()
  whitePlayerId: number;

  @ApiProperty()
  @Expose()
  blackPlayerId: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
