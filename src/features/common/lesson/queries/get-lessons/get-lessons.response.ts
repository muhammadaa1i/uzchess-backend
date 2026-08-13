import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class GetLessonsResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    sectionId: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    video: string;

    @ApiProperty({required: false, nullable: true})
    @Expose()
    thumbnail: string | null;

    @ApiProperty()
    @Expose()
    duration: number;

    @ApiProperty()
    @Expose()
    order: number;

    @ApiProperty()
    @Expose()
    isFree: boolean;
}
