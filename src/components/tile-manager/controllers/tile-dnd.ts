import type { ReactiveController } from 'lit';
import type IgcTileComponent from '../tile.js';

type TileDragCallback = (
  event: PointerEvent,
  tile: IgcTileComponent
) => unknown;

type TileDragAndDropConfig = {
  dragStart: TileDragCallback;
  dragMove: TileDragCallback;
  dragEnd: TileDragCallback;
};

export class TileDragAndDropController implements ReactiveController {
  public enabled = true;

  private _host: IgcTileComponent;
  private _handlers!: Map<string, TileDragCallback>;
  private _isDragging = false;
  private _draggedTile: IgcTileComponent | null = null;

  constructor(host: IgcTileComponent, config: Partial<TileDragAndDropConfig>) {
    this._host = host;
    this._host.addController(this);
    this._initEventHandlers(config);
  }

  private _initEventHandlers(config: Partial<TileDragAndDropConfig>) {
    this._handlers = new Map();

    for (const [type, callback] of Object.entries(config)) {
      this._handlers.set(type.toLowerCase(), callback);
    }
  }

  private _onPointerDown = (event: PointerEvent) => {
    if (!this.enabled || this._isDragging) return;

    this._isDragging = true;
    this._draggedTile = this._host;
    this._handlers.get('dragstart')?.call(this._host, event, this._host);

    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
  };

  private _onPointerMove = (event: PointerEvent) => {
    if (!this._isDragging || !this._draggedTile) return;

    this._handlers.get('dragmove')?.call(this._host, event, this._draggedTile);
  };

  private _onPointerUp = (event: PointerEvent) => {
    if (!this._isDragging || !this._draggedTile) return;

    this._handlers.get('dragend')?.call(this._host, event, this._draggedTile);

    this._isDragging = false;
    this._draggedTile = null;

    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
  };

  public hostConnected(): void {
    this._host.addEventListener('pointerdown', this._onPointerDown);
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this._onPointerDown);
  }
}

export function addTileDragAndDrop(
  host: IgcTileComponent,
  config: Partial<TileDragAndDropConfig>
) {
  return new TileDragAndDropController(host, config);
}
