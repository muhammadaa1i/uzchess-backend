import {ApiProperty} from "@nestjs/swagger";
import {Expose, Type} from "class-transformer";
import {CourseSectionProgressDto} from "./course-section.dto";

export class GetCourseLessonsResponse {
    @ApiProperty({type: [CourseSectionProgressDto]})
    @Expose()
    @Type(() => CourseSectionProgressDto)
    sections: CourseSectionProgressDto[];
}
