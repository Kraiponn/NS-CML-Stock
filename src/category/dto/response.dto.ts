export class CategoryResponseDTO {
  id: number;
  title: string;
  description: string;

  message: string;

  constructor(partial: Partial<CategoryResponseDTO>) {
    Object.assign(this, partial);
  }
}
