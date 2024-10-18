import type { ReactiveController } from 'lit';
import { isElement } from '../../common/util.js';
import type IgcTileManagerComponent from '../tile-manager.js';
import IgcTileComponent from '../tile.js';

class TileManagerFullscreenController implements ReactiveController {
  private _host: IgcTileManagerComponent;

  constructor(host: IgcTileManagerComponent) {
    this._host = host;
    this._host.addController(this);
  }

  private _isOwnTile(node: unknown): node is IgcTileComponent {
    return (
      isElement(node) &&
      node.matches(IgcTileComponent.tagName) &&
      this._host.contains(node)
    );
  }

  public handleEvent({ target }: Event): void {
    if (this._isOwnTile(target)) {
      target.draggable = !target.draggable;
    }
  }

  public hostConnected(): void {
    document.addEventListener('fullscreenchange', this);
  }

  public hostDisconnected(): void {
    document.addEventListener('fullscreenchange', this);
  }
}

export function addFullscreenController(host: IgcTileManagerComponent) {
  return new TileManagerFullscreenController(host);
}
