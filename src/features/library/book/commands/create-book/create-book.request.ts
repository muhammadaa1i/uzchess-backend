import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min} from "class-validator";
import {Type} from "class-transformer";

export class CreateBookRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    title: string

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price: number

    @ApiProperty({required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    discountPrice?: number

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    categoryId: number

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    difficultyId: number

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    languageId: number

    @ApiProperty({description: 'Comma-separated author ids, e.g. "1,2,3"'})
    @IsString()
    @IsNotEmpty()
    authorIds: string

    @ApiProperty({type: "string", format: "binary"})
    cover: any
}
