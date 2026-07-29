import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNotEmpty, IsString, MaxLength, Min} from "class-validator";
import {Type} from "class-transformer";

export class CreateLessonRequest {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    sectionId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title: string;

    @ApiProperty({description: "Duration in seconds"})
    @Type(() => Number)
    @IsInt()
    @Min(1)
    duration: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    order: number;

    @ApiProperty({type: "string", format: "binary"})
    video: any;

    @ApiProperty({type: "string", format: "binary", required: false})
    thumbnail?: any;
}
