import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcButtonGroupComponent from '../components/button-group/button-group.js';
import type IgcToggleButtonComponent from '../components/button-group/toggle-button.js';
import type IgcCarouselComponent from '../components/carousel/carousel.js';
import type { ChatState } from '../components/chat/chat-state.js';
import type IgcTileManagerComponent from '../components/tile-manager/tile-manager.js';

export type ButtonGroupContext = {
  /** The igc-button-group instance. */
  instance: IgcButtonGroupComponent;
  /**
   * Reconciles the group with a button whose state changed on its own: the single
   * selection modes drop the previous selection, and the roving tab stop moves off
   * a button that can no longer hold it.
   */
  syncState: (button: IgcToggleButtonComponent) => void;
  /**
   * Whether `button` is the tab stop of the group. The single selection modes run
   * a roving tab index, where a single button at a time is reachable by Tab.
   */
  isTabStop: (button: IgcToggleButtonComponent) => boolean;
};

export type TileManagerContext = {
  /** The igc-tile-manager instance. */
  instance: IgcTileManagerComponent;
  /** The internal CSS grid container of the igc-tile-manager. */
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

export {
  breadcrumbsContext,
  buttonGroupContext,
  carouselContext,
  chatContext,
  chatUserInputContext,
  tileManagerContext,
};
