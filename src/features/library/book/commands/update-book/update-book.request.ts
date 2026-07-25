import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min} from "class-validator";
import {Type} from "class-transformer";

export class UpdateBookRequest {
    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title?: string

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price?: number

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    discountPrice?: number

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    difficultyId?: number

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    languageId?: number

    @ApiProperty({required: false, description: 'Comma-separated author ids, e.g. "1,2,3"'})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    authorIds?: string

    @ApiProperty({type: "string", format: "binary", required: false})
    @IsOptional()
    cover?: any
}
