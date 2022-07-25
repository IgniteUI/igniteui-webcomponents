import type IgcTreeItemComponent from './tree-item.js';

export interface IgcTreeEventMap {
  /* alternateName: selectionChanged */
  igcSelection: CustomEvent<{ newSelection: IgcTreeItemComponent[] }>;
  igcItemExpanding: CustomEvent<IgcTreeItemComponent>;
  igcItemExpanded: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsing: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsed: CustomEvent<IgcTreeItemComponent>;
  igcActiveItem: CustomEvent<IgcTreeItemComponent>;
}
export interface IgcSelectionEventArgs {
  detail: { readonly newSelection: IgcTreeItemComponent[] };
  cancelable: boolean;
}
