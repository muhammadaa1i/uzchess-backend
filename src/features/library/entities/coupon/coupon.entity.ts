import { Column, Entity } from "typeorm";
import { BaseModel } from "@/core/base.model";
import { CouponType } from "@/core/enums/coupon-type/coupon-type.enum";

@Entity("coupons")
export class Coupon extends BaseModel {
  @Column({ length: 64, unique: true })
  code: string;

  @Column({ type: "enum", enum: CouponType })
  type: CouponType;

  @Column("integer")
  value: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "timestamp", precision: 0, nullable: true })
  expiresAt: Date | null;
}
