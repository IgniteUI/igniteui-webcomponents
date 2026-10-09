import { fadeIn, fadeOut } from '#animations/presets/fade/index.js';
import {
  noop,
  slideInHor,
  slideInVer,
  slideOutHor,
  slideOutVer,
} from '#animations/presets/slide/index.js';
import type { AnimationReferenceMetadata } from '#animations/types.js';

type SlideAnimation = (
  options: KeyframeAnimationOptions
) => AnimationReferenceMetadata;

export const animations: Record<
  'fade' | 'slideHor' | 'slideVer' | 'none',
  Record<'in' | 'out', SlideAnimation>
> = {
  fade: { in: fadeIn, out: fadeOut },
  slideHor: { in: slideInHor, out: slideOutHor },
  slideVer: { in: slideInVer, out: slideOutVer },
  none: { in: noop, out: noop },
};
