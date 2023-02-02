import { EMPTY_PRODUCT, Product } from './ProductEntity';

const DUY_ANH_MART_DB_KEY = 'DUY_ANH_MART_DB';

interface DatabaseSchema {
  [code: string]: Product;
}

export class ProductDatabase {
  public database: DatabaseSchema;

  init(): void {
    this.database = JSON.parse(
      window.localStorage.getItem(DUY_ANH_MART_DB_KEY) ?? '{}'
    ) as DatabaseSchema;
  }

  addProduct(productCode: string, newProduct: Product): void {
    const existingProduct = this.getProduct(productCode);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 20 ~ existingProduct', existingProduct);

    const finalNewProduct = {
      ...existingProduct,
      ...newProduct,
    };
    this.database[productCode] = finalNewProduct;

    window.localStorage.setItem(
      DUY_ANH_MART_DB_KEY,
      JSON.stringify(this.database)
    );
  }

  getProduct(productCode: string): Product | undefined {
    const existingProduct = this.database[productCode];
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 29 ~ existingProduct', existingProduct);
    return existingProduct;

    return EMPTY_PRODUCT;

    console.log(productCode);
    return {
      name: 'Water',
      price: '10000',
    };
  }

  public updateProduct(productCode: string, updatedProduct: Product) {
    const existingProduct = this.getProduct(productCode);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 20 ~ existingProduct', existingProduct);

    const finalNewProduct = {
      ...existingProduct,
      ...updatedProduct,
    };
    this.database[productCode] = finalNewProduct;

    window.localStorage.setItem(
      DUY_ANH_MART_DB_KEY,
      JSON.stringify(this.database)
    );
  }
}
