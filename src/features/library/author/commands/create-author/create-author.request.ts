import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateAuthorCommand } from '@/features/library/author/commands/create-author/create-author.command';

export class CreateAuthorRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  fullName: string;

  toCommand() {
    return new CreateAuthorCommand(this.fullName);
  }
}
