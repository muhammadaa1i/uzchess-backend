import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class ConfirmEmailResponse {
    @ApiProperty()
    @Expose()
    message: string;

    @ApiProperty()
    @Expose()
    email: string;
}
