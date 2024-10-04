import type IgcTreeItemComponent from './tree-item.js';

export interface IgcTreeComponentEventMap {
  /* alternateName: selectionChanged */
  igcSelection: CustomEvent<TreeSelectionChange>;
  igcItemExpanding: CustomEvent<IgcTreeItemComponent>;
  igcItemExpanded: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsing: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsed: CustomEvent<IgcTreeItemComponent>;
  igcActiveItem: CustomEvent<IgcTreeItemComponent>;
}
export interface IgcSelectionEventArgs {
  detail: TreeSelectionChange;
  cancelable: boolean;
}

export interface TreeSelectionChange {
  newSelection: IgcTreeItemComponent[];
}
