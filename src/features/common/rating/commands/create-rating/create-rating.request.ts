import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min} from "class-validator";

export class CreateCourseRatingRequest {
    @ApiProperty({minimum: 1, maximum: 5})
    @IsInt()
    @Min(1)
    @Max(5)
    score: number;

    @ApiProperty({required: false})
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    comment?: string;
}
