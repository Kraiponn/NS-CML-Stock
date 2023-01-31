import { ProductResponseDTO } from './response.dto';

export class ProductResponseWithPaginateDTO {
  total: number;
  page: number;
  pageSize: number;
  products: ProductResponseDTO[];

  constructor(partial: Partial<ProductResponseWithPaginateDTO>) {
    Object.assign(this, partial);
  }
}
