import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcCarouselComponent from '../carousel/carousel.js';
import type IgcChatComponent from '../chat/chat.js';
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

const chatContext = createContext<IgcChatComponent>(Symbol('chat-context'));

export { carouselContext, tileManagerContext, chatContext };
