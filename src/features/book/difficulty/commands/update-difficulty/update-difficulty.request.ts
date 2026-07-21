import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, MaxLength} from "class-validator";

export class UpdateDifficultyRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    degree: string

    @ApiProperty({type: "string", format: "binary"})
    icon: any
}