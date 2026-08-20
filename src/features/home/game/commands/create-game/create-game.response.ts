import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";
import {GameType} from "@/core/enums/game-type.enum";

export class CreateGameResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    whitePlayerId: number;

    @ApiProperty()
    @Expose()
    blackPlayerId: number;

    @ApiProperty()
    @Expose()
    whiteScore: number;

    @ApiProperty()
    @Expose()
    blackScore: number;

    @ApiProperty({enum: GameType})
    @Expose()
    gameType: GameType;

    @ApiProperty()
    @Expose()
    movesCount: number;

    @ApiProperty()
    @Expose()
    playedAt: Date;
}
