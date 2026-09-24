import { isServer } from 'lit';
import { asNumber, clamp, numberInRangeInclusive } from './math.js';
import { isDefined } from './types.js';

/** Returns whether an element has a Left-to-Right directionality. */
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
        // The descriptor is constant, so a rejection means another bundle
        // instance already registered it. The property stays usable.
      }
    }
  }

  return lengthPropertyUsable;
}

/**
 * Resolves a CSS length to pixels in the context of `element`.
 *
 * @remarks
 * Registration makes the property compute to an absolute length, so the
 * browser converts font, viewport and container relative units. Returns 0
 * for percentages, for invalid lengths, during SSR and in a browser without
 * registered custom properties. Resolve percentages against the basis of
 * the applicable property instead.
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

  // Restore rather than remove: the caller may use the property itself.
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
 * Iterates over the DOM subtree of `root` in document order, and yields the
 * nodes that match the {@link IterNodesOptions | options}.
 *
 * @example
 * ```typescript
 * for (const button of iterNodes<HTMLButtonElement>(root, {
 *   show: 'SHOW_ELEMENT',
 *   filter: isButton,
 * })) { ... }
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

/**
 * Iterates over `node` and its element ancestors, and crosses each shadow
 * root through its host.
 *
 * @example
 * ```typescript
 * for (const ancestor of iterAncestors(element)) { ... }
 * ```
 */
export function* iterAncestors(node?: Node | null): Generator<Element> {
  let current: Node | null | undefined = node;

  while (current) {
    if (isElement(current)) {
      yield current;
    }

    current = current instanceof ShadowRoot ? current.host : current.parentNode;
  }
}

/** Returns the root node (document or shadow root) of the given node. */
export function getRoot(
  node: Node,
  options?: GetRootNodeOptions
): Document | ShadowRoot {
  return node.getRootNode(options) as Document | ShadowRoot;
}

/** Returns the element with the given id in the root node of `root`. */
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

/**
 * Maps the `clientX` coordinate of a pointer to a fraction of the element
 * width, in the range 0 to 1.
 *
 * @remarks
 * Measured from the logical start edge: the left one when `ltr` is true, the
 * right one otherwise. Returns 0 for an element that has no layout.
 *
 * @example
 * ```typescript
 * // Pointer 30px into a 120px wide element
 * pointToFraction(element, event.clientX); // 0.25
 * pointToFraction(element, event.clientX, false); // 0.75
 * ```
 */
export function pointToFraction(
  element: Element,
  clientX: number,
  ltr = true
): number {
  const { left, right, width } = element.getBoundingClientRect();

  if (width === 0) {
    return 0;
  }

  return clamp((ltr ? clientX - left : right - clientX) / width, 0, 1);
}

/**
 * Concatenates the text content of the given nodes, trimmed and with each
 * run of whitespace collapsed into one space.
 */
export function normalizedTextContent(nodes: Iterable<Node>): string {
  let text = '';

  for (const node of nodes) {
    text += node.textContent ?? '';
  }

  return text.trim().replace(/\s+/gu, ' ');
}

/** Returns whether the given coordinates lie in the element bounding box. */
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

/** Returns the scale factor of a given element. */
export function getScaleFactor(element: HTMLElement): { x: number; y: number } {
  const { offsetWidth, offsetHeight } = element;
  const { width, height } = element.getBoundingClientRect();
  return { x: offsetWidth / width || 1, y: offsetHeight / height || 1 };
}

/**
 * Rounds a CSS pixel value to the closest device-pixel boundary, to prevent
 * blurry rendering.
 */
export function roundByDPR(value: number): number {
  const dpr = globalThis.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

/**
 * Calls `Element.scrollIntoView` on the element, by default to the nearest
 * block and inline position. Does nothing for an empty element.
 */
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

/** Returns the default containing layer for a floating element. */
export function getDefaultLayer(): HTMLElement {
  return document.body;
}

/**
 * Applies the given CSS declarations to the inline style of the element.
 *
 * @remarks
 * An unset declaration reads as an empty string, never `undefined`, so every
 * given property overwrites the current one.
 */
export function setStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, styles);
}

/** Returns whether the given input has at least one selected file. */
export function hasFiles(input: { files: FileList | null }): boolean {
  return input.files != null && input.files.length > 0;
}

/**
 * Returns whether the given element is an open popover.
 *
 * @remarks
 * Prefer this over the `open` property of a component, which disagrees with
 * the popover state while an open or close animation runs. Reads
 * `:popover-open`, so the element must use the popover API.
 */
export function isPopoverOpen(element?: Element): boolean {
  return element?.matches(':popover-open') ?? false;
}

/**
 * Returns whether the element, or an ancestor across shadow DOM boundaries,
 * has the `sticky` position.
 */
export function hasStickyAncestor(element: Element): boolean {
  for (const ancestor of iterAncestors(element)) {
    if (getComputedStyle(ancestor).position === 'sticky') {
      return true;
    }
  }

  return false;
}

/**
 * Returns the nearest visible ancestor of the given node across shadow DOM
 * boundaries, or `null`.
 */
export function getVisibleAncestor(startNode: Node): HTMLElement | null {
  for (const ancestor of iterAncestors(startNode.parentNode)) {
    if (ancestor instanceof HTMLElement && ancestor.checkVisibility()) {
      return ancestor;
    }
  }

  return null;
}
