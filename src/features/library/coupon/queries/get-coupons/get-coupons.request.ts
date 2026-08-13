import {IsOptional, IsString, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetCouponsRequest {
    @IsString()
    @MaxLength(64)
    @IsOptional()
    @ApiProperty({required: false})
    search?: string;
}
