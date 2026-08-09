import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ChangeEmailResponse {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  email: string;
}
