import {IsNotEmpty, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class VerifyEmailConfirmRequest {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    @ApiProperty()
    code: string;
}
