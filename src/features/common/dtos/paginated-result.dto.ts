import { ApiProperty } from "@nestjs/swagger";
import { Type } from "@nestjs/common";
import { Expose } from "class-transformer";

export function PaginatedResultDto<T>(ItemDto: Type<T>) {
  class PaginatedResultResponse {
    @ApiProperty()
    @Expose()
    totalCount: number;

    @ApiProperty()
    @Expose()
    totalPages: number;

    @ApiProperty()
    @Expose()
    currentPage: number;

    @ApiProperty()
    @Expose()
    hasNext: boolean;

    @ApiProperty()
    @Expose()
    hasPrevious: boolean;

    @ApiProperty({ type: [ItemDto] })
    @Expose()
    data: T[];
  }

  return PaginatedResultResponse;
}
