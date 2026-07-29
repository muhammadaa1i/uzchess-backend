import {
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
} from "@nestjs/common";
import type {Request} from "express";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiOkResponse} from "@nestjs/swagger";
import {AddFavouriteCommand} from "@/features/common/favourite/commands/add-favourite/add-favourite.command";
import {AddCourseFavouriteResponse} from "@/features/common/favourite/commands/add-favourite/add-favourite.response";
import {RemoveFavouriteCommand} from "@/features/common/favourite/commands/remove-favourite/remove-favourite.command";
import {
    RemoveCourseFavouriteResponse
} from "@/features/common/favourite/commands/remove-favourite/remove-favourite.response";
import {GetFavouritesQuery} from "@/features/common/favourite/queries/get-favourites/get-favourites.query";
import {GetCourseFavouritesResponse} from "@/features/common/favourite/queries/get-favourites/get-favourites.response";

@Controller("courses")
export class FavouriteController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Get("favourites")
    @ApiOkResponse({type: [GetCourseFavouritesResponse]})
    async getAll(@Req() req: Request) {
        return await this.queryBus.execute(new GetFavouritesQuery(req.user!.id));
    }

    @Post("favourite/:id")
    @ApiOkResponse({type: AddCourseFavouriteResponse})
    async create(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return await this.cmdBus.execute(
            new AddFavouriteCommand(id, req.user!.id),
        );
    }

    @Delete("favourite/:id")
    @ApiOkResponse({type: RemoveCourseFavouriteResponse})
    async delete(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return await this.cmdBus.execute(
            new RemoveFavouriteCommand(id, req.user!.id),
        );
    }
}
