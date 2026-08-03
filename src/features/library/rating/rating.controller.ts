import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateRatingRequest } from "@/features/library/rating/commands/create-rating/create-rating.request";
import { CreateRatingCommand } from "@/features/library/rating/commands/create-rating/create-rating.command";
import { CreateRatingResponse } from "@/features/library/rating/commands/create-rating/create-rating.response";
import { DeleteRatingCommand } from "@/features/library/rating/commands/delete-rating/delete-rating.command";
import { DeleteRatingResponse } from "@/features/library/rating/commands/delete-rating/delete-rating.response";

@ApiTags("Book Rating")
@Controller("books")
export class RatingController {
  constructor(private readonly cmdBus: CommandBus) {}

  @Post("rate/:id")
  @ApiOkResponse({ type: CreateRatingResponse })
  async create(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: CreateRatingRequest,
    @Req() req: Request,
  ) {
    return await this.cmdBus.execute(
      new CreateRatingCommand(id, req.user!.id, payload),
    );
  }

  @Delete("rate/:id")
  @ApiOkResponse({ type: DeleteRatingResponse })
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(new DeleteRatingCommand(id, req.user!.id));
  }
}
