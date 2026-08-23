import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { CouponType } from "@/core/enums/coupon-type/coupon-type.enum";

export class UpdateCouponRequest {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(64)
  code?: string;

  @ApiProperty({ enum: CouponType, required: false })
  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsDateString()
  @IsOptional()
  expiresAt?: string | null;
}
