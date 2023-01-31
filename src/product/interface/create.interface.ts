export interface IProductCreate {
  title: string;
  description?: string;
  price: number;
  inStock: number;
  categoryId: number;
}
