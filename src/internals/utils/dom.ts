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

/** A percentage, such as the `5%` of `calc(5% + 10px)`. */
const PERCENTAGE = /(-?\d*\.?\d+(?:e[+-]?\d+)?)%/gi;

let lengthPropertyUsable: boolean | undefined;

function canResolveLengths(): boolean {
  if (lengthPropertyUsable === undefined) {
    lengthPropertyUsable = !isServer;

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
 * Resolves a CSS length to pixels in the context of `element`. A percentage
 * resolves against `basis`, the size that the property of the value uses.
 *
 * @remarks
 * Registration makes the property compute to an absolute length, so the
 * browser converts font, viewport and container relative units. Returns 0
 * for percentages without a `basis`, for invalid lengths, during SSR and in
 * a browser without registered custom properties.
 */
export function resolveCssLength(
  element: HTMLElement,
  value: string,
  basis?: number
): number {
  if (!canResolveLengths()) {
    return 0;
  }

  const length =
    basis === undefined
      ? value
      : value.replace(
          PERCENTAGE,
          (_, percent) => `${(Number(percent) * basis) / 100}px`
        );

  if (PIXEL_LENGTH.test(length)) {
    return asNumber(length);
  }

  // Restore, not remove: the element can have its own inline value.
  const restore = replaceStyles(element, { [LENGTH_PROPERTY]: length });
  const resolved = getComputedStyle(element).getPropertyValue(LENGTH_PROPERTY);
  restore();

  return asNumber(resolved);
}

export type IterNodesOptions = {
  show?: keyof typeof NodeFilter;
};

/**
 * Iterates over the DOM subtree of `root` in document order, and yields the
 * nodes that match the {@link IterNodesOptions | options}.
 *
 * @example
 * ```typescript
 * for (const text of iterNodes<Text>(root, { show: 'SHOW_TEXT' })) { ... }
 * ```
 */
export function* iterNodes<T extends Node>(
  root: Node,
  options?: IterNodesOptions
): Generator<T> {
  if (!isDefined(globalThis.document)) {
    return;
  }

  const whatToShow = options?.show
    ? NodeFilter[options.show]
    : NodeFilter.SHOW_ALL;

  const treeWalker = document.createTreeWalker(root, whatToShow);

  while (treeWalker.nextNode()) {
    yield treeWalker.currentNode as T;
  }
}

/**
 * Iterates over `node` and its element ancestors across shadow roots. With
 * `flat`, a slotted node goes to its slot.
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

/** Returns `element` or its closest ancestor that matches `selector`, across shadow roots. */
export function closestComposed(
  element: Element,
  selector: string
): Element | null {
  for (const ancestor of iterAncestors(element)) {
    if (ancestor.matches(selector)) {
      return ancestor;
    }
  }

  return null;
}

/** Returns the document or shadow root of the node, or `null` while it is disconnected. */
export function getRoot(node: Node): Document | ShadowRoot | null {
  return node.isConnected
    ? (node.getRootNode() as Document | ShadowRoot)
    : null;
}

/** Returns the element with the given id in the root node of `root`. */
export function getElementByIdFromRoot(root: HTMLElement, id: string) {
  return getRoot(root)?.getElementById(id) ?? null;
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

/**
 * The edges of a box in viewport coordinates. Not a `Pick<>` with a key union:
 * its literal types change the member order of the unions in the manifest.
 */
export type Box = {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
};

/** Returns whether two boxes match to half a pixel. */
export function isSameBox(a: Box, b: Box): boolean {
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.right - b.right) < 0.5 &&
    Math.abs(a.bottom - b.bottom) < 0.5
  );
}

export function intersectBoxes(a: Box, b: Box): Box {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
}

export function isEmptyBox(box: Box): boolean {
  return box.right <= box.left || box.bottom <= box.top;
}

/**
 * Returns the padding box of the element without the scrollbars, in viewport
 * coordinates. The client metrics, unlike the rects, exclude the CSS zoom.
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

/**
 * Overflow and containment have no effect on an inline box or on no box. An
 * element outside the document has an empty style.
 */
function canContain({ display }: CSSStyleDeclaration): boolean {
  return !!display && display !== 'inline' && display !== 'contents';
}

/**
 * Returns the padding box that clips the content of the element, with
 * infinite edges on an axis that it does not clip, or `null`.
 */
export function getOverflowClip(
  element: Element,
  style = getComputedStyle(element)
): Box | null {
  if (!canContain(style)) {
    return null;
  }

  const contained =
    /\b(paint|content|strict)\b/.test(style.contain) ||
    style.contentVisibility !== 'visible';
  const clipX = contained || style.overflowX !== 'visible';
  const clipY = contained || style.overflowY !== 'visible';

  if (!(clipX || clipY)) {
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

  if (!radius || radius === '0px') {
    return null;
  }

  return CORNERS.some((corner) => Number.parseFloat(style[corner]) !== 0)
    ? radius
    : null;
}

/**
 * Returns the border radius of the element, or of a shadow element at any
 * depth that covers it, such as the base part of a component.
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

const skipsAll = (): boolean => true;

/**
 * Returns a test for the child nodes whose rendering the element skips, or
 * `null` when it skips none. An element skips all of them with
 * `content-visibility: hidden`, and a closed `<details>` all but its summary.
 */
export function getSkipTest(
  element: Element,
  style = getComputedStyle(element)
): ((child: Node) => boolean) | null {
  if (!canContain(style)) {
    return null;
  }

  if (style.contentVisibility === 'hidden') {
    return skipsAll;
  }

  if (
    !(element instanceof HTMLDetailsElement) ||
    getComputedStyle(element, '::details-content').contentVisibility !==
      'hidden'
  ) {
    return null;
  }

  const summary = element.querySelector(':scope > summary');
  return (child) => child !== summary;
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
  'a[href], button, input, textarea, select, details, summary, iframe, audio[controls], video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Returns the focused element, also inside open shadow roots. The search starts in `root`, or in
 * the document when the focus is outside `root`.
 */
export function getDeepActiveElement(
  root: Document | ShadowRoot | null = document
): HTMLElement | null {
  let element = root?.activeElement ?? document.activeElement;

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

/** Whether `element` and its subtree are out of the focus order. */
function isHiddenOrDisabled(element: Element): boolean {
  return (
    element.hasAttribute('hidden') ||
    element.hasAttribute('inert') ||
    element.hasAttribute('disabled') ||
    (element.getAttribute('aria-hidden') ?? 'false') !== 'false'
  );
}

/**
 * Whether Tab reaches `element` as a native radio button: the checked button
 * of its group, or the first button when none is checked. Other elements pass.
 */
function isRadioGroupStop(element: HTMLElement): boolean {
  if (
    !(element instanceof HTMLInputElement) ||
    element.type !== 'radio' ||
    !element.name ||
    element.checked
  ) {
    return true;
  }

  const root = element.getRootNode() as ParentNode;
  const group = Array.from(
    root.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(element.name)}"]`
    )
  ).filter((other) => other.form === element.form);

  return group[0] === element && !group.some((other) => other.checked);
}

function isFocusable(element: HTMLElement): boolean {
  const editable =
    (element.getAttribute('contenteditable') ?? 'false') !== 'false';

  return (
    (editable ||
      (element.matches(TABBABLE_SELECTOR) &&
        element.tabIndex > -1 &&
        !element.matches(':disabled') &&
        isRadioGroupStop(element))) &&
    element.checkVisibility({ visibilityProperty: true })
  );
}

/**
 * Yields `root` and its descendants that Tab reaches, in flat-tree order.
 * Unlike {@link getTabbables}, it enters open shadow roots and goes from a
 * slot to its assigned elements.
 */
export function* getFocusableElements(root: Element): Generator<HTMLElement> {
  if (isHiddenOrDisabled(root)) {
    return;
  }

  // A host that delegates the focus is not a stop of its own.
  if (
    root instanceof HTMLElement &&
    !root.shadowRoot?.delegatesFocus &&
    isFocusable(root)
  ) {
    yield root;
  }

  const children =
    root.shadowRoot?.children ??
    (root instanceof HTMLSlotElement
      ? root.assignedElements({ flatten: true })
      : root.children);

  for (const child of children) {
    yield* getFocusableElements(child);
  }
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

/**
 * Sets the inline `styles` (property names, such as `user-select`) on
 * `element`, and returns a function that restores the previous inline values
 * and priorities.
 */
export function replaceStyles(
  element: HTMLElement,
  styles: Record<string, string>
): () => void {
  const { style } = element;
  const previous = Object.keys(styles).map(
    (name) =>
      [
        name,
        style.getPropertyValue(name),
        style.getPropertyPriority(name),
      ] as const
  );

  for (const [name, value] of Object.entries(styles)) {
    style.setProperty(name, value);
  }

  return () => {
    for (const [name, value, priority] of previous) {
      style.setProperty(name, value, priority);
    }
  };
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
 * The effective `zoom` of `element`, which an ancestor `zoom` sets. The client
 * rectangles include it, but the styles and the offset and client sizes do not.
 * A hidden element, and a browser without `currentCSSZoom`, give 1.
 */
export function getCSSZoom(element?: Element | null): number {
  return element?.currentCSSZoom || 1;
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
