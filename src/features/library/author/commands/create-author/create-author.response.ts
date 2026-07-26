import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateAuthorResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  fullName: string;
}
