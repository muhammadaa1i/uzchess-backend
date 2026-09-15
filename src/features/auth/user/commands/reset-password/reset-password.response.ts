import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ResetPasswordResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
