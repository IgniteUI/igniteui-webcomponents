import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addHostListeners } from '#internals/controllers/host-listeners.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { createMutationController } from '#internals/controllers/mutation-observer.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { createTimer } from '#internals/timing.js';
import {
  type Box,
  getBorderRadius,
  getCSSZoom,
  getDeepBorderRadius,
  getOverflowClip,
  getPaddingBox,
  intersectBoxes,
  isElement,
  isEmptyBox,
  isSameBox,
  iterAncestors,
  skipsRendering,
} from '#internals/utils/dom.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { equal } from '#internals/utils/objects.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles as shared } from './themes/shared/skeleton.common.css.js';
import { styles } from './themes/skeleton.base.css.js';

/** Keep in sync with the `reveal-content` animation in `skeleton.base.scss`. */
const REVEAL_DURATION_MS = 600;

/** The `wave` delay restarts after this many shapes. */
const WAVE_CYCLE = 10;

const SCROLL_OPTIONS: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

type MeasuredNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** `null` falls back to the radius in the styles. */
  borderRadius: string | null;
};

/** A viewport area in which content is visible. */
type Clip = Box & {
  /** The radius of the innermost element that clips. */
  borderRadius: string | null;
};

const NO_CLIP: Clip = {
  left: -Infinity,
  top: -Infinity,
  right: Infinity,
  bottom: Infinity,
  borderRadius: null,
};

/** Narrows `clip` to the overflow clip of `element`, and takes its radius. */
function narrow(
  clip: Clip,
  element: Element,
  style: CSSStyleDeclaration
): Clip {
  const box = getOverflowClip(element, style);

  return box
    ? {
        ...intersectBoxes(clip, box),
        borderRadius: getBorderRadius(style),
      }
    : clip;
}

/**
 * A skeleton component that overlays placeholder shapes on top of projected
 * content while it is in a loading state, then smoothly reveals the content
 * once loading is complete.
 *
 * @element igc-skeleton
 *
 * @slot - The default slot for the skeleton content.
 *
 * @csspart content - The wrapper around the slotted content.
 * @csspart overlay - The translucent layer rendered over the content during loading.
 * @csspart shape - An individual placeholder shape rendered over a leaf element or a run of text.
 *
 * @cssproperty --ig-skeleton-overlay-color - Background color of the overlay layer.
 * @cssproperty --ig-skeleton-shape-color - Background color of the placeholder shapes.
 * @cssproperty --ig-skeleton-highlight-color - Color of the highlight that the `shimmer` animation sweeps across each shape.
 * @cssproperty --border-radius - Border radius of the overlay, and of each shape whose source has no border radius.
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
 * <!-- Choose an animation style -->
 * <igc-skeleton loading animation="shimmer">
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

  private readonly _internals = addInternalsController(this, {
    aria: () => ({ ariaBusy: `${this.loading}` }),
  });

  private readonly _resizeObserver = addResizeObserverController(this, {
    callback: this._scheduleMeasure,
    target: null,
    requestUpdate: false,
  });

  private readonly _mutationObserver = createMutationController(this, {
    callback: this._scheduleMeasure,
    target: () => (this.loading ? [this] : []),
    config: {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    },
  });

  private readonly _revealTimer = createTimer(
    () => this._endReveal(),
    REVEAL_DURATION_MS
  );

  private _measureFrame?: number;

  private _scrollListeners?: AbortController;

  private readonly _measureOnEvent = (): void => this._scheduleMeasure();

  @state({ hasChanged: (a, b) => !equal(a, b) })
  private _nodes: MeasuredNode[] = [];

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
   * Defines the animation style for the skeleton when in a loading state.
   *
   * - `pulse`: A pulsing animation that fades the shapes in and out.
   * - `breathe`: A subtle breathing animation that fades and slightly scales the shapes.
   * - `shimmer`: A horizontal highlight sweep across each shape.
   * - `wave`: A staggered vertical bounce across shapes.
   * - `glow`: A pulsing box-shadow glow on each shape.
   *
   * @attr animation
   * @default 'breathe'
   */
  @property()
  public animation: 'pulse' | 'breathe' | 'shimmer' | 'wave' | 'glow' =
    'breathe';

  //#endregion

  constructor() {
    super();

    // A scroll event does not bubble, but the host gets it in the capture phase.
    addSafeEventListener(this, 'scroll', this._scheduleMeasure, SCROLL_OPTIONS);

    // A web font changes the text metrics, but no observer reports it.
    addHostListeners(this, {
      target: () => document.fonts,
      events: ['loadingdone'],
      listener: this._measureOnEvent,
    });
  }

  //#region Lit lifecycle methods

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    // The disconnect cancels a pending measurement.
    this._scheduleMeasure();
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelMeasure();
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
          this._internals.setState('revealing', true);
          this._revealTimer.start();
        }
      }
    }

    super.update(properties);
  }

  //#endregion

  //#region Internal API

  private _endReveal(): void {
    this._revealTimer.stop();
    this._internals.setState('revealing', false);
  }

  private _cleanupObservers(): void {
    this._cancelMeasure();
    this._mutationObserver.disconnect();
    this._syncResizeTargets(new Set());
    this._scrollListeners?.abort();
    this._nodes = [];
  }

  private _scheduleMeasure(): void {
    if (!this.loading || this._measureFrame !== undefined) return;

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

    // Re-observing sends a new first notification.
    for (const target of targets) {
      if (!observer.targets.has(target)) {
        observer.observe(target);
      }
    }
  }

  /** A scroll event in a shadow root does not reach the host. */
  private _listenToScrollRoots(roots: Set<ShadowRoot>): void {
    this._scrollListeners?.abort();
    this._scrollListeners = new AbortController();
    const options = { ...SCROLL_OPTIONS, signal: this._scrollListeners.signal };

    for (const root of roots) {
      root.addEventListener('scroll', this._measureOnEvent, options);
    }
  }

  /**
   * Draws a shape over each line box of each visible leaf element and text
   * run. An inline SVG and an element whose children have no area are leaves.
   */
  private _measure(): void {
    const nodes: MeasuredNode[] = [];
    const targets = new Set<Element>([this]);
    const scrollRoots = new Set<ShadowRoot>();
    const slotClips = new Map<HTMLSlotElement, Clip | null>();
    const range = document.createRange();

    // Shapes start at the padding box of the host and scroll with it.
    const zoom = getCSSZoom(this);
    const host = getPaddingBox(this);
    const originX = host.left - this.scrollLeft * zoom;
    const originY = host.top - this.scrollTop * zoom;

    /**
     * Adds the visible part of each rect, which has the given `style`. Returns
     * whether a rect has an area, even a clipped or hidden one.
     */
    const add = (
      rects: Iterable<DOMRect>,
      clip: Clip,
      style: CSSStyleDeclaration,
      element?: Element
    ): boolean => {
      const draw = style.visibility === 'visible';
      let rendered = false;

      for (const rect of rects) {
        if (isEmptyBox(rect)) continue;
        rendered = true;

        const shape = intersectBoxes(rect, clip);
        if (!draw || isEmptyBox(shape)) continue;

        // A cropped shape takes the radius of a rounded clip that it fills,
        // such as an image in a round frame.
        const clipRadius = isSameBox(shape, clip) ? clip.borderRadius : null;
        const cropped = !isSameBox(shape, rect);
        const own =
          (cropped && clipRadius) || !element
            ? null
            : getDeepBorderRadius(element, style);

        nodes.push({
          x: (shape.left - originX) / zoom,
          y: (shape.top - originY) / zoom,
          width: (shape.right - shape.left) / zoom,
          height: (shape.bottom - shape.top) / zoom,
          borderRadius: own ?? clipRadius,
        });
      }

      return rendered;
    };

    /**
     * Narrows `clip` by the shadow elements from `parent` down to `slot`.
     * Returns `null` when one of them skips the slot.
     */
    const clipThrough = (
      slot: HTMLSlotElement,
      parent: Element,
      clip: Clip
    ): Clip | null => {
      const cached = slotClips.get(slot);
      if (cached !== undefined) return cached;

      const chain: [Element, CSSStyleDeclaration][] = [];
      let skipped = false;
      let below: Element = slot;

      for (const element of iterAncestors(slot, true)) {
        if (element === parent) break;
        const style = getComputedStyle(element);
        skipped ||= skipsRendering(element, below, style);
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

      const value = skipped ? null : result;
      slotClips.set(slot, value);
      return value;
    };

    /** Returns the clip of `child`, or `null` when `parent` skips it. */
    const clipFor = (
      child: Element | Text,
      parent: Element,
      style: CSSStyleDeclaration,
      clip: Clip
    ): Clip | null => {
      if (skipsRendering(parent, child, style)) return null;
      const slot = child.assignedSlot;
      return slot ? clipThrough(slot, parent, clip) : clip;
    };

    /** Returns whether a child node of `parent` has a box. */
    const visitChildren = (
      parent: Element,
      style: CSSStyleDeclaration,
      clip: Clip
    ): boolean => {
      let rendered = false;

      for (const child of parent.childNodes) {
        if (isElement(child)) {
          rendered =
            visit(child, clipFor(child, parent, style, clip)) || rendered;
        } else if (child instanceof Text && /\S/.test(child.data)) {
          // A range measures skipped text too.
          const childClip = clipFor(child, parent, style, clip);
          if (!childClip) continue;

          range.selectNodeContents(child);
          rendered = add(range.getClientRects(), childClip, style) || rendered;
        }
      }

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
        element.childElementCount > 0 &&
        !(element instanceof SVGElement) &&
        visitChildren(element, style, narrow(clip, element, style))
      ) {
        return true;
      }

      return add(element.getClientRects(), clip, style, element);
    };

    visitChildren(this, getComputedStyle(this), NO_CLIP);
    this._syncResizeTargets(targets);
    this._listenToScrollRoots(scrollRoots);
    this._nodes = nodes;
  }

  //#endregion

  private _renderShape(node: MeasuredNode, index: number) {
    const parts = { shape: true, [this.animation]: true };
    const shapeStyles = styleMap({
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      borderRadius: node.borderRadius,
      // `/ WAVE_CYCLE` prints exact decimals; `* 0.1` does not.
      '--_wave-delay':
        this.animation === 'wave'
          ? `${(index % WAVE_CYCLE) / WAVE_CYCLE}s`
          : null,
    });

    return html`
      <div aria-hidden="true" part=${partMap(parts)} style=${shapeStyles}></div>
    `;
  }

  protected override render() {
    return html`
      <div part="content" ?inert=${this.loading}><slot></slot></div>
      <div aria-hidden="true" part="overlay"></div>
      ${this._nodes.map((node, i) => this._renderShape(node, i))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-skeleton': IgcSkeletonComponent;
  }
}
