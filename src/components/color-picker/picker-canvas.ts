import { html, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { AbstractConstructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { addSafeEventListener, asPercent, clamp } from '../common/util.js';
import { styles } from './themes/picker-canvas.base.css.js';

export interface IgcPickerCanvasEventMap {
  igcColorPicked: CustomEvent<PickerCanvasEventDetail>;
}

type PickerCanvasEventDetail = {
  x: number;
  y: number;
};

export default class IgcPickerCanvasComponent extends EventEmitterMixin<
  IgcPickerCanvasEventMap,
  AbstractConstructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-picker-canvas';
  public static styles = styles;

  public static register(): void {
    registerComponent(IgcPickerCanvasComponent);
  }

  @query('div', true)
  private readonly _marker!: HTMLDivElement;

  @property()
  public currentColor = '';

  @property({ attribute: false })
  public x = 0;

  @property({ attribute: false })
  public y = 0;

  constructor() {
    super();

    addSafeEventListener(this, 'pointerdown', this._handlePointerDown);
    addSafeEventListener(
      this,
      'lostpointercapture',
      this._handleLostPointerCapture
    );

    addKeybindings(this)
      .set(arrowDown, this._onArrowKey.bind(this, { dx: 0, dy: 1 }))
      .set(arrowUp, this._onArrowKey.bind(this, { dx: 0, dy: -1 }))
      .set(arrowLeft, this._onArrowKey.bind(this, { dx: -1, dy: 0 }))
      .set(arrowRight, this._onArrowKey.bind(this, { dx: 1, dy: 0 }));
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('currentColor')) {
      this.style.color = this.currentColor;
    }
  }

  private _onArrowKey({ dx, dy }: { dx: number; dy: number }): void {
    const rect = this.getBoundingClientRect();
    const { width, height } = this.getMarkerDimensions();

    const x = clamp(this.x + dx, -width, rect.width - width);
    const y = clamp(this.y + dy, -height, rect.height - height);

    const shouldEmit = x !== this.x || y !== this.y;

    Object.assign(this, { x, y });

    if (shouldEmit) {
      this.emitEvent('igcColorPicked', {
        detail: {
          x: Math.round(asPercent(x + width, rect.width)),
          y: Math.round(asPercent(y + height, rect.height)),
        },
      });
    }
  }

  private _move(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const rect = this.getBoundingClientRect();
    const { width, height } = this.getMarkerDimensions();
    const maxX = rect.width - width;
    const maxY = rect.height - height;

    const x = clamp(event.clientX - rect.x - width, -width, maxX);
    const y = clamp(event.clientY - rect.y - height, -height, maxY);
    const shouldEmit = x !== this.x || y !== this.y;

    Object.assign(this, { x, y });

    if (shouldEmit) {
      this.emitEvent('igcColorPicked', {
        detail: {
          x: Math.round(asPercent(x + width, rect.width)),
          y: Math.round(asPercent(y + height, rect.height)),
        },
      });
    }
  }

  private _handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.setPointerCapture(event.pointerId);
    this.addEventListener('pointermove', this._handlePointerMove);
    this._move(event);
  }

  private _handleLostPointerCapture(): void {
    this.removeEventListener('pointermove', this._handlePointerMove);
    this._marker.focus();
  }

  private _handlePointerMove(event: PointerEvent): void {
    this._move(event);
  }

  public getMarkerDimensions(): { width: number; height: number } {
    const rect = this._marker.getBoundingClientRect();
    return { width: rect.width / 2, height: rect.height / 2 };
  }

  protected override render() {
    const styles = styleMap({
      top: `${this.y}px`,
      left: `${this.x}px`,
    });

    return html`<div part="marker" style=${styles} tabindex="0"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-picker-canvas': IgcPickerCanvasComponent;
  }
}
