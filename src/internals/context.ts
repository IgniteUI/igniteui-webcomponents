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
   * Reconciles the group with a button that has turned selected on its own,
   * so that the single selection modes can drop the previous selection.
   */
  syncSelection: (button: IgcToggleButtonComponent) => void;
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

export {
  buttonGroupContext,
  carouselContext,
  chatContext,
  chatUserInputContext,
  tileManagerContext,
};
