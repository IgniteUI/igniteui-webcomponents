import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
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
import { addResizeObserverController } from '#internals/controllers/resize-observer.js';
import {
  coercedProperty,
  type CoercedPropertyConfig,
} from '#internals/decorators/coerced-property.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addLocaleController } from '#internals/i18n/i18n-controller.js';
import { partMap } from '#internals/part-map.js';
import { asNumber } from '#internals/utils/math.js';
import { all } from '#themes/tile-manager/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { TileManagerDragMode, TileManagerResizeMode } from '../types.js';
import { createTilesState } from './position.js';
import { parseTrackSizes } from './resize-util.js';
import { applyLayout, serializeTiles } from './serializer.js';
import { styles as shared } from './themes/shared/tile-manager.common.css.js';
import { styles } from './themes/tile-manager.base.css.js';
import IgcTileComponent from './tile.js';

/* blazorAdditionalDependency: IgcTileComponent */
/**
 * The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.
 *
 * @element igc-tile-manager
 *
 * @slot - Default slot for the tile manager. Only tile elements are projected inside the CSS grid container.
 *
 * @csspart base - The tile manager CSS Grid container.
 * @csspart maximized-tile - Indicates that a tile is maximized. Applies to `base`.
 *
 * @cssproperty --column-count - The number of columns for the tile manager, a whole number. The `column-count` attribute sets this variable. Without the attribute, set it in a style sheet, for example in a media query. `initial` gives the responsive layout.
 * @cssproperty --min-col-width - The minimum width of the columns. The `min-column-width` attribute sets this variable.
 * @cssproperty --min-row-height - The minimum height of the rows. The `min-row-height` attribute sets this variable.
 * @cssproperty --grid-gap - The gap size of the underlying CSS grid container. The `gap` attribute sets this variable.
 * @cssproperty --grid-padding - The padding of the underlying CSS grid container. Defaults to 1.25rem. The default resize handles stand out of the tiles by at most this value, and stay inside with more than one value.
 */
@shadowOptions({ slotAssignment: 'manual' })
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  // #region Internal state

  private readonly _internalStyles: StyleInfo = {};

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

  private readonly _tilesState = createTilesState(this);

  private readonly _grid = createRef<HTMLElement>();

  /** A hidden grid with the columns of the grid, which `_fitColumns` counts. */
  private readonly _trackProbe = createRef<HTMLElement>();

  /** A cell of one column in the probe. It resizes when the columns change. */
  private readonly _trackCell = createRef<HTMLElement>();

  private readonly _localeController = addLocaleController(this);

  private readonly _columnObserver = addResizeObserverController(this, {
    callback: this._scheduleFitColumns,
    target: null,
    requestUpdate: false,
  });

  private _fitFrame = 0;

  /** The count that the last change replaced, until the frame of the change ends. */
  private _replacedColumns = 0;

  // #endregion

  // #region Context helpers

  private readonly _managerContext: TileManagerContext = {
    instance: this,
    grid: this._grid,
    setMaximizedState: () => this._setMaximizedState(),
  };

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
   * The number of columns, truncated to a whole number. A value of 0 or less
   * gives a responsive layout.
   *
   * @attr column-count
   * @default 0
   */
  @property({ type: Number, attribute: 'column-count' })
  @coercedProperty(
    IgcTileManagerComponent._styleVariable<number>('--column-count', (value) =>
      Math.max(0, Math.trunc(asNumber(value)))
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
   * The locale of the tiles. A tile without its own locale takes this one.
   * Without it, the manager takes its own `lang`, else the locale of the
   * nearest ancestor that has a `locale` (a component) or a `lang`, and then
   * the global locale.
   *
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._localeController.locale = value;
  }

  public get locale(): string {
    return this._localeController.locale;
  }

  /** The tiles, sorted by their position in the layout. */
  public get tiles(): IgcTileComponent[] {
    return this._tilesState.tiles;
  }

  // #endregion

  constructor() {
    super();

    addThemingController(this, all);

    addContextProvider(this, {
      context: tileManagerContext,
      watch: ['dragMode', 'resizeMode'],
      value: () => this._managerContext,
    });

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcTileComponent.tagName],
      config: {
        childList: true,
      },
    });
  }

  protected override firstUpdated(): void {
    this._tilesState.assignPositions();
    this._tilesState.assignTiles();
    this._updateMaximizedTile();
    // The probe resizes with the width, and a column cell with the columns.
    // The grid also resizes with the tiles.
    this._columnObserver.observe(this._trackProbe.value!);
    this._columnObserver.observe(this._trackCell.value!);
    this._fitColumns();
  }

  protected override updated(properties: PropertyValues<this>): void {
    // The observer would count a frame later.
    if (
      properties.has('columnCount') ||
      properties.has('minColumnWidth') ||
      properties.has('gap')
    ) {
      this._fitColumns();
    }
  }

  // #region Internal API

  /**
   * Counts the columns in the next frame. A new count can change the page
   * height, and a page scrollbar then changes the width. A count in the
   * observer callback would start a `ResizeObserver` loop.
   */
  private _scheduleFitColumns(): void {
    // In the frame of a count change, a resize comes from that change.
    const replaced = this._replacedColumns;

    cancelAnimationFrame(this._fitFrame);
    this._fitFrame = requestAnimationFrame(() => this._fitColumns(replaced));
  }

  /**
   * Sets `--_fit-columns` to the column count of the grid, so the tiles fit
   * their spans and starts into it. Else a span past the last column adds
   * columns of 0px.
   */
  private _fitColumns(replaced = 0): void {
    // A hidden grid has no layout. The observer counts again when it shows.
    if (!this._trackCell.value?.getClientRects().length) {
      return;
    }

    const { gridTemplateColumns } = getComputedStyle(this._trackProbe.value!);
    const count = parseTrackSizes(gridTemplateColumns).length;
    const { style } = this._grid.value!;
    const current = asNumber(style.getPropertyValue('--_fit-columns'));

    // A lower count can remove the page scrollbar, which adds a column. The old
    // count then brings the scrollbar back, and the two alternate every frame.
    // A count below the columns adds no columns of 0px, so it stays.
    if (count === current || (count === replaced && count > current)) {
      return;
    }

    style.setProperty('--_fit-columns', `${count}`);
    this._replacedColumns = current;
    requestAnimationFrame(() => {
      this._replacedColumns = 0;
    });
  }

  private _updateMaximizedTile(): void {
    this._hasMaximizedTile = this.tiles.some((tile) => tile.maximized);
  }

  private _observerCallback({
    changes: { added, removed },
  }: MutationControllerParams<IgcTileComponent>): void {
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
    return serializeTiles(this.tiles);
  }

  /** Applies a layout from `saveLayout` to the tiles with the same `id`. Invalid JSON throws. */
  public loadLayout(data: string): void {
    if (applyLayout(this.tiles, data)) {
      this._tilesState.normalize();
      this._tilesState.replaceLayout();
    }
  }

  // #endregion

  // #region Rendering

  protected override render(): TemplateResult {
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
        <div ${ref(this._trackProbe)} id="track-probe">
          <div></div>
          <div ${ref(this._trackCell)}></div>
        </div>
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
