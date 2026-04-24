import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { createMutationController } from '../common/controllers/mutation-observer.js';
import { createResizeObserverController } from '../common/controllers/resize-observer.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { iterNodes } from '../common/util.js';
import { styles } from './themes/skeleton.base.css.js';

type MeasuredNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: string;
};

function isLeafNode(node: HTMLElement): boolean {
  return (
    node.children.length === 0 && node.checkVisibility({ checkOpacity: false })
  );
}

function createSkeletonRect(
  node: HTMLElement,
  parentRect: DOMRect
): MeasuredNode {
  const { borderRadius } = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return {
    x: rect.left - parentRect.left,
    y: rect.top - parentRect.top,
    borderRadius:
      borderRadius === '0px'
        ? 'var(--border-radius, var(--_fallback-radius, 0))'
        : borderRadius,
    width: rect.width,
    height: rect.height,
  };
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
 * @csspart shape - An individual placeholder shape rendered over a leaf element.
 *
 * @cssproperty --ig-skeleton-overlay-color - Background color of the overlay layer.
 * @cssproperty --ig-skeleton-shape-color - Background color of the placeholder shapes.
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
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSkeletonComponent);
  }

  //#region Internal state

  private readonly _internals = addInternalsController(this);
  private readonly _resizeObserver = createResizeObserverController(this, {
    callback: this._scheduleMeasure,
  });
  private readonly _mutationObserver = createMutationController(this, {
    callback: this._scheduleMeasure,
    config: { childList: true, subtree: true },
  });

  private _hasScheduledMeasure = false;
  private _revealTimeoutId?: ReturnType<typeof setTimeout>;

  @state()
  private _nodes: MeasuredNode[] = [];

  //#endregion

  //#region Public properties

  /**
   * Indicates whether the skeleton is in a loading state.
   *
   * When `true`, the skeleton will display its content with a loading animation.
   * When `false`, the skeleton will display its content without the animation.
   *
   * @attr loading
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public loading = false;

  /**
   * Defines the animation style for the skeleton when in a loading state.
   *
   * - `pulse`: A pulsing animation that fades the skeleton in and out.
   * - `breathe`: A subtle breathing animation that smoothly transitions the skeleton's opacity.
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

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('loading')) {
      this._internals.setARIA({ ariaBusy: this.loading.toString() });

      if (this.loading) {
        this._setupObservers();
      } else {
        this._cleanupObservers();

        if (properties.get('loading') === true) {
          clearTimeout(this._revealTimeoutId);
          this._internals.setState('revealing', true);
          this._revealTimeoutId = setTimeout(
            () => this._internals.setState('revealing', false),
            600
          );
        }
      }
    }

    super.update(properties);
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._revealTimeoutId);
  }

  //#endregion

  //#region Private methods

  private _setupObservers(): void {
    clearTimeout(this._revealTimeoutId);
    this._mutationObserver.observe();
    this._resizeObserver.observe(this);
    this._scheduleMeasure();
  }

  private _cleanupObservers(): void {
    this._hasScheduledMeasure = false;
    this._mutationObserver.disconnect();
    this._resizeObserver.unobserve(this);
    this._nodes = [];
  }

  private _scheduleMeasure(): void {
    if (this._hasScheduledMeasure) return;

    this._hasScheduledMeasure = true;

    requestAnimationFrame(() => {
      this._hasScheduledMeasure = false;
      this._nodes = this._measure();
    });
  }

  private _measure(): MeasuredNode[] {
    if (!this.loading) return [];

    const parentRect = this.getBoundingClientRect();

    return iterNodes(this, {
      show: 'SHOW_ELEMENT',
      filter: isLeafNode,
    })
      .map((node) => createSkeletonRect(node, parentRect))
      .toArray();
  }

  //#endregion

  private _renderPlaceholder(node: MeasuredNode, index: number) {
    const parts = { shape: true, [this.animation]: true };
    const shapeStyles = styleMap({
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      borderRadius: node.borderRadius,
      '--_wave-delay': this.animation === 'wave' ? `${index * 0.1}s` : null,
    });

    return html`
      <div aria-hidden="true" part=${partMap(parts)} style=${shapeStyles}></div>
    `;
  }

  private _renderLoadingState() {
    return this.loading
      ? html`${this._nodes.map((node, i) => this._renderPlaceholder(node, i))}`
      : nothing;
  }

  protected override render() {
    return html`
      <div part="content"><slot></slot></div>
      <div
        aria-hidden="true"
        part="overlay"
        style=${styleMap({ opacity: this.loading ? 0.5 : 0 })}
      ></div>
      ${this._renderLoadingState()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-skeleton': IgcSkeletonComponent;
  }
}
