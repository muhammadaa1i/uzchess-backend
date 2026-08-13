import {ApiProperty} from "@nestjs/swagger";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";
import {Transform, Type} from "class-transformer";

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

    @ApiProperty({required: false})
    @IsOptional()
    @Transform(({value}) => (value === undefined ? undefined : value === true || value === "true"))
    @IsBoolean()
    isFree?: boolean;

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    video?: any;

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    thumbnail?: any;
}
