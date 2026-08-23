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
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {CreateCouponRequest} from "@/features/library/coupon/commands/create-coupon/create-coupon.request";
import {UpdateCouponRequest} from "@/features/library/coupon/commands/update-coupon/update-coupon.request";
import {CreateCouponCommand} from "@/features/library/coupon/commands/create-coupon/create-coupon.command";
import {UpdateCouponCommand} from "@/features/library/coupon/commands/update-coupon/update-coupon.command";
import {DeleteCouponCommand} from "@/features/library/coupon/commands/delete-coupon/delete-coupon.command";
import {CreateCouponResponse} from "@/features/library/coupon/commands/create-coupon/create-coupon.response";
import {UpdateCouponResponse} from "@/features/library/coupon/commands/update-coupon/update-coupon.response";
import {DeleteCouponResponse} from "@/features/library/coupon/commands/delete-coupon/delete-coupon.response";
import {GetCouponsQuery} from "@/features/library/coupon/queries/get-coupons/get-coupons.query";
import {GetCouponsRequest} from "@/features/library/coupon/queries/get-coupons/get-coupons.request";
import {GetCouponsResponse} from "@/features/library/coupon/queries/get-coupons/get-coupons.response";
import {GetCouponByIdQuery} from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.query";
import {GetCouponByIdResponse} from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.response";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role/role.enum";

@ApiTags("Coupon")
@Roles(Role.Admin)
@Controller("coupons")
export class CouponController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Get("read")
    @ApiOkResponse({type: [GetCouponsResponse]})
    async getAll(@Query() payload: GetCouponsRequest) {
        return await this.queryBus.execute(new GetCouponsQuery(payload));
    }

    @Get("read/:id")
    @ApiOkResponse({type: GetCouponByIdResponse})
    async getById(@Param("id", ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetCouponByIdQuery(id));
    }

    @Post("create")
    @ApiOkResponse({type: CreateCouponResponse})
    async create(@Body() payload: CreateCouponRequest) {
        return await this.cmdBus.execute(new CreateCouponCommand(payload));
    }

    @Patch("update/:id")
    @ApiOkResponse({type: UpdateCouponResponse})
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateCouponRequest,
    ) {
        return await this.cmdBus.execute(new UpdateCouponCommand(id, payload));
    }

    @Delete("delete/:id")
    @ApiOkResponse({type: DeleteCouponResponse})
    async delete(@Param("id", ParseIntPipe) id: number) {
        return await this.cmdBus.execute(new DeleteCouponCommand(id));
    }
}
