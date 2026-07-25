import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class UpdateLanguageResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    code: string;
}
