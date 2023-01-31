import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryCreateDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
