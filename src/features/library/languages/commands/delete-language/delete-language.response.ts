import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteLanguageResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
