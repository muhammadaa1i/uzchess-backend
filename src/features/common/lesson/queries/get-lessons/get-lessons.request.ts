import {ApiProperty} from "@nestjs/swagger";
import {IsInt} from "class-validator";
import {Type} from "class-transformer";

export class GetLessonsRequest {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    sectionId: number;
}
