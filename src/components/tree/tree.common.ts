import IgcTreeNodeComponent from './tree-node';

export const IgcTreeSelectionType = {
  None: 'none',
  Multiple: 'multiple',
  Cascade: 'cascade',
} as const;
export type IgcTreeSelectionType =
  typeof IgcTreeSelectionType[keyof typeof IgcTreeSelectionType];

export interface IgcTreeEventMap {
  IgcTreeNodeSelectionEvent: CustomEvent<any>;
  igcBlur: CustomEvent<void>;
}

export interface IgcTreeNodeSelectionEventDetails {
  oldSelection: IgcTreeNodeComponent[];
  newSelection: IgcTreeNodeComponent[];
  added: IgcTreeNodeComponent[];
  removed: IgcTreeNodeComponent[];
}

export interface IgcTreeNodeSelectionEventArgs {
  detail: IgcTreeNodeSelectionEventDetails;
  cancelable: boolean;
}
