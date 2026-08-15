import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetNewsResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  excerpt: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  imageUrl: string | null;

  @ApiProperty()
  @Expose()
  publishedAt: Date;
}
