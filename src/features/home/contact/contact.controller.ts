import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateContactRequest } from "@/features/home/contact/commands/create-contact/create-contact.request";
import { CreateContactCommand } from "@/features/home/contact/commands/create-contact/create-contact.command";
import { CreateContactResponse } from "@/features/home/contact/commands/create-contact/create-contact.response";
import { GetContactsQuery } from "@/features/home/contact/queries/get-contacts/get-contacts.query";
import { GetContactsRequest } from "@/features/home/contact/queries/get-contacts/get-contacts.request";
import { GetContactsResponse } from "@/features/home/contact/queries/get-contacts/get-contacts.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";

@ApiTags("Contact")
@Roles(Role.Admin)
@Controller("contact")
export class ContactController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post("create")
  @ApiOkResponse({ type: CreateContactResponse })
  async create(@Body() payload: CreateContactRequest) {
    return await this.cmdBus.execute(new CreateContactCommand(payload));
  }

  @Get("read")
  @ApiOkResponse({ type: PaginatedResultDto(GetContactsResponse) })
  async getAll(@Query() payload: GetContactsRequest) {
    return await this.queryBus.execute(new GetContactsQuery(payload));
  }
}
