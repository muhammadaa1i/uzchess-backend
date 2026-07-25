import {IsInt, IsOptional, IsString, Max, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

export class GetCategoriesRequest {
    @IsString()
    @MaxLength(32)
    @IsOptional()
    @ApiProperty({required: false})
    search?: string;

    // pagination disabled - category list stays small, kept for potential future reuse
    // @IsInt()
    // @IsOptional()
    // @Type(() => Number)
    // @ApiProperty({required: false})
    // page?: number;

    // @IsInt()
    // @IsOptional()
    // @Max(50)
    // @Type(() => Number)
    // @ApiProperty({required: false})
    // size?: number;
}