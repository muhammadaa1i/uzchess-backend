import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class RefreshTokenResponse {
    @ApiProperty()
    @Expose()
    accessToken: string;

    @ApiProperty()
    @Expose()
    refreshToken: string;
}
