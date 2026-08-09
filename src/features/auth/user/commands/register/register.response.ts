import {Expose} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";

export class RegisterResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty()
    @Expose()
    lastName: string;
}
