import { autoinject, computedFrom, observable } from 'aurelia-framework';

import { ProductDatabase } from './ProductDatabase';
import {
  Product,
  EMPTY_PRODUCT,
  TEST_PRODUCT,
  SessionProduct,
} from './ProductEntity';

import './duy-anh-mart.scss';

/**
 * Quickly add new products
 */
const QUICK_MODE = true;

@autoinject()
export class DuyAnhMart {
  private readonly sessionProduct: SessionProduct;
  private readonly shouldAutoAddThousand = true;
  private readonly newProductPrice: number;
  private readonly newProductName: string;
  private readonly productCodeInputRef: HTMLInputElement;
  private readonly newProductPriceInputRef: HTMLElement;

  private updatedProductName: string;
  private updatedProductPrice: number;
  private sessionCollection: SessionProduct[] = [];

  // currentProduct: Product = TEST_PRODUCT;
  currentProduct: Product;
  /** The one just scanned before auto-reset */
  previousProductCode: string = '';

  @observable()
  productCode: string = '';
  @observable()
  newlyAddedProduct: Product;

  @computedFrom('currentProduct.price')
  get canEditPrice() {
    const priceFound = this.currentProduct?.price;
    return priceFound;
  }

  @computedFrom('currentProduct.price')
  get priceNotFound() {
    const productCodeExists = this.productCode !== '';
    const noPriceFound = !this.currentProduct?.price;
    const notFound = productCodeExists && noPriceFound;
    return notFound;
  }

  @computedFrom('sessionCollection.length')
  get sessionSum() {
    const sum = this.sessionCollection.reduce((acc, product) => {
      acc += product.price;
      return acc;
    }, 0);

    return sum;
  }

  constructor(private readonly productDatabase: ProductDatabase) {
    this.productDatabase.init();

    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'c') {
        console.clear();
      }
    });
  }

  attached() {
    this.addKeyListeners();
  }

  private addKeyListeners(): void {
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        this.clearSession();
      }
    });

    this.productCodeInputRef.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        this.handleProductCodeChanged();
      }
    });
  }

  handleProductCodeChanged() {
    // if (this.productCode === '') {
    //   this.currentProduct = EMPTY_PRODUCT;
    //   return;
    // }

    const product = this.productDatabase.getProduct(this.productCode);

    if (product?.price != null) {
      // Set product
      this.previousProductCode = this.productCode;
      this.currentProduct = product;
      this.updatedProductPrice = this.currentProduct.price;
      this.updatedProductName = this.currentProduct.name;

      this.sessionCollection.push({
        ...product,
        code: this.productCode,
        time: new Date().toLocaleTimeString(),
      });

      // Clear code input, in order to scan new products
      this.productCode = '';
    } else {
      // this.priceNotFound = true;
      this.clearCurrentProduct();
      this.prepareToAddNewProduct();
    }
  }

  newlyAddedProductChanged() {
    window.setTimeout(() => {
      this.newlyAddedProduct = undefined;
    }, 5000);
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

    const newProduct = {
      name: this.newProductName,
      price: finalNewPrice,
    };
    this.newlyAddedProduct = newProduct;

    this.productDatabase.addProduct(this.productCode, newProduct);
  }

  private updateProduct(): void {
    const finalUpdated: Product = {
      ...this.currentProduct,
      price: Number(this.updatedProductPrice),
      name: this.updatedProductName,
    };

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: duy-anh-mart.ts ~ line 158 ~ finalUpdated', finalUpdated);
    this.productDatabase.updateProduct(this.previousProductCode, finalUpdated);
  }

  private deleteProduct(): void {
    this.productDatabase.deleteProduct(this.previousProductCode);
  }

  private clearCurrentProduct() {
    // @ts-ignore
    this.currentProduct = {};
    // this.currentProduct = undefined;
    this.updatedProductPrice = undefined;
  }

  private clearSession(): void {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: duy-anh-mart.ts ~ line 140 ~ clearSession');
    this.sessionCollection = [];
    this.clearCurrentProduct();
    this.productCode = '';
    this.productCodeInputRef.value = '';
    this.productCodeInputRef.focus();
  }
}

/**
 * Features:
 * - search by product name
 * - filters?
 * - history
 * - some kind of versioning
 */
