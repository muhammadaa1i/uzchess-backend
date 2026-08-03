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
import { CreateCourseCategoryRequest } from "@/features/common/category/commands/create-category/create-category.request";
import { CreateCourseCategoryCommand } from "@/features/common/category/commands/create-category/create-category.command";
import { CreateCourseCategoryResponse } from "@/features/common/category/commands/create-category/create-category.response";
import { UpdateCourseCategoryRequest } from "@/features/common/category/commands/update-category/update-category.request";
import { UpdateCourseCategoryCommand } from "@/features/common/category/commands/update-category/update-category.command";
import { UpdateCourseCategoryResponse } from "@/features/common/category/commands/update-category/update-category.response";
import { DeleteCourseCategoryCommand } from "@/features/common/category/commands/delete-category/delete-category.command";
import { DeleteCourseCategoryResponse } from "@/features/common/category/commands/delete-category/delete-category.response";
import { GetCourseCategoriesQuery } from "@/features/common/category/queries/get-categories/get-categories.query";
import { GetCourseCategoriesRequest } from "@/features/common/category/queries/get-categories/get-categories.request";
import { GetCourseCategoriesResponse } from "@/features/common/category/queries/get-categories/get-categories.response";
import { GetCourseCategoriesByIdQuery } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.query";
import { GetCourseCategoriesByIdResponse } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.response";

@ApiTags("Course Categories")
@Roles(Role.Admin)
@Controller("courses/categories")
export class CategoryController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("read")
  @ApiOkResponse({ type: [GetCourseCategoriesResponse] })
  async getAll(@Query() payload: GetCourseCategoriesRequest) {
    return await this.queryBus.execute(new GetCourseCategoriesQuery(payload));
  }

  @Public()
  @Get("read/:id")
  @ApiOkResponse({ type: GetCourseCategoriesByIdResponse })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.queryBus.execute(new GetCourseCategoriesByIdQuery(id));
  }

  @Post("create")
  @ApiOkResponse({ type: CreateCourseCategoryResponse })
  async create(@Body() payload: CreateCourseCategoryRequest) {
    return await this.cmdBus.execute(new CreateCourseCategoryCommand(payload));
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateCourseCategoryResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateCourseCategoryRequest,
  ) {
    return await this.cmdBus.execute(
      new UpdateCourseCategoryCommand(id, payload),
    );
  }

  @Delete("delete/:id")
  @ApiOkResponse({ type: DeleteCourseCategoryResponse })
  async delete(@Param("id", ParseIntPipe) id: number) {
    return await this.cmdBus.execute(new DeleteCourseCategoryCommand(id));
  }
}
