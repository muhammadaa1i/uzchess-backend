import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DeleteSectionResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
