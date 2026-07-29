import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, MaxLength} from "class-validator";

export class UpdateCourseCategoryRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    title: string;
}
