import type { RequiredProps } from '../common/util.js';
import type IgcTreeItemComponent from './tree-item.js';

export const TREE_TAG = 'igc-tree';
export const TREE_ITEM_TAG = 'igc-tree-item';

/** ARIA state a tree item owns, and which moves with its role. */
const TREE_ITEM_ARIA_STATE = [
  'aria-expanded',
  'aria-selected',
  'aria-disabled',
] as const;

function isTreeItem(element: Element): element is IgcTreeItemComponent {
  return element.tagName.toLowerCase() === TREE_ITEM_TAG;
}

/**
 * The direct `igc-tree-item` light-DOM children of `parent`.
 *
 * Items must be nested directly - wrapping one in another element is not
 * supported - which keeps this a cheap `.children` scan rather than a
 * subtree-wide query.
 */
export function getTreeItemChildren(parent: Element): IgcTreeItemComponent[] {
  const result: IgcTreeItemComponent[] = [];

  for (const child of parent.children) {
    if (isTreeItem(child)) {
      result.push(child);
    }
  }

  return result;
}

/** Whether `parent` has at least one direct `igc-tree-item` child. */
export function hasTreeItemChildren(parent: Element): boolean {
  for (const child of parent.children) {
    if (isTreeItem(child)) {
      return true;
    }
  }

  return false;
}

/** Sets an ARIA attribute, or removes it when `value` is null. */
export function setAriaState(
  element: Element,
  name: string,
  value: string | null
): void {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

export function clearTreeItemAria(element: Element): void {
  for (const name of TREE_ITEM_ARIA_STATE) {
    element.removeAttribute(name);
  }
}

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
