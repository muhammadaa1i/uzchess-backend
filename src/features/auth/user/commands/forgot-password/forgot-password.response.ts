import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ForgotPasswordResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
