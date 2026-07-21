import {ApiProperty} from "@nestjs/swagger";

export class UpdateDifficultyResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    degree: string;

    @ApiProperty()
    icon: string;
}