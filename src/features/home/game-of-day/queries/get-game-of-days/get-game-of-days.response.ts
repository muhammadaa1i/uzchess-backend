import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { GameType } from "@/core/enums/game-type/game-type.enum";

export class GetGameOfDaysResponse {
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

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
