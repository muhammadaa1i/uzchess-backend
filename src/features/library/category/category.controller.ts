import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query} from "@nestjs/common";
import {CreateCategoryRequest} from "./commands/create-category/create-category.request";
import {UpdateCategoryRequest} from "./commands/update-category/update-category.request";
import {DeleteCategoryCommand} from "@/features/library/category/commands/delete-category/delete-category.command";
import {GetCategoryByIdQuery} from "@/features/library/category/queries/get-category-by-id/get-category-by-id.query";
import {
    GetCategoryByIdResponse
} from "@/features/library/category/queries/get-category-by-id/get-category-by-id.response";
import {GetCategoriesRequest} from "@/features/library/category/queries/get-categories/get-categories.request";
import {ApiOkResponse} from "@nestjs/swagger";
import {GetCategoriesResponse} from "@/features/library/category/queries/get-categories/get-categories.response";
import {PaginatedResultDto} from "@/features/common/dtos/paginated-result.dto";
import {CreateCategoryResponse} from "@/features/library/category/commands/create-category/create-category.response";
import {UpdateCategoryResponse} from "@/features/library/category/commands/update-category/update-category.response";
import {DeleteCategoryResponse} from "@/features/library/category/commands/delete-category/delete-category.response";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";
import {Public} from "@/core/decorators/public.decorator";

@Roles(Role.Admin)
@Controller("category")
export class CategoryController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @Get("read")
    @ApiOkResponse({type: PaginatedResultDto(GetCategoriesResponse)})
    async getAll(@Query() payload: GetCategoriesRequest) {
        return await this.queryBus.execute(payload.toQuery());
    }

    @Public()
    @Get("read/:id")
    @ApiOkResponse({type: GetCategoryByIdResponse})
    async getById(@Param("id", ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetCategoryByIdQuery(id));
    }

    @Post("create")
    @ApiOkResponse({type: CreateCategoryResponse})
    async create(@Body() payload: CreateCategoryRequest) {
        return await this.cmdBus.execute(payload.toCommand());
    }

    @Patch("update/:id")
    @ApiOkResponse({type: UpdateCategoryResponse})
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateCategoryRequest,
    ) {
        return await this.cmdBus.execute(payload.toCommand(id));
    }

    @Delete("delete/:id")
    @ApiOkResponse({type: DeleteCategoryResponse})
    async delete(@Param("id", ParseIntPipe) id: number) {
        return await this.cmdBus.execute(new DeleteCategoryCommand(id));
    }
}
