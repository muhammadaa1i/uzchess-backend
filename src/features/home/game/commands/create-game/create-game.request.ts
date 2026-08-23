import {ApiProperty} from "@nestjs/swagger";
import {IsDateString, IsEnum, IsInt, Min} from "class-validator";
import {Type} from "class-transformer";
import {GameType} from "@/core/enums/game-type/game-type.enum";

export class CreateGameRequest {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    whitePlayerId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    blackPlayerId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    whiteScore: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    blackScore: number;

    @ApiProperty({enum: GameType})
    @IsEnum(GameType)
    gameType: GameType;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    movesCount: number;

    @ApiProperty()
    @IsDateString()
    playedAt: string;
}
