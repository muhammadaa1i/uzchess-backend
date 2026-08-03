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
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";
import { CreateSectionRequest } from "@/features/common/section/commands/create-section/create-section.request";
import { CreateSectionCommand } from "@/features/common/section/commands/create-section/create-section.command";
import { CreateSectionResponse } from "@/features/common/section/commands/create-section/create-section.response";
import { UpdateSectionRequest } from "@/features/common/section/commands/update-section/update-section.request";
import { UpdateSectionCommand } from "@/features/common/section/commands/update-section/update-section.command";
import { UpdateSectionResponse } from "@/features/common/section/commands/update-section/update-section.response";
import { DeleteSectionCommand } from "@/features/common/section/commands/delete-section/delete-section.command";
import { DeleteSectionResponse } from "@/features/common/section/commands/delete-section/delete-section.response";
import { GetSectionsQuery } from "@/features/common/section/queries/get-sections/get-sections.query";
import { GetSectionsRequest } from "@/features/common/section/queries/get-sections/get-sections.request";
import { GetSectionsResponse } from "@/features/common/section/queries/get-sections/get-sections.response";
import { GetSectionsByIdQuery } from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.query";
import { GetSectionsByIdResponse } from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.response";

@ApiTags("Course Sections")
@Roles(Role.Admin)
@Controller("courses/sections")
export class SectionController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetSectionsResponse] })
  async getAll(@Query() payload: GetSectionsRequest) {
    return await this.queryBus.execute(new GetSectionsQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetSectionsByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetSectionsByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateSectionResponse })
  async create(@Body() payload: CreateSectionRequest) {
    return await this.cmdBus.execute(new CreateSectionCommand(payload));
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateSectionResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateSectionRequest,
  ) {
    return await this.cmdBus.execute(new UpdateSectionCommand(id, payload));
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteSectionResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteSectionCommand(id));
  }
}
