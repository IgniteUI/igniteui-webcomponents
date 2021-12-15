import IgcTreeComponent from './tree';
import IgcTreeNodeComponent from './tree-node';

export const IgcTreeSelectionType = {
  None: 'none',
  Multiple: 'multiple',
  Cascade: 'cascade',
} as const;
export type IgcTreeSelectionType =
  typeof IgcTreeSelectionType[keyof typeof IgcTreeSelectionType];

export interface IgcTreeEventMap {
  IgcTreeNodeSelectionEvent: CustomEvent<IgcTreeNodeSelectionEventArgs>;
  igcBlur: CustomEvent<void>;
}

export interface IgcTreeNodeSelectionEventDetails {
  oldSelection: IgcTreeNodeComponent[];
  newSelection: IgcTreeNodeComponent[];
  added: IgcTreeNodeComponent[];
  removed: IgcTreeNodeComponent[];
  cancel: boolean;
  owner: IgcTreeComponent;
}

export interface IgcTreeNodeSelectionEventArgs {
  detail: IgcTreeNodeSelectionEventDetails;
  cancelable: boolean;
}
