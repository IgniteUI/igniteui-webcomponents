import { isServer } from 'lit';
import { asNumber, numberInRangeInclusive } from './math.js';
import { merge } from './objects.js';
import { isDefined } from './types.js';

/**
 * Returns whether an element has a Left-to-Right directionality.
 */
export function isLTR(element: HTMLElement) {
  return element.matches(':dir(ltr)');
}

const LENGTH_PROPERTY = '--igc-resolved-length';

const SUPPORTS_REGISTERED_PROPERTIES =
  !isServer && typeof CSS !== 'undefined' && 'registerProperty' in CSS;

let lengthPropertyUsable: boolean | undefined;

function canResolveLengths(): boolean {
  if (lengthPropertyUsable === undefined) {
    lengthPropertyUsable = SUPPORTS_REGISTERED_PROPERTIES;

    if (lengthPropertyUsable) {
      try {
        CSS.registerProperty({
          name: LENGTH_PROPERTY,
          syntax: '<length>',
          inherits: false,
          initialValue: '0px',
        });
      } catch {
        // The descriptor is a constant, so the only realistic rejection is a
        // duplicate registration from another bundle instance - which leaves
        // the property just as usable.
      }
    }
  }

  return lengthPropertyUsable;
}

/**
 * Resolves a CSS length to pixels in the context of `element`.
 *
 * A registered custom property computes to an absolute length, which lets the
 * browser do the conversion for font, viewport and container relative units
 * instead of them being read as raw numbers. Percentages are not lengths -
 * resolve those against whatever basis applies to the property at hand.
 *
 * Returns 0 for percentages, for values that are not valid lengths, and where
 * the resolution is unavailable - during server-side rendering, or without
 * support for registered custom properties. Guessing from the raw token would
 * read `5rem` as 5 pixels, so callers get an obvious zero instead.
 *
 * @example
 * ```typescript
 * resolveCssLength(element, '5rem'); // 80
 * resolveCssLength(element, '2em'); // 2 x the element font size
 * ```
 */
export function resolveCssLength(element: HTMLElement, value: string): number {
  if (!canResolveLengths()) {
    return 0;
  }

  const { style } = element;
  const previous = style.getPropertyValue(LENGTH_PROPERTY);
  const priority = style.getPropertyPriority(LENGTH_PROPERTY);

  style.setProperty(LENGTH_PROPERTY, value);
  const resolved = getComputedStyle(element).getPropertyValue(LENGTH_PROPERTY);

  // Restore rather than remove - the caller may be using the property itself.
  if (previous) {
    style.setProperty(LENGTH_PROPERTY, previous, priority);
  } else {
    style.removeProperty(LENGTH_PROPERTY);
  }

  return asNumber(resolved);
}

export type IterNodesOptions<T = Node> = {
  show?: keyof typeof NodeFilter;
  filter?: (node: T) => boolean;
};

function createNodeFilter<T extends Node>(predicate: (node: T) => boolean) {
  return {
    acceptNode: (node: T): number =>
      predicate(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  };
}

/**
 * Iterates over the DOM subtree of `root` in document order, yielding the nodes
 * matching the passed {@link IterNodesOptions | options}.
 *
 * @example
 * ```typescript
 * for (const button of iterNodes<HTMLButtonElement>(root, { show: 'SHOW_ELEMENT', filter: isButton })) { ... }
 * ```
 */
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

/** Returns the root node (document or shadow root) of the given element. */
export function getRoot(
  element: Element,
  options?: GetRootNodeOptions
): Document | ShadowRoot {
  return element.getRootNode(options) as Document | ShadowRoot;
}

/** Returns the element with the given id in the root node of `root`, if any. */
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

/** Rounds a CSS pixel value to the closest device-pixel boundary to avoid blurry rendering. */
export function roundByDPR(value: number): number {
  const dpr = globalThis.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

/** Null-safe `Element.scrollIntoView` defaulting to the nearest block/inline position. */
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

/** Applies the given CSS declarations to the inline style of the element. */
export function setStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  merge(element.style, styles);
}

/** Returns whether the given input has at least one selected file. */
export function hasFiles(input: { files: FileList | null }): boolean {
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
