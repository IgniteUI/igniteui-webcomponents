import type { ReactiveController } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import type IgcTileComponent from '../tile.js';

type TileResizeCallback = (event: PointerEvent) => unknown;

type TileResizeConfig = {
  resizeStart: TileResizeCallback;
  resizeMove: TileResizeCallback;
  resizeEnd: TileResizeCallback;
};

const PointerEvents = [
  'pointerdown',
  'pointermove',
  'lostpointercapture',
  'pointercancel',
] as const;

class TileResizeController implements ReactiveController {
  private _host: IgcTileComponent;
  private _handlers!: Map<string, TileResizeCallback>;
  private _ref?: Ref<HTMLElement>;
  private pointerCaptured = false;

  protected get _element() {
    return this._ref ? this._ref.value! : this._host;
  }

  constructor(
    host: IgcTileComponent,
    ref: Ref<HTMLElement>,
    config: Partial<TileResizeConfig>
  ) {
    this._host = host;
    this._ref = ref;
    this._host.addController(this);
    this._initEventHandlers(config);
  }

  public handleEvent(event: PointerEvent) {
    switch (event.type) {
      case 'pointerdown':
        return this._handlePointerDown(event);
      case 'pointermove':
        return this._handlePointerMove(event);
      case 'lostpointercapture':
      case 'pointercancel':
        return this._handleLostPointerCapture(event);
    }
  }

  public async hostConnected(): Promise<void> {
    await this._host.updateComplete;

    for (const event of PointerEvents) {
      this._element.addEventListener(event, this);
    }
  }

  public hostDisconnected(): void {
    for (const event of PointerEvents) {
      this._element.removeEventListener(event, this);
    }
  }

  private _initEventHandlers(config: Partial<TileResizeConfig>) {
    this._handlers = new Map();

    for (const [type, callback] of Object.entries(config)) {
      this._handlers.set(type.toLowerCase(), callback);
    }
  }

  private _handlePointerDown(event: PointerEvent) {
    event.preventDefault();

    this._handlers.get('resizestart')?.call(this._host, event);

    this._element.setPointerCapture(event.pointerId);
    this.pointerCaptured = true;
    this._element.focus();
  }

  private _handlePointerMove(event: PointerEvent) {
    event.preventDefault();

    if (this.pointerCaptured) {
      this._handlers.get('resizemove')?.call(this._host, event);
    }
  }

  private _handleLostPointerCapture(event: PointerEvent) {
    event.preventDefault();
    this._handlers.get('resizeend')?.call(this._host, event);

    this.pointerCaptured = false;
    this._element.releasePointerCapture(event.pointerId);
  }
}

export function addTileResize(
  host: IgcTileComponent,
  ref: Ref<HTMLElement>,
  config: Partial<TileResizeConfig>
) {
  return new TileResizeController(host, ref, config);
}
