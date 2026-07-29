import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class GetCourseCategoriesResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;
}
