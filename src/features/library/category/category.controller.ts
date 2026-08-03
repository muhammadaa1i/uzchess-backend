import { CommandBus, QueryBus } from "@nestjs/cqrs";
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
import { CreateCategoryRequest } from "./commands/create-category/create-category.request";
import { UpdateCategoryRequest } from "./commands/update-category/update-category.request";
import { CreateCategoryCommand } from "@/features/library/category/commands/create-category/create-category.command";
import { UpdateCategoryCommand } from "@/features/library/category/commands/update-category/update-category.command";
import { DeleteCategoryCommand } from "@/features/library/category/commands/delete-category/delete-category.command";
import { GetCategoriesByIdQuery } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.query";
import { GetCategoriesByIdResponse } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.response";
import { GetCategoriesRequest } from "@/features/library/category/queries/get-categories/get-categories.request";
import { GetCategoriesQuery } from "@/features/library/category/queries/get-categories/get-categories.query";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetCategoriesResponse } from "@/features/library/category/queries/get-categories/get-categories.response";
import { PaginatedResultDto } from "../../../core/dtos/paginated-result.dto";
import { CreateCategoryResponse } from "@/features/library/category/commands/create-category/create-category.response";
import { UpdateCategoryResponse } from "@/features/library/category/commands/update-category/update-category.response";
import { DeleteCategoryResponse } from "@/features/library/category/commands/delete-category/delete-category.response";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";
import { Public } from "@/core/decorators/public.decorator";

@ApiTags("Book Categories")
@Roles(Role.Admin)
@Controller("books/categories")
export class CategoryController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  // pagination disabled - category list stays small, kept for potential future reuse
  // @ApiOkResponse({type: PaginatedResultDto(GetCategoriesResponse)})
  @ApiOkResponse({ type: [GetCategoriesResponse] })
  async getAll(@Query() payload: GetCategoriesRequest) {
    return await this.queryBus.execute(new GetCategoriesQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetCategoriesByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetCategoriesByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateCategoryResponse })
  async create(@Body() payload: CreateCategoryRequest) {
    return await this.cmdBus.execute(new CreateCategoryCommand(payload));
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateCategoryResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateCategoryRequest,
  ) {
    return await this.cmdBus.execute(new UpdateCategoryCommand(id, payload));
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteCategoryResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteCategoryCommand(id));
  }
}
