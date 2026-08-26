import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";

export class GetNewsByIdResponse {
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

  @ApiProperty()
  @Expose()
  viewsCount: number;

  @ApiProperty({ type: [GetNewsResponse] })
  @Expose()
  @Type(() => GetNewsResponse)
  relatedNews: GetNewsResponse[];
}
