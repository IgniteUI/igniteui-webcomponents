import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import {
  type TileManagerContext,
  tileManagerContext,
} from '../common/context.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import { asNumber, partNameMap } from '../common/util.js';
import type { TileManagerDragMode, TileManagerResizeMode } from '../types.js';
import { createTilesState } from './position.js';
import { createSerializer } from './serializer.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 *
 */
@themes(all)
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [styles, shared];

  public static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    slotAssignment: 'manual',
  };

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  // #region Internal state

  private _internalStyles: StyleInfo = {};
  private _dragMode: TileManagerDragMode = 'none';
  private _resizeMode: TileManagerResizeMode = 'none';
  private _columnCount = 0;
  private _gap?: string;
  private _minColWidth?: string;
  private _minRowHeight?: string;

  private _serializer = createSerializer(this);
  private _tilesState = createTilesState(this);

  private _grid = createRef<HTMLElement>();

  // #endregion

  // #region Context helpers

  private _context = new ContextProvider(this, {
    context: tileManagerContext,
    initialValue: this._createContext(),
  });

  private _createContext(): TileManagerContext {
    return {
      instance: this,
      grid: this._grid,
    };
  }

  private _setManagerContext(): void {
    this._context.setValue(this._createContext(), true);
  }

  // #endregion

  // #region Properties and Attributes

  /**
   * Whether resize operations are enabled.
   *
   * @attr resize-mode
   * @default none
   */
  @property({ attribute: 'resize-mode' })
  public set resizeMode(value: TileManagerResizeMode) {
    this._resizeMode = value;
    this._setManagerContext();
  }

  public get resizeMode(): TileManagerResizeMode {
    return this._resizeMode;
  }

  /**
   * Whether drag and drop operations are enabled.
   *
   * @attr drag-mode
   * @default none
   */
  @property({ attribute: 'drag-mode' })
  public set dragMode(value: TileManagerDragMode) {
    this._dragMode = value;
    this._setManagerContext();
  }

  public get dragMode(): TileManagerDragMode {
    return this._dragMode;
  }

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
   *
   * @attr gap
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
   * @property
   */
  public get tiles() {
    return this._tilesState.tiles;
  }

  // #endregion

  // #region Internal API

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

  // #endregion

  // #region Public API

  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  public loadLayout(data: string): void {
    this._serializer.loadFromJSON(data);
  }

  // #endregion

  // #region Rendering

  protected override render() {
    const parts = partNameMap({
      base: true,
      'maximized-tile': this.tiles.some((tile) => tile.maximized),
    });

    return html`
      <div
        ${ref(this._grid)}
        style=${styleMap(this._internalStyles)}
        part=${parts}
      >
        <slot></slot>
      </div>
    `;
  }

  // #endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tile-manager': IgcTileManagerComponent;
  }
}
