import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { createMutationController } from '#internals/controllers/mutation-observer.js';
import { createResizeObserverController } from '#internals/controllers/resize-observer.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { createTimer } from '#internals/timing.js';
import { isElement, iterNodes } from '#internals/utils/dom.js';
import { styles as shared } from './themes/shared/skeleton.common.css.js';
import { styles } from './themes/skeleton.base.css.js';

/** Keep in sync with the `reveal-content` animation in `skeleton.base.scss`. */
const REVEAL_DURATION_MS = 600;

type MeasuredNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** `null` falls back to the radius in the styles. */
  borderRadius: string | null;
};

function hasArea(rect: DOMRect): boolean {
  return rect.width > 0 && rect.height > 0;
}

function isSameLayout(a: MeasuredNode[], b: MeasuredNode[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (node, i) =>
        node.x === b[i].x &&
        node.y === b[i].y &&
        node.width === b[i].width &&
        node.height === b[i].height &&
        node.borderRadius === b[i].borderRadius
    )
  );
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
 * @cssproperty --border-radius - Border radius applied to the overlay and shapes when the element has no explicit border-radius.
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
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSkeletonComponent);
  }

  //#region Internal state

  private readonly _internals = addInternalsController(this);

  private readonly _resizeObserver = createResizeObserverController(this, {
    callback: this._scheduleMeasure,
    target: null,
    requestUpdate: false,
  });

  private readonly _mutationObserver = createMutationController(this, {
    callback: this._scheduleMeasure,
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

  @state()
  private _nodes: MeasuredNode[] = [];

  //#endregion

  //#region Public properties

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

  //#region Lifecycle

  constructor() {
    super();

    addSlotController(this, {
      slots: setSlots(),
      onChange: this._scheduleMeasure,
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();

    // The controller re-observes on each connection; stay idle until loading.
    if (!this.loading) {
      this._mutationObserver.disconnect();
    }
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelMeasure();
    this._endReveal();
  }

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('loading')) {
      this._internals.setARIA({ ariaBusy: this.loading.toString() });

      if (this.loading) {
        this._endReveal();
        this._setupObservers();
      } else {
        this._cleanupObservers();

        if (properties.get('loading') === true) {
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

  private _setupObservers(): void {
    this._mutationObserver.observe();
    this._resizeObserver.observe(this);
    this._scheduleMeasure();
  }

  private _cleanupObservers(): void {
    this._cancelMeasure();
    this._mutationObserver.disconnect();

    for (const target of this._resizeObserver.targets) {
      this._resizeObserver.unobserve(target);
    }

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

  /** Observes the size of the shape sources, besides the host itself. */
  private _syncResizeTargets(targets: Set<Element>): void {
    const observer = this._resizeObserver;

    for (const target of observer.targets) {
      if (target !== this && !targets.has(target)) {
        observer.unobserve(target);
      }
    }

    for (const target of targets) {
      if (!observer.targets.has(target)) {
        observer.observe(target);
      }
    }
  }

  /**
   * Draws a shape over each visible leaf element and over each line of text
   * next to sibling elements.
   */
  private _measure(): void {
    const nodes: MeasuredNode[] = [];
    const targets = new Set<Element>();
    const range = document.createRange();

    // Absolutely positioned shapes start at the padding box of the host.
    const host = this.getBoundingClientRect();
    const originX = host.left + this.clientLeft - this.scrollLeft;
    const originY = host.top + this.clientTop - this.scrollTop;

    const add = (rect: DOMRect, borderRadius: string | null): void => {
      nodes.push({
        x: rect.left - originX,
        y: rect.top - originY,
        width: rect.width,
        height: rect.height,
        borderRadius,
      });
    };

    for (const node of iterNodes(this)) {
      if (isElement(node)) {
        if (
          node.childElementCount > 0 ||
          !node.checkVisibility({ checkOpacity: false })
        ) {
          continue;
        }

        const rect = node.getBoundingClientRect();

        if (hasArea(rect)) {
          const { borderRadius } = getComputedStyle(node);
          add(rect, borderRadius === '0px' ? null : borderRadius);
          targets.add(node);
        }
      } else if (node instanceof Text && /\S/.test(node.data)) {
        const parent = node.parentElement!;

        // The shape of a leaf element already covers its text.
        if (parent !== this && parent.childElementCount === 0) {
          continue;
        }

        range.selectNodeContents(node);

        for (const rect of range.getClientRects()) {
          if (hasArea(rect)) {
            add(rect, null);
          }
        }

        if (parent !== this) {
          targets.add(parent);
        }
      }
    }

    this._syncResizeTargets(targets);

    if (!isSameLayout(this._nodes, nodes)) {
      this._nodes = nodes;
    }
  }

  //#endregion

  //#region Rendering

  private _renderShape(node: MeasuredNode, index: number) {
    const parts = { shape: true, [this.animation]: true };
    const shapeStyles = styleMap({
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      borderRadius: node.borderRadius,
      // Staggers the shapes by 0.1s. `index / 10` prints exact decimals.
      '--_wave-delay': this.animation === 'wave' ? `${index / 10}s` : null,
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

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-skeleton': IgcSkeletonComponent;
  }
}
