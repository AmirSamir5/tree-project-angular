import { BrandModel } from './brand.model';

export interface ProductModel {
  id?: string;
  name?: string;
  brand?: BrandModel[];
}
