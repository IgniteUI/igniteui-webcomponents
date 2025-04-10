import type { RequiredProps } from '../common/util.js';
import type IgcTreeItemComponent from './tree-item.js';

export interface IgcTreeComponentEventMap {
  /* alternateName: selectionChanged */
  igcSelection: CustomEvent<IgcTreeSelectionEventArgs>;
  igcItemExpanding: CustomEvent<IgcTreeItemComponent>;
  igcItemExpanded: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsing: CustomEvent<IgcTreeItemComponent>;
  igcItemCollapsed: CustomEvent<IgcTreeItemComponent>;
  igcActiveItem: CustomEvent<IgcTreeItemComponent>;
}
export type TreeSelectionEventInit = RequiredProps<
  CustomEventInit<IgcTreeSelectionEventArgs>,
  'detail' | 'cancelable'
>;

export interface IgcTreeSelectionEventArgs {
  newSelection: IgcTreeItemComponent[];
}
