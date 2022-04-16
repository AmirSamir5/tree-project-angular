export class ProductItemNode {
  children: ProductItemNode[] = [];
  item: string = '';
}

/** Flat to-do item node with expandable and level information */
export class ProductItemFlatNode {
  item: string = '';
  level: number = 0;
  expandable: boolean = false;
}
