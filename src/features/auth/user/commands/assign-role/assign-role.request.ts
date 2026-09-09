import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@/core/enums/role/role.enum";

export class AssignRoleRequest {
  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;
}
