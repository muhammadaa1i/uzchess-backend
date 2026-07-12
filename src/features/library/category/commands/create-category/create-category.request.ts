import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateCategoryCommand } from '@/features/library/category/commands/create-category/create-category.command';

export class CreateCategoryRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  title: string;

  toCommand() {
    return new CreateCategoryCommand(this.title);
  }
}
