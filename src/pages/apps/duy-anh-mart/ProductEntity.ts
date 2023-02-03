export interface Product {
  name: string;
  price: number;
}

export const EMPTY_PRODUCT: Product = {
  name: '',
  price: NaN,
};
