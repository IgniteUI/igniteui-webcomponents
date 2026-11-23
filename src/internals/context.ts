import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcButtonGroupComponent from '../components/button-group/button-group.js';
import type IgcToggleButtonComponent from '../components/button-group/toggle-button.js';
import type IgcCarouselComponent from '../components/carousel/carousel.js';
import type { ChatState } from '../components/chat/chat-state.js';
import type { ColorModel } from '../components/color-picker/model.js';
import type IgcTileManagerComponent from '../components/tile-manager/tile-manager.js';
import type {
  ColorFormat,
  ColorPanelView,
  TabsHeaderPosition,
} from '../components/types.js';

export type ButtonGroupContext = {
  /** The `igc-button-group` instance. */
  instance: IgcButtonGroupComponent;
  /**
   * Reconciles the group with a button that changes its own state. A single
   * selection mode drops the previous selection, and the roving tab stop
   * moves off a button that can no longer hold it.
   */
  syncState: (button: IgcToggleButtonComponent) => void;
  /** Whether `button` is the tab stop of the group. */
  isTabStop: (button: IgcToggleButtonComponent) => boolean;
};

export type TileManagerContext = {
  /** The `igc-tile-manager` instance. */
  instance: IgcTileManagerComponent;
  /** The internal CSS grid container of the `igc-tile-manager`. */
  grid: Ref<HTMLElement>;
  /** Synchronizes the tile manager with the maximized state of its tiles. */
  setMaximizedState: () => void;
};

/** The link of an `igc-color-panel` to the `igc-color-picker` that renders it. */
export type ColorPickerContext = {
  /** Takes the format that the user picked in the panel. */
  setFormat: (format: ColorFormat) => void;
  /** Takes the view that the user picked in the panel. */
  setActiveView: (view: ColorPanelView) => void;
  /** Whether the picker keeps the changes as a draft until Apply. */
  isConfirmMode: () => boolean;
  /**
   * Applies the draft and closes the popup. In the confirm mode, the panel
   * calls it for Enter on its canvas marker, sliders and swatches.
   */
  applyDraft: () => void;
};

/** The link of an `igc-color-swatch` to the `igc-color-panel` that shows it. */
export type ColorPanelContext = {
  /** The accessible name of a no-color swatch without a `label`. */
  noColorLabel: () => string;
  /** The accessible name of a swatch without a `label`: the color name. */
  swatchName: (color: ColorModel) => string;
  /**
   * Tells the panel that a swatch connected, disconnected or changed its
   * color. The panel then reads the colors of all swatches again.
   */
  refreshSwatches: () => void;
};

const buttonGroupContext = createContext<ButtonGroupContext>(
  Symbol('button-group-context')
);

const carouselContext = createContext<IgcCarouselComponent>(
  Symbol('carousel-context')
);

const tileManagerContext = createContext<TileManagerContext>(
  Symbol('tile-manager-context')
);

const chatContext = createContext<ChatState>(Symbol('chat-context'));
const colorPickerContext = createContext<ColorPickerContext>(
  Symbol('color-picker-context')
);
const colorPanelContext = createContext<ColorPanelContext>(
  Symbol('color-panel-context')
);
const chatUserInputContext = createContext<ChatState>(
  Symbol('chat-user-input-context')
);

const breadcrumbsContext = createContext<string>(Symbol('breadcrumbs-context'));

/** The `headerPosition` of the `igc-tabs` that holds a tab. */
const tabsHeaderPositionContext = createContext<TabsHeaderPosition>(
  Symbol('tabs-header-position-context')
);

export {
  breadcrumbsContext,
  buttonGroupContext,
  carouselContext,
  chatContext,
  chatUserInputContext,
  colorPanelContext,
  colorPickerContext,
  tabsHeaderPositionContext,
  tileManagerContext,
};
