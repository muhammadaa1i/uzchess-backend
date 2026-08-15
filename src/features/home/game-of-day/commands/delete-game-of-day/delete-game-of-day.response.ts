import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteGameOfDayResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
