import { EOrderBy } from 'src/shared/utils/enum';

export interface ISearchKey {
  contains: string;
  mode: 'insensitive' | 'default';
}

export interface IProductFilter {
  page: number;
  pageSize: number;
  title?: ISearchKey;
  price?: {
    gte: number;
    lte: number;
  };
  orderBy: {
    title: EOrderBy;
  };
}

export interface IProductCaches {
  search: string;
}
