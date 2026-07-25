import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class CreateDifficultyResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    degree: string;

    @ApiProperty()
    @Expose()
    icon: string;
}