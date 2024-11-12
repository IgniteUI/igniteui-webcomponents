import type { ReactiveController } from 'lit';
import type IgcTileComponent from '../tile.js';

type TileDragCallback = (event: DragEvent) => unknown;

type TileDragAndDropConfig = {
  dragStart: TileDragCallback;
  dragEnd: TileDragCallback;
  dragEnter: TileDragCallback;
  dragLeave: TileDragCallback;
  drop: TileDragCallback;
};

const DragEvents = ['dragstart', 'dragend', 'dragenter', 'dragleave', 'drop'];

export class TileDragAndDropController implements ReactiveController {
  public enabled = true;

  private _host: IgcTileComponent;
  private _handlers!: Map<string, TileDragCallback>;

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

  public handleEvent(event: DragEvent) {
    if (!this.enabled) return;

    if (this._handlers.has(event.type)) {
      this._handlers.get(event.type)!.call(this._host, event);
    }
  }

  public hostConnected(): void {
    this._host.draggable = true;

    for (const type of DragEvents) {
      this._host.addEventListener(type, this);
    }
  }

  public hostDisconnected(): void {
    for (const type of DragEvents) {
      this._host.removeEventListener(type, this);
    }
  }
}

export function addTileDragAndDrop(
  host: IgcTileComponent,
  config: Partial<TileDragAndDropConfig>
) {
  return new TileDragAndDropController(host, config);
}
