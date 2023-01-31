import { CategoryResponseDTO } from './response.dto';

export class CategoryResponseWithPaginateDTO {
  total: number;
  page: number;
  pageSize: number;
  categories: CategoryResponseDTO[];

  constructor(partial: Partial<CategoryResponseWithPaginateDTO>) {
    Object.assign(this, partial);
  }
}
