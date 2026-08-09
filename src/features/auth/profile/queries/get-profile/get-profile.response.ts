import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class GetProfileResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty()
    @Expose()
    lastName: string;

    @ApiProperty({nullable: true})
    @Expose()
    avatar: string | null;

    @ApiProperty({nullable: true})
    @Expose()
    email: string | null;

    @ApiProperty({nullable: true})
    @Expose()
    birthDate: Date | null;
}
