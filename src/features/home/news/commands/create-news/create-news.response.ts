import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateNewsResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  excerpt: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  imageUrl: string | null;

  @ApiProperty()
  @Expose()
  publishedAt: Date;
}
