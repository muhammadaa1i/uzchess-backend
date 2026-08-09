import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ResendEmailResponse {
  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  email: string;
}
