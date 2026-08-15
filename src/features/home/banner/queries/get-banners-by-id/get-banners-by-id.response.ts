import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetBannersByIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  subtitle: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  imageUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  linkUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  badgeText: string | null;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
