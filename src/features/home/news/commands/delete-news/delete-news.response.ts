import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteNewsResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
