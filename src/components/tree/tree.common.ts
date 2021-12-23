import IgcTreeItemComponent from './tree-item';

export const IgcTreeSelectionType = {
  None: 'none',
  Multiple: 'multiple',
  Cascade: 'cascade',
} as const;
export type IgcTreeSelectionType =
  typeof IgcTreeSelectionType[keyof typeof IgcTreeSelectionType];

export type IgcTreeSearchResolver = (
  value: any,
  item: IgcTreeItemComponent
) => boolean;

export interface IgcTreeEventMap {
  igcTreeItemSelectionEvent: CustomEvent<any>;
  igcItemExpanding: CustomEvent<any>;
  igcItemExpanded: CustomEvent<any>;
  igcItemCollapsing: CustomEvent<any>;
  igcItemCollapsed: CustomEvent<any>;
}

export interface IgcTreeItemSelectionEventDetails {
  oldSelection: IgcTreeItemComponent[];
  newSelection: IgcTreeItemComponent[];
  added: IgcTreeItemComponent[];
  removed: IgcTreeItemComponent[];
}

export interface IgcTreeItemSelectionEventArgs {
  detail: IgcTreeItemSelectionEventDetails;
  cancelable: boolean;
}
