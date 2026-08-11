import type IgcFileInputComponent from '../../components/file-input/file-input.js';
import { numberInRangeInclusive } from './math.js';
import { merge } from './objects.js';
import { isDefined } from './types.js';

/**
 * Returns whether an element has a Left-to-Right directionality.
 */
export function isLTR(element: HTMLElement) {
  return element.matches(':dir(ltr)');
}

export type IterNodesOptions<T = Node> = {
  show?: keyof typeof NodeFilter;
  filter?: (node: T) => boolean;
};

function createNodeFilter<T extends Node>(predicate: (node: T) => boolean) {
  return {
    acceptNode: (node: T): number =>
      !predicate || predicate(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  };
}

export function* iterNodes<T extends Node>(
  root: Node,
  options?: IterNodesOptions<T>
): Generator<T> {
  if (!isDefined(globalThis.document)) {
    return;
  }

  const whatToShow = options?.show
    ? NodeFilter[options.show]
    : NodeFilter.SHOW_ALL;

  const nodeFilter = options?.filter
    ? createNodeFilter(options.filter)
    : undefined;

  const treeWalker = document.createTreeWalker(root, whatToShow, nodeFilter);

  while (treeWalker.nextNode()) {
    yield treeWalker.currentNode as T;
  }
}

export function getRoot(
  element: Element,
  options?: GetRootNodeOptions
): Document | ShadowRoot {
  return element.getRootNode(options) as Document | ShadowRoot;
}

export function getElementByIdFromRoot(root: HTMLElement, id: string) {
  return getRoot(root).getElementById(id);
}

export function isElement(node: unknown): node is Element {
  return node instanceof Node && node.nodeType === Node.ELEMENT_NODE;
}

export function isDocument(node: unknown): node is Document {
  return node instanceof Node && node.nodeType === Node.DOCUMENT_NODE;
}

/** Returns the center x/y coordinate of a given element. */
export function getCenterPoint(element: Element): { x: number; y: number } {
  const { left, top, width, height } = element.getBoundingClientRect();

  return {
    x: left + width * 0.5,
    y: top + height * 0.5,
  };
}

/** Returns whether the given client coordinates lie within the bounding box of the element. */
export function isPointInsideElement(
  element: Element,
  x: number,
  y: number
): boolean {
  const { left, right, top, bottom } = element.getBoundingClientRect();
  return (
    numberInRangeInclusive(x, left, right) &&
    numberInRangeInclusive(y, top, bottom)
  );
}

/** Returns the scale factor of a given element based on its bounding client rect and offset dimensions. */
export function getScaleFactor(element: HTMLElement): { x: number; y: number } {
  const { offsetWidth, offsetHeight } = element;
  const { width, height } = element.getBoundingClientRect();
  return { x: offsetWidth / width || 1, y: offsetHeight / height || 1 };
}

export function roundByDPR(value: number): number {
  const dpr = globalThis.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

export function scrollIntoView(
  element?: HTMLElement | null,
  config?: ScrollIntoViewOptions
): void {
  if (!element) {
    return;
  }

  element.scrollIntoView(
    Object.assign(
      {
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      },
      config
    )
  );
}

export function setStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  merge(element.style, styles);
}

export function hasFiles(
  input: HTMLInputElement | IgcFileInputComponent
): boolean {
  return input.files != null && input.files.length > 0;
}

/**
 * Returns whether the given element is currently an open popover or not.
 * This is useful to determine if the popover is open without relying on the `open` property, which may not be in sync with the actual popover state if the opening/closing animations are still running.
 * Note: This function only works for elements that use the `:popover-open` pseudo-class to indicate
 */
export function isPopoverOpen(element?: Element): boolean {
  return element?.matches(':popover-open') ?? false;
}

/**
 * Returns the nearest visible ancestor of a given node, traversing through shadow DOM boundaries if necessary. If no visible ancestor is found, returns null.
 */
export function getVisibleAncestor(startNode: Node): HTMLElement | null {
  let node: Node | null = startNode.parentNode;

  while (node) {
    if (node instanceof ShadowRoot) {
      node = node.host;
      continue;
    }

    if (node instanceof HTMLElement && node.checkVisibility()) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
}
