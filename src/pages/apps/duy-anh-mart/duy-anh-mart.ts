import { autoinject, observable } from 'aurelia-framework';

import { ProductDatabase } from './ProductDatabase';

@autoinject()
export class DuyAnhMart {
  @observable()
  productCode: string;
  product: string;

  constructor(private readonly productDatabase: ProductDatabase) {}

  productCodeChanged() {
    const productPrice = this.productDatabase.getProduct(this.productCode);
    this.product = productPrice;
  }
}

/**
 * Features:
 * - search by product name
 * - filters?
 */
