import { IsOptional, IsString } from 'class-validator';

export class CategoryUpdateDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
