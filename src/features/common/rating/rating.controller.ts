import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateCourseRatingRequest } from "@/features/common/rating/commands/create-rating/create-rating.request";
import { CreateRatingCommand } from "@/features/common/rating/commands/create-rating/create-rating.command";
import { CreateCourseRatingResponse } from "@/features/common/rating/commands/create-rating/create-rating.response";
import { DeleteRatingCommand } from "@/features/common/rating/commands/delete-rating/delete-rating.command";
import { DeleteCourseRatingResponse } from "@/features/common/rating/commands/delete-rating/delete-rating.response";
import { GetCourseReviewsQuery } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.query";
import { GetCourseReviewsRequest } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.request";
import { GetCourseReviewsResponse } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";
import { Public } from "@/core/decorators/public.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role/role.enum";

@ApiTags("Course Rating")
@Controller("courses")
export class RatingController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get("reviews/:id")
  @ApiOkResponse({ type: PaginatedResultDto(GetCourseReviewsResponse) })
  async getAll(
    @Param("id", ParseIntPipe) id: number,
    @Query() payload: GetCourseReviewsRequest,
  ) {
    return await this.queryBus.execute(new GetCourseReviewsQuery(id, payload));
  }

  @Post("rate/:id")
  @ApiOkResponse({ type: CreateCourseRatingResponse })
  async create(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: CreateCourseRatingRequest,
    @Req() req: Request,
  ) {
    return await this.cmdBus.execute(
      new CreateRatingCommand(id, req.user!.id, payload),
    );
  }

  @Delete("rate/:id")
  @ApiOkResponse({ type: DeleteCourseRatingResponse })
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(new DeleteRatingCommand(id, req.user!.id));
  }

  @Roles(Role.Admin)
  @Delete("rate/:courseId/:userId")
  @ApiOkResponse({ type: DeleteCourseRatingResponse })
  async deleteAsAdmin(
    @Param("courseId", ParseIntPipe) courseId: number,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return await this.cmdBus.execute(new DeleteRatingCommand(courseId, userId));
  }
}
