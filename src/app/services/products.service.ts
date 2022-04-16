import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLConstants } from '../helpers/constants/urls.constants';
import { ProductItemNode } from '../models/product.model';

@Injectable()
export class ProductsService {
  readonly PRODUCTS_URL = URLConstants.BASE_URL + 'products.json';

  constructor(private http: HttpClient) {}

  //properties
  product?: ProductItemNode;
  isProductLoading = false;

  //events
  productChanges = new EventEmitter();
  spinnerLoading = new EventEmitter<boolean>();
  addProductsError = new Subject<string>();
  getProductsError = new Subject<string>();
  dataChange = new BehaviorSubject<ProductItemNode[]>([]);

  //Build an array of items and children to draw the tree
  buildFileTree(obj: { [key: string]: any }, level: number): ProductItemNode[] {
    return Object.keys(obj).reduce<ProductItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new ProductItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  //server functions
  getProducts() {
    this.startSpinner();

    this.http
      .get<{ [key: string]: ProductItemNode }>(this.PRODUCTS_URL)
      .pipe(
        map((responseData) => {
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              this.product = { ...responseData[key] };
            }
          }
          return this.product;
        })
      )
      .subscribe({
        next: (product) => {
          const data = this.buildFileTree(product!, 0);

          // Notify the change.
          this.dataChange.next(data);
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
