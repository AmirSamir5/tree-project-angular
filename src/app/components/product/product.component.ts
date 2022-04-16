import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import {
  ProductItemFlatNode,
  ProductItemNode,
} from 'src/app/models/product.model';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent {
  /* a boolean which indicates server loading */
  isLoading = false;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ProductItemFlatNode, ProductItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ProductItemNode, ProductItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ProductItemFlatNode | null = null;

  treeControl: FlatTreeControl<ProductItemFlatNode>;

  treeFlattener: MatTreeFlattener<ProductItemNode, ProductItemFlatNode>;

  dataSource: MatTreeFlatDataSource<ProductItemNode, ProductItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<ProductItemFlatNode>(
    true /* multiple */
  );

  constructor(private productsService: ProductsService) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<ProductItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    productsService.spinnerLoading.subscribe(() => {
      this.isLoading = productsService.isProductLoading;
    });

    this.productsService.getProducts();

    productsService.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: ProductItemFlatNode) => node.level;

  isExpandable = (node: ProductItemFlatNode) => node.expandable;

  getChildren = (node: ProductItemNode): ProductItemNode[] => node.children!;

  hasChild = (_: number, _nodeData: ProductItemFlatNode) =>
    _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ProductItemFlatNode) =>
    _nodeData.item === '';

  transformer = (node: ProductItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new ProductItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ProductItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ProductItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ProductItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ProductItemFlatNode): void {
    this.checklistSelection.toggle(node);
  }

  /* Get the parent node of a node */
  getParentNode(node: ProductItemFlatNode): string | null {
    var parent = '';
    var currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        parent = currentNode.item + ' - ' + parent;
        currentLevel--;
      }
      if (currentLevel === 0) {
        return parent;
      }
    }
    return parent;
  }
}
