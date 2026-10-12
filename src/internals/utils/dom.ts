import { isServer } from 'lit';
import { asNumber, clamp, numberInRangeInclusive } from './math.js';
import { isDefined } from './types.js';

/**
 * Returns whether an element has a Left-to-Right directionality. SSR cannot
 * resolve the directionality, so on the server the function returns true.
 */
export function isLTR(element: HTMLElement) {
  return isServer || element.matches(':dir(ltr)');
}

const LENGTH_PROPERTY = '--igc-resolved-length';

/** A plain pixel length, which needs no style resolution. */
const PIXEL_LENGTH = /^\d*\.?\d+px$/;

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
 */
export function resolveCssLength(element: HTMLElement, value: string): number {
  if (!canResolveLengths()) {
    return 0;
  }

  if (PIXEL_LENGTH.test(value)) {
    return asNumber(value);
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
 * root through its host. With `flat`, a slotted node goes to its slot, as in
 * the flat tree.
 */
export function* iterAncestors(
  node?: Node | null,
  flat = false
): Generator<Element> {
  let current: Node | null | undefined = node;

  while (current) {
    if (isElement(current)) {
      yield current;
    }

    current =
      (flat && (current as Element).assignedSlot) ||
      (current instanceof ShadowRoot ? current.host : current.parentNode);
  }
}

/** Returns the root node (document or shadow root) of the given node. */
export function getRoot(node: Node): Document | ShadowRoot {
  return node.getRootNode() as Document | ShadowRoot;
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

/** The edges of a box, in viewport coordinates. */
export type Box = Pick<DOMRectReadOnly, 'left' | 'top' | 'right' | 'bottom'>;

/** Returns whether two boxes match to half a pixel. */
export function isSameBox(a: Box, b: Box): boolean {
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.right - b.right) < 0.5 &&
    Math.abs(a.bottom - b.bottom) < 0.5
  );
}

/** Returns the overlap of two boxes, which can be empty. */
export function intersectBoxes(a: Box, b: Box): Box {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
}

/** Returns whether the box has no area. */
export function isEmptyBox(box: Box): boolean {
  return box.right <= box.left || box.bottom <= box.top;
}

/** Returns the effective CSS zoom of the element, or 1 in an engine without it. */
export function getCSSZoom(element: Element): number {
  return element.currentCSSZoom || 1;
}

/**
 * Returns the padding box of the element in viewport coordinates, without the
 * scrollbars.
 *
 * @remarks
 * The client rects include the CSS zoom, but the client metrics do not.
 */
export function getPaddingBox(element: Element): Box {
  const zoom = getCSSZoom(element);
  const rect = element.getBoundingClientRect();
  const left = rect.left + element.clientLeft * zoom;
  const top = rect.top + element.clientTop * zoom;

  return {
    left,
    top,
    right: left + element.clientWidth * zoom,
    bottom: top + element.clientHeight * zoom,
  };
}

/** Overflow and containment have no effect on an inline box or on no box. */
function canContain(style: CSSStyleDeclaration): boolean {
  return style.display !== 'inline' && style.display !== 'contents';
}

/**
 * Returns the padding box that clips the content of the element, or `null`
 * when it clips nothing. An axis that it does not clip has infinite edges.
 *
 * @remarks
 * Paint containment, also from `content-visibility`, clips both axes.
 */
export function getOverflowClip(
  element: Element,
  style = getComputedStyle(element)
): Box | null {
  const contained =
    /\b(paint|content|strict)\b/.test(style.contain) ||
    style.contentVisibility !== 'visible';
  const clipX = contained || style.overflowX !== 'visible';
  const clipY = contained || style.overflowY !== 'visible';

  if (!(clipX || clipY) || !canContain(style)) {
    return null;
  }

  const box = getPaddingBox(element);

  return {
    left: clipX ? box.left : -Infinity,
    top: clipY ? box.top : -Infinity,
    right: clipX ? box.right : Infinity,
    bottom: clipY ? box.bottom : Infinity,
  };
}

const CORNERS = [
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
] as const;

/** Returns the border radius in `style`, or `null` when every corner is square. */
export function getBorderRadius(style: CSSStyleDeclaration): string | null {
  const radius = style.borderRadius;

  // The corners are needed only for `0%` and for mixed values.
  if (radius === '0px') {
    return null;
  }

  return CORNERS.some((corner) => Number.parseFloat(style[corner]) !== 0)
    ? radius
    : null;
}

/**
 * Returns the border radius of the element, or of the first rounded shadow
 * element at any depth that covers it, such as the base part of a component.
 * Returns `null` when every corner is square.
 */
export function getDeepBorderRadius(
  element: Element,
  style = getComputedStyle(element)
): string | null {
  const radius = getBorderRadius(style);

  if (radius || !element.shadowRoot) {
    return radius;
  }

  const box = element.getBoundingClientRect();
  const findCover = (parent: Element): Element | undefined =>
    Array.from((parent.shadowRoot ?? parent).children).find((child) =>
      isSameBox(child.getBoundingClientRect(), box)
    );

  for (let cover = findCover(element); cover; cover = findCover(cover)) {
    const coverRadius = getBorderRadius(getComputedStyle(cover));
    if (coverRadius) return coverRadius;
  }

  return null;
}

/**
 * Returns whether the element skips the rendering of its child node `child`,
 * through `content-visibility: hidden` on the element or, for all but the
 * summary of a `<details>`, on its `::details-content`.
 *
 * @remarks
 * `checkVisibility()` is false for a skipped element, but a range still
 * measures skipped text.
 */
export function skipsRendering(
  element: Element,
  child: Node,
  style = getComputedStyle(element)
): boolean {
  if (!canContain(style)) {
    return false;
  }

  if (style.contentVisibility === 'hidden') {
    return true;
  }

  if (
    !(element instanceof HTMLDetailsElement) ||
    child === element.querySelector(':scope > summary')
  ) {
    return false;
  }

  // An engine without `::details-content` reads an empty value.
  const content = getComputedStyle(
    element,
    '::details-content'
  ).contentVisibility;

  return content ? content === 'hidden' : !element.open;
}

/**
 * Calls `Element.scrollIntoView` on the element, by default to the nearest
 * block and inline position. Does nothing for an empty element.
 */
export function scrollIntoView(
  element?: HTMLElement | null,
  config?: ScrollIntoViewOptions
): void {
  element?.scrollIntoView({
    behavior: 'auto',
    block: 'nearest',
    inline: 'nearest',
    ...config,
  });
}

const TABBABLE_SELECTOR =
  'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

/**
 * Returns the focused element, also inside open shadow roots. The search starts in `root`, or in
 * the document when the focus is outside `root`.
 */
export function getDeepActiveElement(
  root: Document | ShadowRoot = document
): HTMLElement | null {
  let element = root.activeElement ?? document.activeElement;

  while (element?.shadowRoot?.activeElement) {
    element = element.shadowRoot.activeElement;
  }

  return element as HTMLElement | null;
}

/** Returns `root` itself, when tabbable, followed by its tabbable descendants. */
export function getTabbables(root: HTMLElement): HTMLElement[] {
  const descendants = root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
  return root.matches(TABBABLE_SELECTOR)
    ? [root, ...descendants]
    : [...descendants];
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

/** Sets an attribute, or removes it when `value` is `null` or `undefined`. */
export function setOrRemoveAttribute(
  element: Element,
  name: string,
  value?: string | null
): void {
  value == null
    ? element.removeAttribute(name)
    : element.setAttribute(name, value);
}

/** Whether the host has `tabindex="-1"`, which its native control follows. */
export function hasNegativeTabIndex(host: Element): boolean {
  return host.getAttribute('tabindex') === '-1';
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
 * Returns `element` or its closest ancestor in the top layer (a fullscreen
 * element, a modal dialog or an open popover). The walk follows the flat tree,
 * so it finds a top-layer element in the shadow root of a slotted element.
 */
export function getTopLayerAncestor(element: Element): HTMLElement | null {
  for (const ancestor of iterAncestors(element, true)) {
    if (ancestor.matches(':fullscreen, :modal, :popover-open')) {
      return ancestor as HTMLElement;
    }
  }

  return null;
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
