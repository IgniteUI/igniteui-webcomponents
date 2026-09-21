import { roundByDPR, setStyles } from '#internals/utils/dom.js';

export const OPPOSITE_SIDE = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
} as const;

export type PopoverSide = keyof typeof OPPOSITE_SIDE;

const SIDES = Object.keys(OPPOSITE_SIDE) as PopoverSide[];

/** Returns the side of a placement, without the alignment. */
export function getPlacementSide(placement: string): PopoverSide {
  return placement.split('-')[0] as PopoverSide;
}

/** True if `side` is on the block axis. */
export function isBlockSide(side: PopoverSide): boolean {
  return side === 'top' || side === 'bottom';
}

/**
 * Sets the part and the inline styles of the arrow. Both strategies call it,
 * so the arrow gets the same styles.
 *
 * `side` is the side of the container that touches the anchor. `distance` is
 * the position of the arrow on the cross axis of that side.
 */
export function applyArrowStyles(
  element: HTMLElement,
  side: PopoverSide,
  distance: number,
  offset: number
): void {
  const staticSide = OPPOSITE_SIDE[side];

  if (!element.part.contains(side)) {
    element.part.remove(...SIDES);
    element.part.add(side);
  }

  // The part gives the arrow its size. Measure after the part changes.
  const block = isBlockSide(staticSide);
  const inset = block ? element.offsetHeight : element.offsetWidth;

  // Reset all sides. A stale inset over-constrains the arrow.
  const styles: Partial<CSSStyleDeclaration> = {
    top: '',
    right: '',
    bottom: '',
    left: '',
    [block ? 'left' : 'top']: `${roundByDPR(distance + offset)}px`,
  };

  styles[staticSide] = `${-inset}px`;

  setStyles(element, styles);
}
