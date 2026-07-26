import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

export class GetBooksRequest {
    @IsString()
    @MaxLength(32)
    @IsOptional()
    @ApiProperty({required: false})
    search?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    categoryId?: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    difficultyId?: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    languageId?: number;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false, description: "Minimum average rating (1-5)"})
    minRating?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    page?: number;

    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    size?: number;
}
