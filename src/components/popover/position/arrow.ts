import { getCSSZoom, roundByDPR, setStyles } from '#internals/utils/dom.js';
import { clamp } from '#internals/utils/math.js';

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

/** Sets the side part of the arrow. */
function setArrowSide(element: HTMLElement, side: PopoverSide): void {
  if (!element.part.contains(side)) {
    element.part.remove(...SIDES);
    element.part.add(side);
  }
}

/**
 * Sets the part and the inline styles of the arrow for both strategies. The
 * arrow is centered on `anchor`, a client rectangle. `side` is the side of the
 * anchor that the container is on.
 */
export function applyArrowStyles(
  element: HTMLElement,
  container: HTMLElement,
  anchor: DOMRect,
  side: PopoverSide,
  offset: number
): void {
  const staticSide = OPPOSITE_SIDE[side];

  setArrowSide(element, side);

  // The part gives the arrow its size. Measure after the part changes.
  const block = isBlockSide(staticSide);
  const inset = block ? element.offsetHeight : element.offsetWidth;
  const size = block ? element.offsetWidth : element.offsetHeight;
  const room = Math.max(
    0,
    (block ? container.clientWidth : container.clientHeight) - size
  );

  const cross = block ? 'left' : 'top';
  const crossSize = block ? 'width' : 'height';
  const zoom = getCSSZoom(container);
  const center =
    (anchor[cross] +
      anchor[crossSize] / 2 -
      container.getBoundingClientRect()[cross]) /
    zoom;

  // The first clamp lets the offset move an arrow at an edge off the rounded
  // corner. The second one keeps the offset from moving it out.
  const position = clamp(clamp(center - size / 2, 0, room) + offset, 0, room);

  // Reset all sides. A stale inset over-constrains the arrow.
  setStyles(element, {
    top: '',
    right: '',
    bottom: '',
    left: '',
    // Round on the device pixel grid, which the zoom scales.
    [cross]: `${roundByDPR(position * zoom) / zoom}px`,
    [staticSide]: `${-inset}px`,
  });
}
