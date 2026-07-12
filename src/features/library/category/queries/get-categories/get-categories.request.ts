import {IsInt, IsOptional, IsString, Max, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {GetCategoriesQuery} from "@/features/library/category/queries/get-categories/get-categories.query";
import {Type} from "class-transformer";

export class GetCategoriesRequest {
    @IsString()
    @MaxLength(32)
    @IsOptional()
    @ApiProperty({required: false})
    search?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({required: false})
    page?: number;

    @IsInt()
    @IsOptional()
    @Max(50)
    @Type(() => Number)
    @ApiProperty({required: false})
    size?: number;

    toQuery() {
        return new GetCategoriesQuery(this.search, this.page, this.size);
    }
}