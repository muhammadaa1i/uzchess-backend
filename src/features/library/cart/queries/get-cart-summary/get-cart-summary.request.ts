import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class GetCartSummaryRequest {
    @IsString()
    @IsOptional()
    @ApiProperty({required: false})
    code?: string;
}
