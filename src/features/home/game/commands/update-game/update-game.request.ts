import {ApiProperty} from "@nestjs/swagger";
import {IsDateString, IsEnum, IsInt, IsOptional, Min} from "class-validator";
import {Type} from "class-transformer";
import {GameType} from "@/core/enums/game-type.enum";

export class UpdateGameRequest {
    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    whitePlayerId?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    blackPlayerId?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    whiteScore?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    blackScore?: number;

    @ApiProperty({enum: GameType, required: false})
    @IsOptional()
    @IsEnum(GameType)
    gameType?: GameType;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    movesCount?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @IsDateString()
    playedAt?: string;
}
