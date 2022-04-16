import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ProductsService } from 'src/app/services/products.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProfileInfoComponent } from '../navbar/profile-info/profile-info.component';

import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let productsService: ProductsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductComponent],
      imports: [HttpClientModule],
      providers: [ProductsService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.debugElement.componentInstance;
    // inject the product service
    productsService = fixture.debugElement.injector.get(ProductsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test data binding from product service with a fake data', fakeAsync(() => {
    let data = productsService.buildFileTree({ '': FAKE_TREE_DATA }, 0);
    productsService.dataChange.next(data);
    tick();
    expect(component.dataSource.data).toEqual(data);
  }));
});

const FAKE_TREE_DATA = {
  Phones: {
    Apple: {
      'iPhone 6': ['128GB', '256GB', '512GB'],
      'iPhone 7': ['128GB', '256GB', '512GB'],
    },
    Samsung: {
      'Galaxy S21': ['64GB', '128GB'],
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null,
    },
  },
  Computers: ['Mac Book', 'HP', 'DELL'],
  Watches: ['Apple Watch', 'Samsung Watch'],
};
