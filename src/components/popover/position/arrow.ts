import { roundByDPR, setStyles } from '#internals/utils/dom.js';

export const OPPOSITE_SIDE = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
} as const;

export type PopoverSide = keyof typeof OPPOSITE_SIDE;

const SIDES = Object.keys(OPPOSITE_SIDE) as PopoverSide[];

/**
 * Sets the part and the inline styles of the arrow for the given `side`.
 *
 * Both position strategies call this function. Therefore the arrow gets the
 * same styles for each strategy.
 */
export function applyArrowStyles(
  element: HTMLElement,
  side: PopoverSide,
  x: number | undefined,
  y: number | undefined,
  offset: number
): void {
  const staticSide = OPPOSITE_SIDE[side];

  if (!element.part.contains(side)) {
    element.part.remove(...SIDES);
    element.part.add(side);
  }

  // The part gives the arrow its size. Measure the size after the part
  // changes.
  const inset =
    staticSide === 'top' || staticSide === 'bottom'
      ? element.offsetHeight
      : element.offsetWidth;

  // Reset every side. If a side keeps the inset of the previous placement,
  // that inset over-constrains the arrow.
  const styles: Partial<CSSStyleDeclaration> = {
    top: y != null ? `${roundByDPR(y + offset)}px` : '',
    right: '',
    bottom: '',
    left: x != null ? `${roundByDPR(x + offset)}px` : '',
  };

  styles[staticSide] = `${-inset}px`;

  setStyles(element, styles);
}
