import { Product } from './product';

export interface Category {
  categoryID: number;
  categoryName: string;
  description: string;
  picture: string;
  products: Product[];
}
