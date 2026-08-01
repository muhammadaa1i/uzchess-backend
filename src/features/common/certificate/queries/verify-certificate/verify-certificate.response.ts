import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class VerifyCertificateResponse {
    @ApiProperty()
    @Expose()
    studentName: string;

    @ApiProperty()
    @Expose()
    courseTitle: string;

    @ApiProperty()
    @Expose()
    issuedAt: string;
}
