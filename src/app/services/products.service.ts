import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLConstants } from '../helpers/constants/urls.constants';
import { ProductModel } from '../models/product.model';

@Injectable()
export class ProductsService {
  readonly PRODUCTS_URL = URLConstants.BASE_URL + '/products.json';

  constructor(private http: HttpClient) {}

  //properties
  productsArray: ProductModel[] = [];
  isProductLoading = false;

  //events
  productChanges = new EventEmitter();
  spinnerLoading = new EventEmitter<boolean>();
  addProductsError = new Subject<string>();
  getProductsError = new Subject<string>();

  //server functions
  addProduct(product: ProductModel) {}

  getProducts() {
    this.startSpinner();

    this.http
      .get<{ [key: string]: ProductModel }>(this.PRODUCTS_URL)
      .pipe(
        map((responseData) => {
          const products: ProductModel[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              products.push({ ...responseData[key], id: key });
            }
          }
          return products;
        })
      )
      .subscribe({
        next: (products) => {
          this.productsArray = products;
          this.stopSpinner();
        },
        error: (error) => {
          this.addProductsError.next(error.message);
          this.stopSpinner();
        },
      });
  }

  //spinner functions
  startSpinner() {
    this.isProductLoading = true;
    this.spinnerLoading.emit();
  }

  stopSpinner() {
    this.isProductLoading = false;
    this.spinnerLoading.emit();
  }
}
