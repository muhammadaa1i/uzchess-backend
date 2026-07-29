import {ApiProperty} from "@nestjs/swagger";
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";
import {Type} from "class-transformer";

export class UpdateLessonRequest {
    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title?: string;

    @ApiProperty({required: false, description: "Duration in seconds"})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    duration?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    order?: number;

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    video?: any;

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    thumbnail?: any;
}
