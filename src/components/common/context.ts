import { createContext } from '@lit/context';
import type { Ref } from 'lit/directives/ref.js';
import type IgcCarouselComponent from '../carousel/carousel.js';
import type { addFullscreenController } from '../tile-manager/controllers/fullscreen.js';
import type IgcTileManagerComponent from '../tile-manager/tile-manager.js';
import type IgcTileComponent from '../tile-manager/tile.js';

export type TileManagerContext = {
  /** The igc-tile-manager instance. */
  instance: IgcTileManagerComponent;
  /** The internal CSS grid container of the igc-tile-manager. */
  grid: Ref<HTMLElement>;
  /** The internal igc-tile-manager overlay container. */
  overlay: Ref<HTMLElement>;
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
