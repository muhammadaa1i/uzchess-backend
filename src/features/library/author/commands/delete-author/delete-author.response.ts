import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteAuthorResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
