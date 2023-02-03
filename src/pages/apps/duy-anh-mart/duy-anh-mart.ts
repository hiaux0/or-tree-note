import { autoinject, computedFrom, observable } from 'aurelia-framework';

import { ProductDatabase } from './ProductDatabase';
import { Product, EMPTY_PRODUCT } from './ProductEntity';

import './duy-anh-mart.scss';

/**
 * Quickly add new products
 */
const QUICK_MODE = false;

@autoinject()
export class DuyAnhMart {
  private updatedProductPrice: number;
  private readonly shouldAutoAddThousand = true;
  private readonly newProductPrice: number;
  private readonly productCodeInputRef: HTMLElement;
  private readonly newProductPriceInputRef: HTMLElement;

  @observable()
  productCode: string = '';
  product: Product;

  @computedFrom('product.price', 'productCode')
  get priceNotFound() {
    const notFound = this.productCode !== '' && !this.product?.price;
    return notFound;
  }

  constructor(private readonly productDatabase: ProductDatabase) {
    this.productDatabase.init();

    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'c') {
        console.clear();
      }
    });
  }

  productCodeChanged() {
    if (this.productCode === '') {
      this.product = EMPTY_PRODUCT;
      return;
    }

    const product = this.productDatabase.getProduct(this.productCode);

    if (product?.price != null) {
      this.product = product;
      this.updatedProductPrice = this.product.price;
    } else {
      this.product = undefined;
      this.updatedProductPrice = undefined;
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
    let finalNewPrice = this.newProductPrice;
    if (this.shouldAutoAddThousand) {
      finalNewPrice = finalNewPrice * 1000;
    }

    this.productDatabase.addProduct(this.productCode, {
      name: 'testing',
      price: finalNewPrice,
    });
  }

  private updateProduct(): void {
    const finalUpdated: Product = {
      ...this.product,
      price: Number(this.updatedProductPrice),
    };
    this.productDatabase.updateProduct(this.productCode, finalUpdated);
  }
}

/**
 * Features:
 * - search by product name
 * - filters?
 * - history
 * - some kind of versioning
 */
