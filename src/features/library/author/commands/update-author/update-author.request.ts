import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UpdateAuthorCommand } from '@/features/library/author/commands/update-author/update-author.command';

export class UpdateAuthorRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  fullName: string;

  toCommand(id: number) {
    return new UpdateAuthorCommand(id, this.fullName);
  }
}
