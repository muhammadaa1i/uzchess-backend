import {ApiProperty} from "@nestjs/swagger";

export class CreateDifficultyResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    degree: string;

    @ApiProperty()
    icon: string;
}