import type { ReactiveController } from 'lit';
import type IgcTileComponent from '../tile.js';

type TileResizeCallback = (event: PointerEvent) => unknown;

type TileResizeConfig = {
  resizeStart: TileResizeCallback;
  resizeMove: TileResizeCallback;
  resizeEnd: TileResizeCallback;
};

class TileResizeController implements ReactiveController {
  private _host: IgcTileComponent;
  private _handlers!: Map<string, TileResizeCallback>;
  private pointerCaptured = false;
  private observer!: MutationObserver;

  constructor(host: IgcTileComponent, config: Partial<TileResizeConfig>) {
    this._host = host;
    this._host.addController(this);
    this._initEventHandlers(config);
  }

  private _initEventHandlers(config: Partial<TileResizeConfig>) {
    this._handlers = new Map();

    for (const [type, callback] of Object.entries(config)) {
      this._handlers.set(type.toLowerCase(), callback);
    }
  }

  public handleEvent(event: PointerEvent) {
    if (this._handlers.has(event.type)) {
      this._handlers.get(event.type)!.call(this._host, event);
    }
  }

  private pointerDown = (event: PointerEvent) => {
    event.preventDefault();

    const resizeHandle =
      this._host.shadowRoot!.querySelector('.resize-handle')!;
    this._handlers.get('resizestart')?.call(this._host, event);

    resizeHandle.setPointerCapture(event.pointerId);
    this.pointerCaptured = true;

    this._host.addEventListener('pointermove', this.pointerMove.bind(this));
    resizeHandle.addEventListener(
      'lostpointercapture',
      this.lostPointerCapture.bind(this) as EventListener
    );
  };

  private pointerMove(event: PointerEvent) {
    event.preventDefault();

    if (this.pointerCaptured) {
      this._handlers.get('resizemove')?.call(this._host, event);
    }
  }

  private lostPointerCapture(event: PointerEvent) {
    event.preventDefault();
    this._handlers.get('resizeend')?.call(this._host, event);

    const resizeHandle =
      this._host.shadowRoot!.querySelector('.resize-handle')!;
    this.pointerCaptured = false;

    resizeHandle.releasePointerCapture(event.pointerId);
    resizeHandle.removeEventListener(
      'pointerdown',
      this.pointerDown as EventListener
    );
    resizeHandle.removeEventListener(
      'pointermove',
      this.pointerMove as EventListener
    );
    resizeHandle.removeEventListener(
      'lostpointercapture',
      this.lostPointerCapture as EventListener
    );
  }

  public hostConnected(): void {
    if (this._host.shadowRoot) {
      this.observer = new MutationObserver(() => {
        const resizeHandle =
          this._host.shadowRoot!.querySelector('.resize-handle');
        if (resizeHandle) {
          resizeHandle.addEventListener(
            'pointerdown',
            this.pointerDown.bind(this) as EventListener
          );
          this.observer.disconnect();
        }
      });

      this.observer.observe(this._host.shadowRoot, {
        childList: true,
        subtree: true,
      });
    }
  }

  public hostDisconnected(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export function addTileResize(
  host: IgcTileComponent,
  config: Partial<TileResizeConfig>
) {
  return new TileResizeController(host, config);
}
