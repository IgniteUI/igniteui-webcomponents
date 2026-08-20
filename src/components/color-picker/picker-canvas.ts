import { html, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '#internals/controllers/key-bindings.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { AbstractConstructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { asPercent, clamp } from '#internals/utils/math.js';
import { styles } from './themes/picker-canvas.base.css.js';

export interface IgcPickerCanvasEventMap {
  /**
   * Emitted when the color is picked in the canvas. Does not bubble.
   */
  igcColorPicked: CustomEvent<PickerCanvasEventDetail>;
}

export type PickerCanvasEventDetail = { x: number; y: number };

/** The measurements a marker position is resolved against. */
type CanvasGeometry = {
  rect: DOMRect;
  marker: { width: number; height: number };
};

/* blazorSuppress */
/**
 * The saturation/value plane of {@link IgcColorPickerComponent} and the marker
 * that moves across it.
 *
 * An internal building block of `igc-color-picker` - it is registered so the
 * picker can render it, but it is not part of the public component surface and
 * is not exported from the package entry point.
 *
 * @element igc-picker-canvas
 *
 * @fires igcColorPicked - Emitted when a color is picked on the canvas. Does not bubble.
 *
 * @csspart marker - The draggable marker indicating the picked saturation/value.
 */
export default class IgcPickerCanvasComponent extends EventEmitterMixin<
  IgcPickerCanvasEventMap,
  AbstractConstructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-picker-canvas';
  public static styles = styles;

  public static register(): void {
    registerComponent(IgcPickerCanvasComponent);
  }

  @query('[part="marker"]', true)
  private readonly _marker?: HTMLDivElement;

  /** Geometry captured for the duration of a pointer drag. */
  private _dragGeometry?: CanvasGeometry;

  @property()
  public currentColor = '';

  /**
   * The color the marker is filled with.
   *
   * Distinct from `currentColor`: that one is the pure hue the saturation/value
   * plane is built from, while this is the color actually picked out of it.
   */
  @property()
  public markerColor = '';

  @property({ attribute: false })
  public x = 0;

  @property({ attribute: false })
  public y = 0;

  /**
   * The HSV saturation the marker currently sits at (0-100).
   *
   * The canvas positions the marker in pixels and has no notion of the color
   * space behind it, so the owning picker feeds the saturation/value pair back
   * in purely to give the marker an announceable value.
   */
  @property({ type: Number, attribute: false })
  public saturation = 0;

  /**
   * The HSV value the marker currently sits at (0-100).
   *
   * Named for the B of HSB rather than the V of HSV - on a custom element a
   * bare `value` reads as a form value, which this is not.
   */
  @property({ type: Number, attribute: false })
  public brightness = 0;

  /** The accessible name of the marker. */
  @property()
  public markerLabel = 'Saturation and value';

  constructor() {
    super();

    addSafeEventListener(this, 'pointerdown', this._handlePointerDown);
    addSafeEventListener(
      this,
      'lostpointercapture',
      this._handleLostPointerCapture
    );

    addKeybindings(this, { bindingDefaults: { repeat: true } })
      .set(arrowDown, this._onArrowKey.bind(this, { dx: 0, dy: 1 }))
      .set(arrowUp, this._onArrowKey.bind(this, { dx: 0, dy: -1 }))
      .set(arrowLeft, this._onArrowKey.bind(this, { dx: -1, dy: 0 }))
      .set(arrowRight, this._onArrowKey.bind(this, { dx: 1, dy: 0 }));
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('currentColor')) {
      this.style.color = this.currentColor;
    }

    // Handed to the marker through a custom property rather than an inline
    // style on the marker itself, so that a consumer styling `::part(marker)`
    // can still win - an inline style could not be overridden.
    if (properties.has('markerColor')) {
      this.style.setProperty('--_marker-fill', this.markerColor);
    }
  }

  /**
   * The canvas box and half-marker offsets every interaction measures against.
   *
   * Both reads force a layout, so a drag takes this once on pointerdown rather
   * than on each of the frames it spans.
   */
  private _measure(): CanvasGeometry {
    return {
      rect: this.getBoundingClientRect(),
      marker: this.getMarkerDimensions(),
    };
  }

  /**
   * Clamps the marker inside the canvas and reports the position it settled on
   * as saturation/value percentages.
   */
  private _commitPosition(
    x: number,
    y: number,
    { rect, marker }: CanvasGeometry
  ): void {
    const nextX = clamp(x, -marker.width, rect.width - marker.width);
    const nextY = clamp(y, -marker.height, rect.height - marker.height);

    if (nextX === this.x && nextY === this.y) {
      return;
    }

    this.x = nextX;
    this.y = nextY;

    this.emitEvent('igcColorPicked', {
      detail: {
        x: Math.round(asPercent(nextX + marker.width, rect.width)),
        y: Math.round(asPercent(nextY + marker.height, rect.height)),
      },
      bubbles: false,
    });
  }

  private _onArrowKey({ dx, dy }: { dx: number; dy: number }): void {
    this._commitPosition(this.x + dx, this.y + dy, this._measure());
  }

  private _move(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const geometry = this._dragGeometry ?? this._measure();
    const { rect, marker } = geometry;

    this._commitPosition(
      event.clientX - rect.x - marker.width,
      event.clientY - rect.y - marker.height,
      geometry
    );
  }

  private _handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.setPointerCapture(event.pointerId);
    this.addEventListener('pointermove', this._handlePointerMove);
    this._dragGeometry = this._measure();
    this._move(event);
  }

  private _handleLostPointerCapture(): void {
    this.removeEventListener('pointermove', this._handlePointerMove);
    this._dragGeometry = undefined;
    this._marker?.focus();
  }

  private _handlePointerMove(event: PointerEvent): void {
    this._move(event);
  }

  public getMarkerDimensions(): { width: number; height: number } {
    const rect = this._marker?.getBoundingClientRect();
    return rect
      ? { width: rect.width / 2, height: rect.height / 2 }
      : { width: 0, height: 0 };
  }

  protected override render() {
    const styles = styleMap({
      top: `${this.y}px`,
      left: `${this.x}px`,
    });

    const saturation = Math.round(this.saturation);
    const brightness = Math.round(this.brightness);

    // ARIA has no two-dimensional slider, so the marker is exposed as a single
    // slider tracking saturation, with `aria-valuetext` carrying both axes -
    // otherwise vertical movement would be announced as "no change".
    return html`
      <div
        part="marker"
        style=${styles}
        tabindex="0"
        role="slider"
        aria-label=${this.markerLabel}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${saturation}
        aria-valuetext="Saturation ${saturation}%, brightness ${brightness}%"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-picker-canvas': IgcPickerCanvasComponent;
  }
}
