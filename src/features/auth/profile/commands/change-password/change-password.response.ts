import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class ChangePasswordResponse {
    @ApiProperty()
    @Expose()
    message: string;
}
