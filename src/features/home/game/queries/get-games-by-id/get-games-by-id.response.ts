import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { GameStatus } from "@/core/enums/game-status/game-status.enum";

export class GetGamesByIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  whitePlayerId: number;

  @ApiProperty()
  @Expose()
  whitePlayerName: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  whitePlayerAvatarUrl: string | null;

  @ApiProperty()
  @Expose()
  whitePlayerRating: number;

  @ApiProperty()
  @Expose()
  blackPlayerId: number;

  @ApiProperty()
  @Expose()
  blackPlayerName: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  blackPlayerAvatarUrl: string | null;

  @ApiProperty()
  @Expose()
  blackPlayerRating: number;

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
