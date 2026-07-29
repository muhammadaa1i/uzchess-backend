import {IsOptional, IsString, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetCourseCategoriesRequest {
    @ApiProperty({required: false})
    @IsString()
    @MaxLength(32)
    @IsOptional()
    search?: string;
}
