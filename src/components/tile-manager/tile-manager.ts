import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import { tileManagerContext } from '../common/context.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, findElementFromEventPath } from '../common/util.js';
import { addFullscreenController } from './controllers/fullscreen.js';
import { createTilesState, isSameTile, swapTiles } from './position.js';
import { createSerializer } from './serializer.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

// REVIEW: WIP
export interface IgcTileManagerComponentEventMap {
  igcTileDragStarted: CustomEvent<IgcTileComponent>;
}

export type TileManagerContext = {
  instance: IgcTileManagerComponent;
  draggedItem: IgcTileComponent | null;
};

/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 *
 * @fires igcTileDragStarted - Fired when an owning tile begins a drag operation.
 */
@themes(all)
export default class IgcTileManagerComponent extends EventEmitterMixin<
  IgcTileManagerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tile-manager';
  public static styles = [styles, shared];

  protected static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    slotAssignment: 'manual',
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  private _internalStyles: StyleInfo = {};

  private _columnCount = 0;
  private _minColWidth?: string;
  private _minRowHeight?: string;
  private _draggedItem: IgcTileComponent | null = null;

  private _serializer = createSerializer(this);
  private _tilesState = createTilesState(this);

  private _context = new ContextProvider(this, {
    context: tileManagerContext,
    initialValue: {
      instance: this,
      draggedItem: this._draggedItem,
    },
  });

  private _setManagerContext() {
    this._context.setValue(
      { instance: this, draggedItem: this._draggedItem },
      true
    );
  }

  private _observerCallback({
    changes: { added, removed },
  }: MutationControllerParams<IgcTileComponent>) {
    const ownAdded = added.filter(
      ({ target }) => target.closest(this.tagName) === this
    );
    const ownRemoved = removed.filter(
      ({ target }) => target.closest(this.tagName) === this
    );

    for (const remove of ownRemoved) {
      this._tilesState.remove(remove.node);
    }

    for (const added of ownAdded) {
      this._tilesState.add(added.node);
    }

    this._tilesState.assignTiles();
  }

  /**
   * Determines whether the tiles slide or swap on drop.
   * @attr drag-mode
   */
  @property({ attribute: 'drag-mode' })
  public dragMode: 'slide' | 'swap' = 'slide';

  /**
   * Sets the number of columns for the tile manager.
   * Setting value <= than zero will trigger a responsive layout.
   *
   * @attr column-count
   * @default 0
   */
  @property({ type: Number, attribute: 'column-count' })
  public set columnCount(value: number) {
    this._columnCount = Math.max(0, asNumber(value));
    Object.assign(this._internalStyles, {
      '--ig-column-count': this._columnCount || undefined,
    });
  }

  public get columnCount(): number {
    return this._columnCount;
  }

  /**
   * Sets the minimum width for a column unit in the tile manager.
   * @attr min-column-width
   */
  @property({ attribute: 'min-column-width' })
  public set minColumnWidth(value: string | undefined) {
    this._minColWidth = value ?? undefined;
    Object.assign(this._internalStyles, {
      '--ig-min-col-width': this._minColWidth,
    });
  }

  public get minColumnWidth(): string | undefined {
    return this._minColWidth;
  }

  /**
   * Sets the minimum height for a row unit in the tile manager.
   * @attr min-row-height
   */
  @property({ attribute: 'min-row-height' })
  public set minRowHeight(value: string | undefined) {
    this._minRowHeight = value ?? undefined;
    Object.assign(this._internalStyles, {
      '--ig-min-row-height': this._minRowHeight,
    });
  }

  public get minRowHeight(): string | undefined {
    return this._minRowHeight;
  }

  /**
   * Gets the tiles sorted by their position in the layout.
   * @attr
   */
  public get tiles() {
    return this._tilesState.tiles;
  }

  constructor() {
    super();
    addFullscreenController(this);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcTileComponent.tagName],
      config: {
        childList: true,
      },
    });
  }

  protected override firstUpdated() {
    this._tilesState.assignPositions();
    this._tilesState.assignTiles();
  }

  private handleTileDragStart({ detail }: CustomEvent<IgcTileComponent>) {
    this.emitEvent('igcTileDragStarted', { detail });
    this._draggedItem = detail;
    this._setManagerContext();
  }

  private handleTileDragEnd() {
    if (this._draggedItem) {
      this._draggedItem = null;
      this._setManagerContext();
    }
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault(); // Allow dropping
  }

  private handleDrop(event: DragEvent) {
    event.preventDefault();

    const draggedItem = this._draggedItem;
    const target = findElementFromEventPath<IgcTileComponent>(
      IgcTileComponent.tagName,
      event
    );

    if (!isSameTile(draggedItem, target) && this.dragMode === 'swap') {
      swapTiles(draggedItem!, target!);
    }
  }

  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  public loadLayout(data: string): void {
    this._serializer.loadFromJSON(data);
  }

  protected override render() {
    return html`
      <div
        style=${styleMap(this._internalStyles)}
        part="base"
        @tileDragStart=${this.handleTileDragStart}
        @tileDragEnd=${this.handleTileDragEnd}
        @dragover=${this.handleDragOver}
        @drop=${this.handleDrop}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-manager': IgcTileManagerComponent;
  }
}
