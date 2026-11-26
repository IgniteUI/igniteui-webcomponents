import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcButtonGroupComponent from '../components/button-group/button-group.js';
import type IgcToggleButtonComponent from '../components/button-group/toggle-button.js';
import type IgcCarouselComponent from '../components/carousel/carousel.js';
import type { ChatState } from '../components/chat/chat-state.js';
import type IgcListHeaderComponent from '../components/list/list-header.js';
import type IgcListItemComponent from '../components/list/list-item.js';
import type IgcTileManagerComponent from '../components/tile-manager/tile-manager.js';
import type { TabsHeaderPosition } from '../components/types.js';

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

/** The roles of a list with keyboard navigation and of its items. */
export type ListRoles = {
  list: 'list' | 'listbox' | 'grid';
  item: 'listitem' | 'option' | 'row';
  cell?: 'gridcell';
};

export type ListContext = {
  /**
   * Whether the list runs a keyboard navigation for `element`: the list
   * navigates, and `element` is one of its own items or headers.
   */
  navigates: (element: Element) => boolean;
  /** The roles of the list, its items and the one cell of an item, if any. */
  roles: () => ListRoles;
  /** Whether an item that is not selected exposes `aria-selected="false"`. */
  exposesUnselected: () => boolean;
  /** The header of the group of `item`. */
  headerOf: (item: IgcListItemComponent) => IgcListHeaderComponent | undefined;
  /** Picks the tab stop again after a change of the selection. */
  syncState: () => void;
};

export type TileManagerContext = {
  /** The `igc-tile-manager` instance. */
  instance: IgcTileManagerComponent;
  /** The internal CSS grid container of the `igc-tile-manager`. */
  grid: Ref<HTMLElement>;
  /** Synchronizes the tile manager with the maximized state of its tiles. */
  setMaximizedState: () => void;
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
const chatUserInputContext = createContext<ChatState>(
  Symbol('chat-user-input-context')
);

const breadcrumbsContext = createContext<string>(Symbol('breadcrumbs-context'));

const listContext = createContext<ListContext>(Symbol('list-context'));

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
  listContext,
  tabsHeaderPositionContext,
  tileManagerContext,
};
