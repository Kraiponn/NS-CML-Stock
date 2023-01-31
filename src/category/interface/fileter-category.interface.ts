import { EOrderBy } from 'src/shared/utils/enum';

export interface IFilterKey {
  contains: string;
  mode: 'insensitive' | 'default';
}

export interface IFilterGetCategory {
  title?: IFilterKey;

  skip: number;
  take: number;
  orderBy: {
    title: EOrderBy;
  };
  page: number;
  pageSize: number;
}
