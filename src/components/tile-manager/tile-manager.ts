import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
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
import { asNumber, partNameMap } from '../common/util.js';
import { createTilesState } from './position.js';
import { createSerializer } from './serializer.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

// REVIEW: WIP
export interface IgcTileManagerComponentEventMap {
  igcTileDragStarted: CustomEvent<IgcTileComponent>;
}

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

  private _dragMode: 'none' | 'tile-header' | 'tile' = 'none';

  private _columnCount = 0;
  private _gap?: string;
  private _minColWidth?: string;
  private _minRowHeight?: string;
  private _draggedItem: IgcTileComponent | null = null;
  private _lastSwapTile: IgcTileComponent | null = null;

  private _overlay: Ref<HTMLElement> = createRef();

  private _serializer = createSerializer(this);
  private _tilesState = createTilesState(this);

  private _context = new ContextProvider(this, {
    context: tileManagerContext,
    initialValue: {
      instance: this,
      overlay: this._overlay,
      draggedItem: this._draggedItem,
      lastSwapTile: this._lastSwapTile,
    },
  });

  private _setManagerContext() {
    this._context.setValue(
      {
        instance: this,
        overlay: this._overlay,
        draggedItem: this._draggedItem,
        lastSwapTile: this._lastSwapTile,
      },
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
   * Whether drag and drop operations are enabled.
   *
   * @attr drag-mode
   * @default none
   */
  @property({ attribute: 'drag-mode' })
  public set dragMode(value: 'none' | 'tile-header' | 'tile') {
    this._dragMode = value;
    this._setManagerContext();
  }

  public get dragMode(): 'none' | 'tile-header' | 'tile' {
    return this._dragMode;
  }

  /**
   * Whether the tiles will slide or swap on drop during a drag and drop operation.
   * @attr drag-action
   */
  @property({ attribute: 'drag-action' })
  public dragAction: 'slide' | 'swap' = 'slide';

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
   * Sets the gap size of the the tile manager.
   */
  @property()
  public set gap(value: string | undefined) {
    this._gap = value ?? undefined;
    Object.assign(this._internalStyles, {
      '--ig-gap': this._gap,
    });
  }

  public get gap(): string | undefined {
    return this._gap;
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
    this._setManagerContext();
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

  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  public loadLayout(data: string): void {
    this._serializer.loadFromJSON(data);
  }

  protected _renderOverlay() {
    return html`<div ${ref(this._overlay)} part="overlay"></div>`;
  }

  protected override render() {
    const parts = partNameMap({
      base: true,
      'maximized-tile': this.tiles.some((tile) => tile.maximized),
    });

    return html`
      ${this._renderOverlay()}
      <div
        style=${styleMap(this._internalStyles)}
        part=${parts}
        @tileDragStart=${this.handleTileDragStart}
        @tileDragEnd=${this.handleTileDragEnd}
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
