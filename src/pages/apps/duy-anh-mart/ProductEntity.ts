export interface Product {
  name: string;
  price: number;
}

export interface SessionProduct extends Product {
  code: string;
}

export const EMPTY_PRODUCT: Product = {
  name: '',
  price: NaN,
};

export const TEST_PRODUCT: Product = {
  name: '',
  price: 123456,
};
