import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { createMutationController } from '#internals/controllers/mutation-observer.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import {
  type Box,
  getBorderRadius,
  getCSSZoom,
  getDeepBorderRadius,
  getOverflowClip,
  getSkipTest,
  intersectBoxes,
  isElement,
  isEmptyBox,
  isSameBox,
  iterAncestors,
} from '#internals/utils/dom.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { equal, getOrInsertComputed } from '#internals/utils/objects.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles as shared } from './themes/shared/skeleton.common.css.js';
import { styles } from './themes/skeleton.base.css.js';

type SkeletonAnimation = 'none' | 'breathe' | 'wave';

const ANIMATIONS = new Set<unknown>(['none', 'breathe', 'wave']);

const WAVE_CYCLE = 10;

/**
 * The room for the motion of the shapes on the start sides of their layer.
 * The layer clips the end sides, where motion would add scrollable overflow.
 */
const MOTION_ROOM = 32;

const SCROLL_OPTIONS: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

/** Controls and embedded content keep their box, whatever their children. */
const BOX_ELEMENTS = new Set([
  'audio',
  'button',
  'canvas',
  'iframe',
  'meter',
  'object',
  'progress',
  'select',
  'textarea',
  'video',
]);

type MeasuredNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** `null` falls back to the radius in the styles. */
  borderRadius: string | null;
};

type Layer = {
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: MeasuredNode[];
};

type Clip = Box & { borderRadius: string | null };

type Scale = { x: number; y: number };

const NO_CLIP: Clip = {
  left: -Infinity,
  top: -Infinity,
  right: Infinity,
  bottom: Infinity,
  borderRadius: null,
};

function narrow(
  clip: Clip,
  element: Element,
  style: CSSStyleDeclaration
): Clip {
  const box = getOverflowClip(element, style);

  return box
    ? { ...intersectBoxes(clip, box), borderRadius: getBorderRadius(style) }
    : clip;
}

function isVertical(style: CSSStyleDeclaration): boolean {
  return !style.writingMode.startsWith('horizontal');
}

/** Swaps the axes, so that vertical lines can be handled as horizontal ones. */
function transpose({ left, top, right, bottom }: Box): Box {
  return { left: top, top: left, right: bottom, bottom: right };
}

function continuesLine(a: Box, b: Box): boolean {
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.bottom - b.bottom) < 0.5 &&
    b.left - a.right < 1 &&
    a.left - b.right < 1
  );
}

/**
 * Joins the boxes that touch on a line. Templates often split a line of text
 * into several text nodes, and the browser returns a box for each.
 */
function joinLines(rects: Iterable<Box>, vertical: boolean): Box[] {
  const boxes: Box[] = [];

  for (const rect of rects) {
    if (isEmptyBox(rect)) continue;

    const box = vertical ? transpose(rect) : rect;
    const last = boxes.at(-1);

    if (last && continuesLine(last, box)) {
      // A `DOMRect` has no own properties to spread.
      boxes[boxes.length - 1] = {
        left: Math.min(last.left, box.left),
        top: last.top,
        right: Math.max(last.right, box.right),
        bottom: last.bottom,
      };
    } else {
      boxes.push(box);
    }
  }

  return vertical ? boxes.map(transpose) : boxes;
}

/**
 * Returns a box as thick as the font for each line of text. The half-leading
 * is equal on both sides of the text, so the box is in the middle of the line.
 */
function getTextLines(
  rects: Iterable<Box>,
  size: number,
  vertical: boolean
): Box[] {
  return joinLines(rects, vertical).map((line) => {
    const { left, top, right, bottom } = vertical ? transpose(line) : line;
    const middle = (top + bottom) / 2;
    const box = {
      left,
      top: middle - size / 2,
      right,
      bottom: middle + size / 2,
    };

    return vertical ? transpose(box) : box;
  });
}

/**
 * Returns the font size of the text in `parent`, in viewport pixels, before
 * the scale of the transforms around the host.
 */
function getFontSize(parent: Element, style: CSSStyleDeclaration): number {
  let box = parent;

  // `currentCSSZoom` is 1 without a box.
  if (style.display === 'contents') {
    for (const ancestor of iterAncestors(parent, true)) {
      box = ancestor;
      if (getComputedStyle(ancestor).display !== 'contents') break;
    }
  }

  return Number.parseFloat(style.fontSize) * getCSSZoom(box);
}

/** Returns whether the shapes of `element` come from its child nodes. */
function measuresChildren(element: Element): boolean {
  const { localName } = element;

  if (
    element instanceof SVGElement ||
    BOX_ELEMENTS.has(localName) ||
    (element.constructor as { formAssociated?: boolean }).formAssociated
  ) {
    return false;
  }

  return element.childElementCount > 0 || !localName.includes('-');
}

/** Returns the layer that holds `nodes`, with the room for their motion. */
function createLayer(nodes: MeasuredNode[], rtl: boolean): Layer {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const node of nodes) {
    left = Math.min(left, node.x);
    top = Math.min(top, node.y);
    right = Math.max(right, node.x + node.width);
    bottom = Math.max(bottom, node.y + node.height);
  }

  top -= MOTION_ROOM;

  if (rtl) {
    right += MOTION_ROOM;
  } else {
    left -= MOTION_ROOM;
  }

  return { x: left, y: top, width: right - left, height: bottom - top, nodes };
}

/**
 * Shows placeholder shapes over its content while the content loads, then
 * fades the content in.
 *
 * @element igc-skeleton
 *
 * @slot - The default slot for the skeleton content.
 *
 * @csspart content - The wrapper around the slotted content.
 * @csspart shape - A placeholder shape over a leaf element or over a line of text.
 *
 * @cssproperty --ig-skeleton-shape-color - The background color of the placeholder shapes.
 * @cssproperty --border-radius - The border radius of the text shapes, and of each shape whose source element has no border radius.
 *
 * @cssstate revealing - Set after loading ends, until the content has faded in. Ends at once when loading starts again or the skeleton is disconnected.
 *
 * @example
 * ```html
 * <!-- Basic usage: wrap any content and toggle the loading attribute -->
 * <igc-skeleton loading>
 *   <div style="display: flex; gap: 1rem; padding: 1rem;">
 *     <igc-avatar shape="circle"></igc-avatar>
 *     <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *       <span>John Smith</span>
 *       <span>Software Engineer</span>
 *     </div>
 *   </div>
 * </igc-skeleton>
 *
 * <!-- Choose an animation -->
 * <igc-skeleton loading animation="wave">
 *   <p>Loading content…</p>
 * </igc-skeleton>
 * ```
 */
export default class IgcSkeletonComponent extends LitElement {
  public static readonly tagName = 'igc-skeleton';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSkeletonComponent);
  }

  //#region Internal state and properties

  private readonly _requestMeasure = (): void => this._scheduleMeasure();

  private readonly _internals = addInternalsController(this, {
    aria: () => ({ ariaBusy: `${this.loading}` }),
  });

  private readonly _resizeObserver = addResizeObserverController(this, {
    callback: this._requestMeasure,
    target: null,
    requestUpdate: false,
  });

  private readonly _mutationObserver = createMutationController(this, {
    callback: this._requestMeasure,
    target: () => (this.loading ? [this] : []),
    config: {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    },
  });

  private readonly _content = createRef<HTMLElement>();

  private readonly _origin = createRef<HTMLElement>();

  private _scrollRoots = new Set<ShadowRoot>();

  private _measureFrame?: number;

  /** Counts the reveals, so that an old one does not end a new one. */
  private _reveals = 0;

  @state({ hasChanged: (a, b) => !equal(a, b) })
  private _layer: Layer | null = null;

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the skeleton is in a loading state.
   *
   * While loading, shapes cover the hidden, inert content, which fades in when
   * loading ends.
   *
   * @attr loading
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public loading = false;

  /**
   * The animation of the shapes while loading.
   *
   * - `none`: The shapes are static.
   * - `breathe`: The shapes fade in and grow a little, then return.
   * - `wave`: The shapes move up and back down, one after another.
   *
   * Another value, or no attribute, gives `breathe`. No animation runs when the
   * user prefers reduced motion.
   *
   * @attr animation
   * @default 'breathe'
   */
  @property()
  @coercedProperty<SkeletonAnimation, IgcSkeletonComponent>({
    transform: ({ value }) => (ANIMATIONS.has(value) ? value : 'breathe'),
  })
  public animation: 'none' | 'breathe' | 'wave' = 'breathe';

  //#endregion

  constructor() {
    super();

    // The host gets the scroll events of its content in the capture phase.
    addSafeEventListener(this, 'scroll', this._requestMeasure, SCROLL_OPTIONS);
  }

  //#region Lit lifecycle methods

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this._scheduleMeasure();
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelMeasure();
    this._stopListening();
    this._endReveal();
  }

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('loading')) {
      if (this.loading) {
        this._endReveal();
        this._mutationObserver.observe();
        this._scheduleMeasure();
      } else if (properties.get('loading')) {
        this._cleanupObservers();

        if (this.isConnected) {
          this._reveal();
        }
      }
    }

    super.update(properties);
  }

  //#endregion

  //#region Internal API

  /** Sets the `revealing` state until the animations of the content end. */
  private async _reveal(): Promise<void> {
    const reveal = ++this._reveals;
    this._internals.setState('revealing', true);

    const animations = this._content.value?.getAnimations() ?? [];
    await Promise.allSettled(animations.map(({ finished }) => finished));

    if (reveal === this._reveals) {
      this._endReveal();
    }
  }

  private _endReveal(): void {
    this._reveals++;
    this._internals.setState('revealing', false);
  }

  private _cleanupObservers(): void {
    this._cancelMeasure();
    this._mutationObserver.disconnect();
    this._syncResizeTargets(new Set());
    this._stopListening();
    this._layer = null;
  }

  private _scheduleMeasure(): void {
    if (
      !(this.loading && this.isConnected) ||
      this._measureFrame !== undefined
    ) {
      return;
    }

    this._measureFrame = requestAnimationFrame(() => {
      this._measureFrame = undefined;
      this._measure();
    });
  }

  private _cancelMeasure(): void {
    if (this._measureFrame !== undefined) {
      cancelAnimationFrame(this._measureFrame);
      this._measureFrame = undefined;
    }
  }

  private _syncResizeTargets(targets: Set<Element>): void {
    const observer = this._resizeObserver;

    for (const target of observer.targets) {
      if (!targets.has(target)) {
        observer.unobserve(target);
      }
    }

    // Observing again sends a new first notification.
    for (const target of targets) {
      if (!observer.targets.has(target)) {
        observer.observe(target);
      }
    }
  }

  /** A scroll event in a shadow root does not reach the host. */
  private _syncScrollRoots(roots: Set<ShadowRoot>): void {
    for (const root of this._scrollRoots) {
      if (!roots.has(root)) {
        root.removeEventListener(
          'scroll',
          this._requestMeasure,
          SCROLL_OPTIONS
        );
      }
    }

    for (const root of roots) {
      if (!this._scrollRoots.has(root)) {
        root.addEventListener('scroll', this._requestMeasure, SCROLL_OPTIONS);
      }
    }

    this._scrollRoots = roots;
  }

  private _stopListening(): void {
    this._syncScrollRoots(new Set());
    document.fonts.removeEventListener('loadingdone', this._requestMeasure);
  }

  private _measure(): void {
    const nodes: MeasuredNode[] = [];
    const targets = new Set<Element>([this]);
    const scrollRoots = new Set<ShadowRoot>();
    const slotClips = new Map<HTMLSlotElement, Clip | null>();
    const range = document.createRange();
    const hostStyle = getComputedStyle(this);

    // A 1px element at the start of the content gives the origin of the
    // shapes, and their scale with the zoom and the transforms.
    const origin = this._origin.value!.getBoundingClientRect();
    const scale: Scale = { x: origin.width, y: origin.height };
    const zoom = getCSSZoom(this);
    const transform: Scale = { x: scale.x / zoom, y: scale.y / zoom };

    /**
     * Adds the visible part of each box. Returns whether there is a box, also
     * a clipped or hidden one. Only the boxes of `element` take its radius.
     */
    const add = (
      boxes: Box[],
      clip: Clip,
      style: CSSStyleDeclaration,
      element?: Element
    ): boolean => {
      if (style.visibility !== 'visible') return boxes.length > 0;

      let own: string | null | undefined;

      for (const box of boxes) {
        const shape = intersectBoxes(box, clip);
        if (isEmptyBox(shape)) continue;

        // A cropped shape takes the radius of a rounded clip that it fills,
        // such as an image in a round frame.
        const clipRadius = isSameBox(shape, clip) ? clip.borderRadius : null;
        const cropped = clipRadius && !isSameBox(shape, box);

        if (element && !cropped && own === undefined) {
          own = getDeepBorderRadius(element, style);
        }

        nodes.push({
          x: (shape.left - origin.left) / scale.x,
          y: (shape.top - origin.top) / scale.y,
          width: (shape.right - shape.left) / scale.x,
          height: (shape.bottom - shape.top) / scale.y,
          borderRadius: (!cropped && own) || clipRadius,
        });
      }

      return boxes.length > 0;
    };

    /** Adds the lines of the text from `first` to `last`. */
    const addText = (
      first: Text,
      last: Text,
      parent: Element,
      style: CSSStyleDeclaration,
      clip: Clip
    ): boolean => {
      // Slotted text takes its styles from the slot.
      const slot = first.assignedSlot;
      const textStyle = slot ? getComputedStyle(slot) : style;
      const vertical = isVertical(textStyle);
      const size =
        getFontSize(slot ?? parent, textStyle) *
        (vertical ? transform.x : transform.y);

      range.setStart(first, 0);
      range.setEnd(last, last.length);

      const lines = getTextLines(range.getClientRects(), size, vertical);
      return add(lines, clip, textStyle);
    };

    /** Narrows `clip` by the shadow elements from `parent` down to `slot`. */
    const clipThrough = (
      slot: HTMLSlotElement,
      parent: Element,
      clip: Clip
    ): Clip | null =>
      getOrInsertComputed(slotClips, slot, () => {
        const chain: [Element, CSSStyleDeclaration][] = [];
        let skipped = false;
        let below: Element = slot;

        for (const element of iterAncestors(slot, true)) {
          if (element === parent) break;
          const style = getComputedStyle(element);
          skipped ||= getSkipTest(element, style)?.(below) ?? false;
          chain.push([element, style]);
          below = element;
        }

        let result = clip;

        for (const [element, style] of chain.reverse()) {
          const next = narrow(result, element, style);

          if (next !== result) {
            const root = element.getRootNode();
            if (root instanceof ShadowRoot) scrollRoots.add(root);
            targets.add(element);
            result = next;
          }
        }

        return skipped ? null : result;
      });

    /**
     * Returns whether a child node of `parent` has a box. The text between
     * two child elements is one run, without whitespace-only nodes at its ends.
     */
    const visitChildren = (
      parent: Element,
      style: CSSStyleDeclaration,
      clip: Clip
    ): boolean => {
      // A range measures skipped text too.
      const skips = getSkipTest(parent, style);
      let rendered = false;
      let first: Text | undefined;
      let last: Text | undefined;

      const clipFor = (child: Element | Text): Clip | null => {
        if (skips?.(child)) return null;
        const slot = child.assignedSlot;
        return slot ? clipThrough(slot, parent, clip) : clip;
      };

      const addRun = (): void => {
        const runClip = first && clipFor(first);

        if (first && last && runClip) {
          rendered = addText(first, last, parent, style, runClip) || rendered;
        }

        first = last = undefined;
      };

      for (const child of parent.childNodes) {
        if (isElement(child)) {
          addRun();
          rendered = visit(child, clipFor(child)) || rendered;
        } else if (child instanceof Text && /\S/.test(child.data)) {
          first ??= child;
          last = child;
        }
      }

      addRun();
      return rendered;
    };

    /** Adds the shapes of `element`. Returns whether it has a box. */
    const visit = (element: Element, clip: Clip | null): boolean => {
      if (!clip) return false;

      const style = getComputedStyle(element);

      // `checkVisibility()` is false for `display: contents`, but not for its content.
      if (style.display === 'contents') {
        return visitChildren(element, style, clip);
      }

      if (!element.checkVisibility()) {
        return false;
      }

      targets.add(element);

      if (
        measuresChildren(element) &&
        visitChildren(element, style, narrow(clip, element, style))
      ) {
        return true;
      }

      const boxes = joinLines(element.getClientRects(), isVertical(style));
      return add(boxes, clip, style, element);
    };

    visitChildren(this, hostStyle, NO_CLIP);
    this._syncResizeTargets(targets);
    this._syncScrollRoots(scrollRoots);
    // No observer reports the new text metrics of a web font.
    document.fonts.addEventListener('loadingdone', this._requestMeasure);
    this._layer = nodes.length
      ? createLayer(nodes, hostStyle.direction === 'rtl')
      : null;
  }

  //#endregion

  private _renderShape(
    node: MeasuredNode,
    index: number,
    layer: Layer,
    part: string
  ): TemplateResult {
    const shapeStyles = styleMap({
      left: `${node.x - layer.x}px`,
      top: `${node.y - layer.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      borderRadius: node.borderRadius,
      // `/ WAVE_CYCLE` prints exact decimals; `* 0.1` does not.
      '--_wave-delay':
        this.animation === 'wave'
          ? `${(index % WAVE_CYCLE) / WAVE_CYCLE}s`
          : null,
    });

    return html`<div part=${part} style=${shapeStyles}></div>`;
  }

  private _renderLayer(layer: Layer): TemplateResult {
    const part =
      this.animation === 'none' ? 'shape' : `shape ${this.animation}`;
    const layerStyles = styleMap({
      left: `${layer.x}px`,
      top: `${layer.y}px`,
      width: `${layer.width}px`,
      height: `${layer.height}px`,
    });

    return html`
      <div aria-hidden="true" data-shapes style=${layerStyles}>
        ${layer.nodes.map((node, i) => this._renderShape(node, i, layer, part))}
      </div>
    `;
  }

  protected override render(): TemplateResult {
    return html`
      <div ${ref(this._content)} part="content" ?inert=${this.loading}>
        <slot></slot>
      </div>
      <div ${ref(this._origin)} data-origin></div>
      ${this._layer ? this._renderLayer(this._layer) : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-skeleton': IgcSkeletonComponent;
  }
}
