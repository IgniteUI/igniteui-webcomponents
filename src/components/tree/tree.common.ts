import IgcTreeItemComponent from './tree-item';

export const IgcTreeSelectionType = {
  None: 'none',
  Multiple: 'multiple',
  Cascade: 'cascade',
} as const;
export type IgcTreeSelectionType =
  typeof IgcTreeSelectionType[keyof typeof IgcTreeSelectionType];

export interface IgcTreeEventMap {
  igcSelection: CustomEvent<any>;
  igcItemExpanding: CustomEvent<any>;
  igcItemExpanded: CustomEvent<any>;
  igcItemCollapsing: CustomEvent<any>;
  igcItemCollapsed: CustomEvent<any>;
  igcActiveItem: CustomEvent<any>;
}
export interface IgcSelectionEventArgs {
  detail: { readonly newSelection: IgcTreeItemComponent[] };
  cancelable: boolean;
}
