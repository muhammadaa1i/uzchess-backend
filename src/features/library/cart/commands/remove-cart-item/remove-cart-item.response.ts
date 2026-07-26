import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class RemoveCartItemResponse {
  @ApiProperty()
  @Expose()
  message: string;
}
