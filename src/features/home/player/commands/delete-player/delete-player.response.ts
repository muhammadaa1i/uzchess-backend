import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeletePlayerResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
