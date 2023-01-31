import { ProductImageDTO } from './image.dto';

export class ProductResponseDTO {
  title: string;
  description: string;
  price: number;
  inStock: number;
  categoryId: number;
  images: ProductImageDTO[];

  message: string;

  constructor(partial: Partial<ProductResponseDTO>) {
    Object.assign(this, partial);
  }
}
