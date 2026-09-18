import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { GameStatus } from "@/core/enums/game-status/game-status.enum";

export class UpdateGameResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  whitePlayerId: number;

  @ApiProperty()
  @Expose()
  blackPlayerId: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  whiteScore: number | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  blackScore: number | null;

  @ApiProperty({ enum: GameStatus })
  @Expose()
  status: GameStatus;

  @ApiProperty({ enum: GameType })
  @Expose()
  gameType: GameType;

  @ApiProperty()
  @Expose()
  movesCount: number;

  @ApiProperty()
  @Expose()
  playedAt: Date;
}
