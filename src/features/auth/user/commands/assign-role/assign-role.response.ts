import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AssignRoleResponse {
  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty({ type: [String] })
  @Expose()
  roles: string[];
}
