import { autoinject, observable } from 'aurelia-framework';

import { ProductDatabase } from './ProductDatabase';
import { Product, EMPTY_PRODUCT } from './ProductEntity';

/**
 * Quickly add new products
 */
const QUICK_MODE = false;

@autoinject()
export class DuyAnhMart {
  updatedProductPrice: string;

  newProductPrice: string;

  private readonly productCodeInputRef: HTMLElement;
  private readonly newProductPriceInputRef: HTMLElement;

  @observable()
  productCode: string;
  product: Product;

  constructor(private readonly productDatabase: ProductDatabase) {
    this.productDatabase.init();
  }

  productCodeChanged() {
    if (this.productCode === '') {
      this.product = EMPTY_PRODUCT;
      return;
    }

    const product = this.productDatabase.getProduct(this.productCode);

    if (product?.price != null) {
      this.product = product;
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: duy-anh-mart.ts ~ line 39 ~ this.product', this.product);
      this.updatedProductPrice = this.product.price;
    } else {
      this.prepareToAddNewProduct();
    }
  }

  private prepareToAddNewProduct() {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: duy-anh-mart.ts ~ line 33 ~ prepareToAddNewProduct');
    if (QUICK_MODE) {
      this.productCodeInputRef.blur();
      this.newProductPriceInputRef.focus();
    }
  }

  addNewProduct() {
    this.productDatabase.addProduct(this.productCode, {
      name: 'testing',
      price: this.newProductPrice,
    });
  }

  private updateProduct(): void {
    const finalUpdated: Product = {
      ...this.product,
      price: this.updatedProductPrice,
    };
    this.productDatabase.updateProduct(this.productCode, finalUpdated);
  }
}

/**
 * Features:
 * - search by product name
 * - filters?
 * - history
 */
