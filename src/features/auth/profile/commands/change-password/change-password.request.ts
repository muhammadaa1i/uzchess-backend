import {IsNotEmpty, IsString, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ChangePasswordRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    @ApiProperty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    confirmNewPassword: string;
}
