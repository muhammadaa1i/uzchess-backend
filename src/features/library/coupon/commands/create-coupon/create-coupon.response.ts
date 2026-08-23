import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CouponType } from "@/core/enums/coupon-type/coupon-type.enum";

export class CreateCouponResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty({ enum: CouponType })
  @Expose()
  type: CouponType;

  @ApiProperty()
  @Expose()
  value: number;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  expiresAt: Date | null;
}
