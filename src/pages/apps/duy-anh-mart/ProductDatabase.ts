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
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 17 ~ this.database', this.database);
  }

  addProduct(productCode: string, newProduct: Product): void {
    const existingProduct = this.getProduct(productCode);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 20 ~ existingProduct', existingProduct);

    const finalNewProduct = {
      ...existingProduct,
      ...newProduct,
    };
    console.log('New product: ', finalNewProduct);

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
      price: 10000,
    };
  }

  public updateProduct(productCode: string, updatedProduct: Product) {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 52 ~ productCode', productCode);
    const existingProduct = this.getProduct(productCode);

    const finalNewProduct = {
      ...existingProduct,
      ...updatedProduct,
    };
    this.database[productCode] = finalNewProduct;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 59 ~ finalNewProduct', finalNewProduct);

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: ProductDatabase.ts ~ line 62 ~ database', this.database);

    window.localStorage.setItem(
      DUY_ANH_MART_DB_KEY,
      JSON.stringify(this.database)
    );
  }

  public deleteProduct(productCode: string) {
    this.database[productCode] = undefined;
    window.localStorage.setItem(
      DUY_ANH_MART_DB_KEY,
      JSON.stringify(this.database)
    );
  }
}
