import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateLanguageResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  code: string;
}
