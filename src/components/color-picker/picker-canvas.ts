import { ColorPickerResourceStringsEN } from 'igniteui-i18n-core';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  pageDownKey,
  pageUpKey,
  shiftKey,
} from '#internals/controllers/key-bindings.js';
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { partMap } from '#internals/part-map.js';
import {
  addSafeEventListener,
  preventDefault,
} from '#internals/utils/events.js';
import { asPercent, clamp } from '#internals/utils/math.js';
import { formatString } from '#internals/utils/strings.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { type AreaSpace, paintOklchArea } from './oklch.js';
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

/**
 * The keys that move the marker, and their steps in percent of each axis.
 * An arrow moves the marker in its own direction, also in RTL, because the
 * plane does not mirror.
 */
const KEY_STEPS: ReadonlyArray<
  readonly [keys: string | string[], dx: number, dy: number]
> = [
  [arrowLeft, -1, 0],
  [arrowRight, 1, 0],
  [arrowUp, 0, -1],
  [arrowDown, 0, 1],
  [[shiftKey, arrowLeft], -10, 0],
  [[shiftKey, arrowRight], 10, 0],
  [[shiftKey, arrowUp], 0, -10],
  [[shiftKey, arrowDown], 0, 10],
  [pageUpKey, 0, -10],
  [pageDownKey, 0, 10],
  [homeKey, -10, 0],
  [endKey, 10, 0],
];

/**
 * Moves a marker offset by `delta` percent of `size`, to a whole percent
 * within the canvas. `half` is the half-marker offset of the axis.
 */
function stepOffset(
  offset: number,
  half: number,
  size: number,
  delta: number
): number {
  const percent = clamp(
    Math.round(asPercent(offset + half, size) + delta),
    0,
    100
  );

  return (percent / 100) * size - half;
}

/* blazorSuppress */
/**
 * The area of the color panel and the marker that moves across it: the HSV
 * saturation by value, or the OKLCH lightness by chroma at a hue.
 *
 * An internal building block of the color panel - it is registered so the
 * panel can render it, but it is not part of the public component surface and
 * is not exported from the package entry point.
 *
 * @element igc-picker-canvas
 *
 * @fires igcColorPicked - Emitted when a color is picked on the canvas. Does not bubble.
 * @fires change - Emitted when a change ends, as for a range input: at the end of a drag and after each key.
 *
 * @csspart marker - The draggable marker on the area that shows the picked color.
 * @csspart dragging - Present on the marker while it is being dragged.
 */
export default class IgcPickerCanvasComponent extends EventEmitterMixin<IgcPickerCanvasEventMap>(
  LitElement
) {
  public static readonly tagName = 'igc-picker-canvas';
  public static override styles = [componentBase, styles];

  public static register(): void {
    registerComponent(IgcPickerCanvasComponent);
  }

  @query('[part~="marker"]', true)
  private readonly _marker?: HTMLDivElement;

  @query('canvas')
  private readonly _areaCanvas?: HTMLCanvasElement;

  private _dragGeometry?: CanvasGeometry;

  private _paintFrame = 0;

  private _image?: ImageData;

  @state()
  private _dragging = false;

  /**
   * The color space of the area: HSV saturation by value, or OKLCH lightness
   * by chroma at `hue`.
   */
  @property({ reflect: true })
  public space: AreaSpace = 'hsv';

  /** The OKLCH hue that the OKLCH area shows. */
  @property({ type: Number, attribute: false })
  public hue = 0;

  @property()
  public currentColor = '';

  /**
   * The color the marker is filled with.
   *
   * Distinct from `currentColor`: that one is the pure hue the area is built
   * from, while this is the color actually picked out of it.
   */
  @property()
  public markerColor = '';

  @property({ attribute: false })
  public x = 0;

  @property({ attribute: false })
  public y = 0;

  /**
   * How far across the area the marker sits (0-100), the `aria-valuenow` of
   * the marker: the HSV saturation, or the OKLCH chroma as a share of the
   * chroma axis. The canvas positions the marker in pixels, so the color panel
   * gives it both axes.
   */
  @property({ type: Number, attribute: false })
  public saturation = 0;

  /**
   * How far up the area the marker sits (0-100): the HSV value, or the OKLCH
   * lightness.
   *
   * Named for the B of HSB rather than the V of HSV - on a custom element a
   * bare `value` reads as a form value, which this is not.
   */
  @property({ type: Number, attribute: false })
  public brightness = 0;

  /** The accessible name of the marker. */
  @property()
  public markerLabel: string =
    ColorPickerResourceStringsEN.color_picker_canvas_label!;

  /**
   * The `aria-valuetext` of the marker. Without it, the marker gives the
   * saturation and the brightness in English.
   */
  @property()
  public markerValueText?: string;

  constructor() {
    super();

    addSafeEventListener(this, 'pointerdown', this._handlePointerDown);
    addSafeEventListener(this, 'touchmove', preventDefault, { passive: false });
    addSafeEventListener(
      this,
      'lostpointercapture',
      this._handleLostPointerCapture
    );

    const bindings = addKeybindings(this, {
      bindingDefaults: { repeat: true },
    });

    for (const [keys, dx, dy] of KEY_STEPS) {
      bindings.set(keys, () => this._step(dx, dy));
    }

    addResizeObserverController(this, {
      callback: () => this._schedulePaint(),
      requestUpdate: false,
    });
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._paintFrame);
    this._paintFrame = 0;
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('space') || properties.has('hue')) {
      this._schedulePaint();
    }

    if (properties.has('currentColor')) {
      this.style.color = this.currentColor;
    }

    // A custom property, not an inline style, so `::part(marker)` can override it.
    if (properties.has('markerColor')) {
      this.style.setProperty('--_marker-fill', this.markerColor);
    }
  }

  /**
   * Measures the canvas box and the half-marker offsets.
   * Both reads force a layout, so a drag measures once on pointerdown.
   */
  private _measure(): CanvasGeometry {
    return {
      rect: this.getBoundingClientRect(),
      marker: this.getMarkerDimensions(),
    };
  }

  /** Clamps the marker inside the canvas and emits its position as percentages. */
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

    // After the move: the color panel can move the marker again, to stop it
    // at the gamut edge. Its writes join this update.
    this.emitEvent('igcColorPicked', {
      detail: {
        x: Math.round(asPercent(nextX + marker.width, rect.width)),
        y: Math.round(asPercent(nextY + marker.height, rect.height)),
      },
      bubbles: false,
    });
  }

  /** Paints the OKLCH area at most once per frame. */
  private _schedulePaint(): void {
    if (this.space !== 'oklch' || this._paintFrame) {
      return;
    }

    this._paintFrame = requestAnimationFrame(() => {
      this._paintFrame = 0;
      this._paint();
    });
  }

  /** Paints the OKLCH area in CSS pixels; the browser scales it up. */
  private _paint(): void {
    const canvas = this._areaCanvas;
    const context = canvas?.getContext('2d');
    const { clientWidth: width, clientHeight: height } = this;

    if (!(canvas && context && width && height)) {
      return;
    }

    // A write to the canvas size clears it, even with the same size.
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    if (this._image?.width !== width || this._image.height !== height) {
      this._image = context.createImageData(width, height);
    }

    paintOklchArea(this._image, this.hue);
    context.putImageData(this._image, 0, 0);
  }

  /**
   * Moves the marker by percentages of the canvas, so a step is the same at
   * every canvas size. Only the axis that moves snaps to a whole percent.
   */
  private _step(dx: number, dy: number): void {
    const geometry = this._measure();
    const { rect, marker } = geometry;

    // A hidden canvas has no size to step against.
    if (!(rect.width && rect.height)) {
      return;
    }

    this._commitPosition(
      dx ? stepOffset(this.x, marker.width, rect.width, dx) : this.x,
      dy ? stepOffset(this.y, marker.height, rect.height, dy) : this.y,
      geometry
    );
    this._emitChange();
  }

  private _emitChange(): void {
    this.dispatchEvent(new Event('change', { bubbles: true }));
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
    this.addEventListener('pointermove', this._move);
    this._dragGeometry = this._measure();
    this._dragging = true;
    this._move(event);
  }

  private _handleLostPointerCapture(): void {
    this.removeEventListener('pointermove', this._move);
    this._dragGeometry = undefined;
    this._dragging = false;
    this._marker?.focus();
    this._emitChange();
  }

  public getMarkerDimensions(): { width: number; height: number } {
    const marker = this._marker;

    // Use offsets. The marker scales up during a drag, and a client rect
    // reports the scaled box.
    return marker
      ? { width: marker.offsetWidth / 2, height: marker.offsetHeight / 2 }
      : { width: 0, height: 0 };
  }

  protected override render() {
    const styles = styleMap({
      top: `${this.y}px`,
      left: `${this.x}px`,
    });

    const saturation = Math.round(this.saturation);
    const brightness = Math.round(this.brightness);

    // ARIA has no 2D slider, so `aria-valuetext` carries both axes.
    // Otherwise a vertical move is announced as "no change".
    return html`
      ${this.space === 'oklch' ? html`<canvas aria-hidden="true"></canvas>` : nothing}
      <div
        part=${partMap({ marker: true, dragging: this._dragging })}
        style=${styles}
        tabindex="0"
        role="slider"
        aria-label=${this.markerLabel}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${saturation}
        aria-valuetext=${
          this.markerValueText ??
          formatString(
            ColorPickerResourceStringsEN.color_picker_canvas_value!,
            saturation,
            brightness
          )
        }
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-picker-canvas': IgcPickerCanvasComponent;
  }
}
