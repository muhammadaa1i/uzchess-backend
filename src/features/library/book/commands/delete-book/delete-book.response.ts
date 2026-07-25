import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class DeleteBookResponse {
    @ApiProperty()
    @Expose()
    message: string;
}
