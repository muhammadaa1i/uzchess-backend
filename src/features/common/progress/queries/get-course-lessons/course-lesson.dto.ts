import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class CourseLessonProgressDto {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty({required: false, nullable: true})
    @Expose()
    video: string | null;

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
    locked: boolean;

    @ApiProperty()
    @Expose()
    completed: boolean;
}
