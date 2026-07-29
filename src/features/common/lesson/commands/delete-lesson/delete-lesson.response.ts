import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class DeleteLessonResponse {
    @ApiProperty()
    @Expose()
    message: string;
}
