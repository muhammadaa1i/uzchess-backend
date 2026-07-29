import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class UpdateCourseResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    price: number;

    @ApiProperty({required: false, nullable: true})
    @Expose()
    discountPrice: number | null;

    @ApiProperty()
    @Expose()
    cover: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty()
    @Expose()
    categoryId: number;

    @ApiProperty()
    @Expose()
    difficultyId: number;

    @ApiProperty()
    @Expose()
    languageId: number;

    @ApiProperty({type: [Number]})
    @Expose()
    authorIds: number[];
}
