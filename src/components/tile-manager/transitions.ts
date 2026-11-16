import { startViewTransition } from '#animations/view-transition.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import type IgcTileComponent from './tile.js';

/**
 * The inline view transition class of each tile before its first size
 * transition. Only the latest transition restores it.
 */
const sizeTransitions = new WeakMap<HTMLElement, { inline: string }>();

export function childTiles(parent: ParentNode | null): IgcTileComponent[] {
  return Array.from(parent?.children ?? []).filter(
    (element): element is IgcTileComponent => element.localName === 'igc-tile'
  );
}

/** The name that the running transitions hold on each tile, and their count. */
const heldNames = new WeakMap<HTMLElement, { name: string; count: number }>();

/**
 * Names `tile` until the last of the overlapping transitions releases it. A
 * tile with an inline name of the author keeps it, and gets no release.
 */
function holdName(tile: HTMLElement): (() => void) | undefined {
  if (!heldNames.has(tile) && tile.style.viewTransitionName) {
    return undefined;
  }

  const held = getOrInsertComputed(heldNames, tile, ({ id, style }) => {
    const name = `tile-transition-${id}`;
    style.viewTransitionName = name;
    return { name, count: 0 };
  });

  held.count++;

  return () => {
    if (--held.count === 0) {
      heldNames.delete(tile);
      if (tile.style.viewTransitionName === held.name) {
        tile.style.viewTransitionName = '';
      }
    }
  };
}

/**
 * Starts a view transition in which the tiles of `parent` move, and names
 * them until it ends. A name on every tile would make each transition capture
 * all the tiles of the page.
 */
export function startTileTransition(
  parent: ParentNode | null,
  update: () => void
): ViewTransition {
  const releases = childTiles(parent).map(holdName);
  const transition = startViewTransition(update);
  const release = () => {
    for (const each of releases) {
      each?.();
    }
  };

  transition.finished.then(release, release);
  return transition;
}

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

  // Read the computed class without the classes of a running size transition.
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

  const transition = startTileTransition(tile.parentNode, update);
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
