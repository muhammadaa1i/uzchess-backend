import {ApiProperty} from "@nestjs/swagger";
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
import {CouponType} from "@/core/enums/coupon-type.enum";

export class CreateCouponRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    code: string;

    @ApiProperty({enum: CouponType})
    @IsEnum(CouponType)
    type: CouponType;

    @ApiProperty()
    @IsInt()
    @Min(0)
    value: number;

    @ApiProperty({required: false})
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({required: false, nullable: true})
    @IsDateString()
    @IsOptional()
    expiresAt?: string | null;
}
