import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateContactResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  createdAt: string;
}
