import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteGameResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
