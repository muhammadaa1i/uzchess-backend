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

export class CreateBookRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price: number;

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    discountPrice?: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    publishedYear: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    categoryId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    difficultyId: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    languageId: number;

    @ApiProperty({type: [Number]})
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({each: true})
    authorIds: number[];

    @ApiProperty({type: "string", format: "binary"})
    cover: any;
}
