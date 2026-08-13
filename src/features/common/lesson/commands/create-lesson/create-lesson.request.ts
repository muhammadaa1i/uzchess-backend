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

    @ApiProperty({required: false, default: false})
    @IsOptional()
    @Transform(({value}) => (value === undefined ? undefined : value === true || value === "true"))
    @IsBoolean()
    isFree?: boolean;

    @ApiProperty({type: "string", format: "binary"})
    video: any;

    @ApiProperty({type: "string", format: "binary", required: false})
    thumbnail?: any;
}
