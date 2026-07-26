import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse } from "@nestjs/swagger";
import { AddFavouriteCommand } from "@/features/library/favourite/commands/add-favourite/add-favourite.command";
import { AddFavouriteResponse } from "@/features/library/favourite/commands/add-favourite/add-favourite.response";
import { RemoveFavouriteCommand } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.command";
import { RemoveFavouriteResponse } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.response";
import { GetFavouritesQuery } from "@/features/library/favourite/queries/get-favourites/get-favourites.query";
import { GetFavouritesResponse } from "@/features/library/favourite/queries/get-favourites/get-favourites.response";

@Controller("favourites")
export class FavouriteController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("read")
  @ApiOkResponse({ type: [GetFavouritesResponse] })
  async getAll(@Req() req: Request) {
    return await this.queryBus.execute(new GetFavouritesQuery(req.user!.id));
  }

  @Post("add/:id")
  @ApiOkResponse({ type: AddFavouriteResponse })
  async add(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(new AddFavouriteCommand(id, req.user!.id));
  }

  @Delete("remove/:id")
  @ApiOkResponse({ type: RemoveFavouriteResponse })
  async remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(
      new RemoveFavouriteCommand(id, req.user!.id),
    );
  }
}
