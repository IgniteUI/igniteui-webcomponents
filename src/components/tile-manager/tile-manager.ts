import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import {
  type TileManagerContext,
  tileManagerContext,
} from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import {
  coercedProperty,
  type CoercedPropertyConfig,
} from '#internals/decorators/coerced-property.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { asNumber } from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { TileManagerDragMode, TileManagerResizeMode } from '../types.js';
import { createTilesState } from './position.js';
import { createSerializer } from './serializer.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

/* blazorAdditionalDependency: IgcTileComponent */
/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 *
 * @slot - Default slot for the tile manager. Only tile elements will be projected inside the CSS grid container.
 *
 * @csspart base - The tile manager CSS Grid container.
 * @csspart maximized-tile - Indicates that a tile is maximized. Applies to `base`.
 *
 * @cssproperty --column-count - The number of columns for the tile manager. The `column-count` attribute sets this variable.
 * @cssproperty --min-col-width - The minimum size of the columns in the tile-manager. The `min-column-width` attribute sets this variable.
 * @cssproperty --min-row-height - The minimum size of the rows in the tile-manager. The `min-row-height` attribute sets this variable.
 * @cssproperty --grid-gap - The gap size of the underlying CSS grid container. The `gap` attribute sets this variable.
 *
 */
@shadowOptions({ slotAssignment: 'manual' })
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  // #region Internal state

  private _internalStyles: StyleInfo = {};

  @state()
  private _hasMaximizedTile = false;

  /** Config for a property that sets a grid CSS variable. */
  private static _styleVariable<T = string | undefined>(
    name: string,
    transform: (value: T) => T = (value) => (value ?? undefined) as T
  ): CoercedPropertyConfig<T, IgcTileManagerComponent> {
    return {
      transform: ({ value }) => transform(value),
      onChange: ({ value, host }) => {
        Object.assign(host._internalStyles, { [name]: value || undefined });
      },
    };
  }

  private _serializer = createSerializer(this);
  private _tilesState = createTilesState(this);

  private _grid = createRef<HTMLElement>();

  // #endregion

  // #region Context helpers

  private readonly _managerContext: TileManagerContext = {
    instance: this,
    grid: this._grid,
    setMaximizedState: () => this._setMaximizedState(),
  };

  private readonly _context = addContextProvider(this, {
    context: tileManagerContext,
    watch: ['dragMode', 'resizeMode'],
    value: () => this._managerContext,
  });

  // #endregion

  // #region Properties and Attributes

  /**
   * The resize mode of the tiles. `none` turns resizing off.
   *
   * @attr resize-mode
   * @default none
   */
  @property({ attribute: 'resize-mode' })
  public resizeMode: TileManagerResizeMode = 'none';

  /**
   * The drag mode of the tiles. `none` turns drag and drop off.
   *
   * @attr drag-mode
   * @default none
   */
  @property({ attribute: 'drag-mode' })
  public dragMode: TileManagerDragMode = 'none';

  /**
   * The number of columns. A value of 0 or less gives a responsive layout.
   *
   * @attr column-count
   * @default 0
   */
  @property({ type: Number, attribute: 'column-count' })
  @coercedProperty(
    IgcTileManagerComponent._styleVariable<number>('--column-count', (value) =>
      Math.max(0, asNumber(value))
    )
  )
  public columnCount = 0;

  /**
   * The minimum width of a column.
   * @attr min-column-width
   */
  @property({ attribute: 'min-column-width' })
  @coercedProperty(IgcTileManagerComponent._styleVariable('--min-col-width'))
  public minColumnWidth?: string = undefined;

  /**
   * The minimum height of a row.
   * @attr min-row-height
   */
  @property({ attribute: 'min-row-height' })
  @coercedProperty(IgcTileManagerComponent._styleVariable('--min-row-height'))
  public minRowHeight?: string = undefined;

  /**
   * The gap between the tiles.
   *
   * @attr gap
   */
  @property()
  @coercedProperty(IgcTileManagerComponent._styleVariable('--grid-gap'))
  public gap?: string = undefined;

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

    addThemingController(this, all);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcTileComponent.tagName],
      config: {
        childList: true,
      },
    });
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('columnCount')) {
      this._tilesState.adjustTileGridPosition();
    }
  }

  protected override firstUpdated() {
    this._tilesState.assignPositions();
    this._tilesState.assignTiles();
    this._updateMaximizedTile();
    this._context.publish();
  }

  private _updateMaximizedTile(): void {
    this._hasMaximizedTile = this.tiles.some((tile) => tile.maximized);
  }

  private _observerCallback({
    changes: { added, removed },
  }: MutationControllerParams<IgcTileComponent>) {
    if (!(added.length || removed.length)) {
      return;
    }

    // A tile in both lists moved inside the manager, and keeps its place.
    const removedTiles = new Set(removed.map(({ node }) => node));
    const addedTiles = new Set(
      added.map(({ node }) => node).filter((node) => !removedTiles.has(node))
    );

    this._tilesState.normalize(addedTiles);
    this._tilesState.assignTiles();
    this._tilesState.adjustTileGridPosition();
    this._setMaximizedState();
  }

  /**
   * Locks the grid height while a tile is maximized. The maximized tile is
   * absolutely positioned, so without the lock the grid can collapse and cut
   * off its content.
   */
  private _setMaximizedState(): void {
    const grid = this._grid.value;
    this._updateMaximizedTile();

    if (grid) {
      grid.style.minHeight = this._hasMaximizedTile
        ? grid.style.minHeight || `${grid.offsetHeight}px`
        : '';
    }
  }

  // #endregion

  // #region Public API

  /** Returns the tile properties as a JSON string. The content of the tiles is not saved. */
  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  /** Applies a layout from `saveLayout` to the tiles with the same `id`. */
  public loadLayout(data: string): void {
    if (this._serializer.loadFromJSON(data)) {
      this._tilesState.normalize();
      this._tilesState.replaceLayout();
    }
  }

  // #endregion

  // #region Rendering

  protected override render() {
    const parts = {
      base: true,
      'maximized-tile': this._hasMaximizedTile,
    };

    return html`
      <div
        ${ref(this._grid)}
        style=${styleMap(this._internalStyles)}
        part=${partMap(parts)}
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
