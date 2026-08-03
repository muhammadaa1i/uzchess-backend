import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateAuthorRequest } from "./commands/create-author/create-author.request";
import { UpdateAuthorRequest } from "./commands/update-author/update-author.request";
import { GetAuthorsRequest } from "@/features/library/author/queries/get-authors/get-authors.request";
import { CreateAuthorCommand } from "@/features/library/author/commands/create-author/create-author.command";
import { UpdateAuthorCommand } from "@/features/library/author/commands/update-author/update-author.command";
import { DeleteAuthorCommand } from "@/features/library/author/commands/delete-author/delete-author.command";
import { GetAuthorsQuery } from "@/features/library/author/queries/get-authors/get-authors.query";
import { GetAuthorsByIdQuery } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.query";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateAuthorResponse } from "@/features/library/author/commands/create-author/create-author.response";
import { UpdateAuthorResponse } from "@/features/library/author/commands/update-author/update-author.response";
import { DeleteAuthorResponse } from "@/features/library/author/commands/delete-author/delete-author.response";
import { GetAuthorsResponse } from "@/features/library/author/queries/get-authors/get-authors.response";
import { GetAuthorsByIdResponse } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.response";
import { Public } from "@/core/decorators/public.decorator";
import { Role } from "@/core/enums/role.enum";
import { Roles } from "@/core/decorators/roles.decorator";

@ApiTags("Authors")
@Roles(Role.Admin)
@Controller("authors")
export class AuthorController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetAuthorsResponse] })
  async getAll(@Query() payload: GetAuthorsRequest) {
    return await this.queryBus.execute(new GetAuthorsQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetAuthorsByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetAuthorsByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateAuthorResponse })
  async create(@Body() payload: CreateAuthorRequest) {
    return await this.cmdBus.execute(new CreateAuthorCommand(payload));
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateAuthorResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateAuthorRequest,
  ) {
    return this.cmdBus.execute(new UpdateAuthorCommand(id, payload));
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteAuthorResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.cmdBus.execute(new DeleteAuthorCommand(id));
  }
}
