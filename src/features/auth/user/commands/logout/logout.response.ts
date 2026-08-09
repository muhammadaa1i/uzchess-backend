import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LogoutResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
