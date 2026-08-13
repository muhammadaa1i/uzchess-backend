import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class CreateOrderRequest {
    @IsString()
    @IsOptional()
    @ApiProperty({required: false})
    code?: string;
}
