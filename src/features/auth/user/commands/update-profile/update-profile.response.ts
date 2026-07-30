import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UpdateProfileResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty({ nullable: true })
  @Expose()
  avatar: string | null;
}
