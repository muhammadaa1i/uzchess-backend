import {ApiProperty} from "@nestjs/swagger";
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from "class-validator";
import {Type} from "class-transformer";

export class UpdateBookRequest {
    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title?: string;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    discountPrice?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageCount?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    publishedYear?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    difficultyId?: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    languageId?: number;

    @ApiProperty({type: [Number], required: false})
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({each: true})
    authorIds?: number[];

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    cover?: any;
}
