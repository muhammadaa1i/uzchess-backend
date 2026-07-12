import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UpdateCategoryCommand } from '@/features/library/category/commands/update-category/update-category.command';

export class UpdateCategoryRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  @IsNotEmpty()
  title: string;

  toCommand(id: number) {
    return new UpdateCategoryCommand(id, this.title);
  }
}
