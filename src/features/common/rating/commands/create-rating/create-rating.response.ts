import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class CreateCourseRatingResponse {
    @ApiProperty()
    @Expose()
    courseId: number;

    @ApiProperty()
    @Expose()
    score: number;

    @ApiProperty({required: false, nullable: true})
    @Expose()
    comment: string | null;

    @ApiProperty()
    @Expose()
    averageRating: number;

    @ApiProperty()
    @Expose()
    ratingsCount: number;
}
