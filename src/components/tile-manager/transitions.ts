import { startViewTransition } from '#animations/view-transition.js';

/** The size transition of each tile. Only the latest one removes its classes. */
const sizeTransitions = new WeakMap<HTMLElement, ViewTransition>();

/**
 * Starts a view transition in which `tile` changes its size, such as a
 * maximize or a resize. The tile has the `igc-tile-resize` view transition
 * class until the transition ends, and `igc-tile-rtl` in RTL. The theme style
 * sheets style these classes, because the view transition pseudo-elements
 * belong to the document.
 */
export function startSizeTransition(
  tile: HTMLElement,
  update: () => void
): ViewTransition {
  tile.style.viewTransitionClass =
    getComputedStyle(tile).direction === 'rtl'
      ? 'igc-tile-resize igc-tile-rtl'
      : 'igc-tile-resize';

  const transition = startViewTransition(update);
  const clear = () => {
    if (sizeTransitions.get(tile) === transition) {
      sizeTransitions.delete(tile);
      tile.style.viewTransitionClass = '';
    }
  };

  sizeTransitions.set(tile, transition);
  transition.finished.then(clear, clear);
  return transition;
}
