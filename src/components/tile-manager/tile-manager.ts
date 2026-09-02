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
 *
 * @cssproperty --column-count - The number of columns for the tile manager. The `column-count` attribute sets this variable.
 * @cssproperty --min-col-width - The minimum size of the columns in the tile-manager. The `min-column-width` attribute sets this variable.
 * @cssproperty --min-row-height - The minimum size of the rows in the tile-manager. The `min-row-height` attribute sets this variable.
 * @cssproperty --grid-gap - The gap size of the underlying CSS grid container. The `gap` attributes sts this variable.
 *
 */
@shadowOptions({ slotAssignment: 'manual' })
export default class IgcTileManagerComponent extends LitElement {
  public static readonly tagName = 'igc-tile-manager';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTileManagerComponent, IgcTileComponent);
  }

  // #region Internal state

  private _internalStyles: StyleInfo = {};

  /** Whether any of the tiles is currently in a maximized state. */
  @state()
  private _hasMaximizedTile = false;

  /** Shared config for the properties that project into a grid CSS variable. */
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
   * Whether resize operations are enabled.
   *
   * @attr resize-mode
   * @default none
   */
  @property({ attribute: 'resize-mode' })
  public resizeMode: TileManagerResizeMode = 'none';

  /**
   * Whether drag and drop operations are enabled.
   *
   * @attr drag-mode
   * @default none
   */
  @property({ attribute: 'drag-mode' })
  public dragMode: TileManagerDragMode = 'none';

  /**
   * Sets the number of columns for the tile manager.
   * Setting value <= than zero will trigger a responsive layout.
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
   * Sets the minimum width for a column unit in the tile manager.
   * @attr min-column-width
   */
  @property({ attribute: 'min-column-width' })
  @coercedProperty(IgcTileManagerComponent._styleVariable('--min-col-width'))
  public minColumnWidth?: string = undefined;

  /**
   * Sets the minimum height for a row unit in the tile manager.
   * @attr min-row-height
   */
  @property({ attribute: 'min-row-height' })
  @coercedProperty(IgcTileManagerComponent._styleVariable('--min-row-height'))
  public minRowHeight?: string = undefined;

  /**
   * Sets the gap size between tiles in the tile manager.
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
    const isOwn = ({ target }: { target: Element }) =>
      target.closest(this.tagName) === this;

    for (const { node } of removed.filter(isOwn)) {
      this._tilesState.remove(node);
    }

    for (const { node } of added.filter(isOwn)) {
      this._tilesState.add(node);
    }

    this._tilesState.assignTiles();
    this._tilesState.adjustTileGridPosition();
    this._updateMaximizedTile();
  }

  /**
   * Locks/unlocks the grid container height in response to a tile's maximized state changing.
   *
   * @remarks
   * Maximizing a tile removes it from the grid flow (absolute positioning), so it no longer
   * contributes to the grid's intrinsic height. When that tile is the sole contributor to the
   * tallest row track, the container would otherwise collapse to the remaining tiles and cut off
   * the maximized tile's content. Capturing the current height before the layout change keeps the
   * container stable, and it is released once no tile remains maximized.
   */
  private _setMaximizedState(): void {
    const grid = this._grid.value;
    this._updateMaximizedTile();

    if (grid) {
      if (this._hasMaximizedTile) {
        if (!grid.style.minHeight) {
          grid.style.minHeight = `${grid.offsetHeight}px`;
        }
      } else {
        grid.style.minHeight = '';
      }
    }
  }

  // #endregion

  // #region Public API

  /**
   * Returns the properties of the current tile collections as a JSON payload.
   *
   * @remarks
   * The content of the tiles is not serialized or saved. Only tile properties
   * are serialized.
   */
  public saveLayout(): string {
    return this._serializer.saveAsJSON();
  }

  /**
   * Restores a previously serialized state produced by `saveLayout`.
   */
  public loadLayout(data: string): void {
    this._serializer.loadFromJSON(data);
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
