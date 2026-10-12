import { HOST_ARIA_ATTRIBUTES } from '#internals/mixins/host-aria.js';
import { setOrRemoveAttribute } from '#internals/utils/dom.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import type { RequiredProps } from '#internals/utils/types.js';
import type IgcTreeItemComponent from './tree-item.js';

export const TREE_TAG = 'igc-tree';
export const TREE_ITEM_TAG = 'igc-tree-item';

/** ARIA state a tree item owns, and which moves with its role. */
const TREE_ITEM_ARIA_STATE = [
  'aria-expanded',
  'aria-selected',
  'aria-disabled',
] as const;

/** The copies of host attributes that each delegate holds, by name. */
const copiedAria = new WeakMap<Element, Map<string, string>>();

export function isTreeItem(
  element?: Element | null
): element is IgcTreeItemComponent {
  return element?.tagName.toLowerCase() === TREE_ITEM_TAG;
}

/**
 * The direct `igc-tree-item` light-DOM children of `parent`.
 *
 * Wrapped items are not supported, so a cheap `.children` scan is enough.
 */
export function getTreeItemChildren(parent: Element): IgcTreeItemComponent[] {
  return Array.from(parent.children).filter(isTreeItem);
}

/**
 * Appends the `igc-tree-item` descendants of `parent` to `out` in pre-order.
 * One shared array keeps the walk of a deep tree linear.
 */
export function collectTreeItems(
  parent: Element,
  out: IgcTreeItemComponent[] = []
): IgcTreeItemComponent[] {
  for (const child of getTreeItemChildren(parent)) {
    out.push(child);
    collectTreeItems(child, out);
  }

  return out;
}

export function hasTreeItemChildren(parent: Element): boolean {
  return Array.from(parent.children).some(isTreeItem);
}

export function clearTreeItemAria(element: Element): void {
  for (const name of TREE_ITEM_ARIA_STATE) {
    element.removeAttribute(name);
  }

  // Only the copies, see `copyHostAria`. The own values of an element stay.
  for (const [name, value] of copiedAria.get(element) ?? []) {
    if (element.getAttribute(name) === value) {
      element.removeAttribute(name);
    }
  }
  copiedAria.delete(element);
}

/** Copies the host ARIA to the element with the role, but keeps its own. @internal */
export function copyHostAria(host: Element, delegate: Element): void {
  const copied = getOrInsertComputed(copiedAria, delegate, () => new Map());

  for (const name of HOST_ARIA_ATTRIBUTES) {
    const current = delegate.getAttribute(name);

    if (current === null || current === copied.get(name)) {
      const value = host.getAttribute(name);
      current !== value && setOrRemoveAttribute(delegate, name, value);
      value === null ? copied.delete(name) : copied.set(name, value);
    }
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
