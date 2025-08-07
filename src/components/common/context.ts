import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcCarouselComponent from '../carousel/carousel.js';
import type { ChatState } from '../chat/chat-state.js';
import type IgcTileManagerComponent from '../tile-manager/tile-manager.js';

export type TileManagerContext = {
  /** The igc-tile-manager instance. */
  instance: IgcTileManagerComponent;
  /** The internal CSS grid container of the igc-tile-manager. */
  grid: Ref<HTMLElement>;
};

const carouselContext = createContext<IgcCarouselComponent>(
  Symbol('carousel-context')
);

const tileManagerContext = createContext<TileManagerContext>(
  Symbol('tile-manager-context')
);

const chatContext = createContext<ChatState>(Symbol('chat-context'));

export { carouselContext, tileManagerContext, chatContext };
