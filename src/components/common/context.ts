import { createContext } from '@lit/context';
import type IgcCarouselComponent from '../carousel/carousel.js';
import type IgcTileComponent from '../tile-manager/tile.js';

export const carouselContext = createContext<IgcCarouselComponent>(
  Symbol('carousel-context')
);

export const tileContext = createContext<IgcTileComponent>(
  Symbol('tile-context')
);
