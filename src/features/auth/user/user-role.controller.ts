import { Body, Controller, Param, ParseIntPipe, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role/role.enum";
import { AssignRoleRequest } from "@/features/auth/user/commands/assign-role/assign-role.request";
import { AssignRoleCommand } from "@/features/auth/user/commands/assign-role/assign-role.command";
import { AssignRoleResponse } from "@/features/auth/user/commands/assign-role/assign-role.response";

@ApiTags("Users")
@Roles(Role.SuperAdmin)
@Controller("users")
export class UserRoleController {
  constructor(private readonly cmdBus: CommandBus) {}

  @Post(":id/roles")
  @ApiOkResponse({ type: AssignRoleResponse })
  async assignRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: AssignRoleRequest,
  ) {
    return await this.cmdBus.execute(new AssignRoleCommand(id, payload));
  }
}
