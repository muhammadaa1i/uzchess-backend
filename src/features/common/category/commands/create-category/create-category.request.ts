import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, MaxLength} from "class-validator";

export class CreateCourseCategoryRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    title: string;
}
