import {IsNotEmpty, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class RefreshTokenRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    refreshToken: string;
}
