import { createContext } from '@lit/context';
import type IgcCarouselComponent from '../carousel/carousel.js';
import type { addFullscreenController } from '../tile-manager/controllers/fullscreen.js';
import type IgcTileManagerComponent from '../tile-manager/tile-manager.js';
import type IgcTileComponent from '../tile-manager/tile.js';

export type TileManagerContext = {
  instance: IgcTileManagerComponent;
  draggedItem: IgcTileComponent | null;
  lastSwapTile: IgcTileComponent | null;
};

export type TileContext = {
  /** The igc-tile component instance. */
  instance: IgcTileComponent;
  /** The fullscreen controller of the igc-tile instance. */
  fullscreenController: ReturnType<typeof addFullscreenController>;
};

const carouselContext = createContext<IgcCarouselComponent>(
  Symbol('carousel-context')
);

const tileContext = createContext<TileContext>(Symbol('tile-context'));

const tileManagerContext = createContext<TileManagerContext>(
  Symbol('tile-manager-context')
);

export { carouselContext, tileContext, tileManagerContext };
