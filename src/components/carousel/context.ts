import { createContext } from '@lit/context';
import type IgcCarouselComponent from './carousel.js';

export const carouselContext = createContext<IgcCarouselComponent>(
  Symbol('carousel-context')
);
