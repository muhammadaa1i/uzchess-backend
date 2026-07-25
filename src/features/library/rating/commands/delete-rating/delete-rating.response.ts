import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class DeleteRatingResponse {
    @ApiProperty()
    @Expose()
    message: string;
}
