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
import { CreateLanguageRequest } from "@/features/library/languages/commands/create-language/create-language.request";
import { CreateLanguageCommand } from "@/features/library/languages/commands/create-language/create-language.command";
import { CreateLanguageResponse } from "@/features/library/languages/commands/create-language/create-language.response";
import { UpdateLanguageRequest } from "@/features/library/languages/commands/update-language/update-language.request";
import { UpdateLanguageCommand } from "@/features/library/languages/commands/update-language/update-language.command";
import { UpdateLanguageResponse } from "@/features/library/languages/commands/update-language/update-language.response";
import { DeleteLanguageCommand } from "@/features/library/languages/commands/delete-language/delete-language.command";
import { DeleteLanguageResponse } from "@/features/library/languages/commands/delete-language/delete-language.response";
import { GetLanguagesQuery } from "@/features/library/languages/queries/get-languages/get-languages.query";
import { GetLanguagesRequest } from "@/features/library/languages/queries/get-languages/get-languages.request";
import { GetLanguagesResponse } from "@/features/library/languages/queries/get-languages/get-languages.response";
import { GetLanguagesByIdQuery } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.query";
import { GetLanguagesByIdResponse } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.response";

@ApiTags("Languages")
@Roles(Role.Admin)
@Controller("languages")
export class LanguagesController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetLanguagesResponse] })
  async getAll(@Query() payload: GetLanguagesRequest) {
    return await this.queryBus.execute(new GetLanguagesQuery(payload.search));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetLanguagesByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetLanguagesByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateLanguageResponse })
  async create(@Body() payload: CreateLanguageRequest) {
    return await this.cmdBus.execute(
      new CreateLanguageCommand(payload.title, payload.code),
    );
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateLanguageResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateLanguageRequest,
  ) {
    return await this.cmdBus.execute(
      new UpdateLanguageCommand(id, payload.title, payload.code),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteLanguageResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteLanguageCommand(id));
  }
}
