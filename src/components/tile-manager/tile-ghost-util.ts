import { setStyles } from '#internals/utils/dom.js';
import type IgcTileComponent from './tile.js';

/** Ghost styling shared between the drag and resize ghosts, themed from the tile's CSS variables. */
function getBaseGhostStyles(
  { width, height }: DOMRect,
  computed: CSSStyleDeclaration,
  background: string,
  borderColor: string
): Partial<CSSStyleDeclaration> {
  return {
    contain: 'strict',
    zIndex: '1000',
    width: `${width}px`,
    height: `${height}px`,
    background: computed.getPropertyValue(background),
    border: `1px solid ${computed.getPropertyValue(borderColor)}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
  };
}

export function createTileDragGhost(
  tile: IgcTileComponent,
  rect: DOMRect
): IgcTileComponent {
  const clone = tile.cloneNode(true) as IgcTileComponent;
  const computed = getComputedStyle(tile);

  // An empty id gives the clone a new one when it connects.
  Object.assign(clone, { id: '', inert: true });

  // A copy must not repeat a view transition name, such as the name of a
  // tile in a nested manager, or the browser skips the swap transitions.
  for (const element of clone.querySelectorAll<HTMLElement>('*')) {
    element.style.viewTransitionName = 'none';
  }

  setStyles(clone, {
    ...getBaseGhostStyles(
      rect,
      computed,
      '--tile-background',
      '--hover-border-color'
    ),
    direction: computed.direction,
    opacity: '0.6',
    boxShadow: computed.getPropertyValue('--drag-elevation'),
    viewTransitionName: 'dragged-tile-ghost',
  });

  return clone;
}

export function createTileGhost(
  tile: IgcTileComponent,
  rect: DOMRect
): HTMLElement {
  const element = document.createElement('div');

  setStyles(element, {
    ...getBaseGhostStyles(
      rect,
      getComputedStyle(tile),
      '--placeholder-background',
      '--ghost-border'
    ),
    boxSizing: 'border-box',
  });

  return element;
}
