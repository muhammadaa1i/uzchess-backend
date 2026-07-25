import {Body, Controller, Delete, Param, ParseIntPipe, Post, Req} from "@nestjs/common";
import type {Request} from "express";
import {CommandBus} from "@nestjs/cqrs";
import {ApiOkResponse} from "@nestjs/swagger";
import {RateBookRequest} from "@/features/library/rating/commands/rate-book/rate-book.request";
import {RateBookCommand} from "@/features/library/rating/commands/rate-book/rate-book.command";
import {RateBookResponse} from "@/features/library/rating/commands/rate-book/rate-book.response";
import {DeleteRatingCommand} from "@/features/library/rating/commands/delete-rating/delete-rating.command";
import {DeleteRatingResponse} from "@/features/library/rating/commands/delete-rating/delete-rating.response";

@Controller('books')
export class RatingController {
    constructor(private readonly cmdBus: CommandBus) {
    }

    @Post('rate/:id')
    @ApiOkResponse({type: RateBookResponse})
    async rate(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: RateBookRequest,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(new RateBookCommand(id, req.user!.id, payload.score))
    }

    @Delete('rate/:id')
    @ApiOkResponse({type: DeleteRatingResponse})
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(new DeleteRatingCommand(id, req.user!.id))
    }
}
