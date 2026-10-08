import { startViewTransition } from '#animations/view-transition.js';

/**
 * The inline view transition class of each tile before its first size
 * transition. Only the latest transition restores it.
 */
const sizeTransitions = new WeakMap<HTMLElement, { inline: string }>();

/**
 * Starts a view transition in which `tile` changes its size. Until it ends, the
 * tile also has the `igc-tile-resize` view transition class, and `igc-tile-rtl`
 * in RTL. The theme style sheets style them (see `_view-transitions.scss`).
 */
export function startSizeTransition(
  tile: HTMLElement,
  update: () => void
): ViewTransition {
  const inline =
    sizeTransitions.get(tile)?.inline ?? tile.style.viewTransitionClass;

  tile.style.viewTransitionClass = inline;

  const { direction, viewTransitionClass } = getComputedStyle(tile);
  const classes = [
    viewTransitionClass,
    'igc-tile-resize',
    direction === 'rtl' && 'igc-tile-rtl',
  ];

  tile.style.viewTransitionClass = classes
    .filter((name) => name && name !== 'none')
    .join(' ');

  const transition = startViewTransition(update);
  const entry = { inline };
  const restore = () => {
    if (sizeTransitions.get(tile) === entry) {
      sizeTransitions.delete(tile);
      tile.style.viewTransitionClass = inline;
    }
  };

  sizeTransitions.set(tile, entry);
  transition.finished.then(restore, restore);
  return transition;
}
