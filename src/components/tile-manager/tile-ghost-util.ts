import { isLTR } from '#internals/utils/dom.js';
import type IgcTileComponent from './tile.js';

/** Ghost styling shared between the drag and resize ghosts, themed from the tile's CSS variables. */
function getBaseGhostStyles(
  tile: IgcTileComponent,
  computed: CSSStyleDeclaration,
  background: string,
  borderColor: string
) {
  const { width, height } = tile.getBoundingClientRect();

  return {
    position: 'absolute',
    contain: 'strict',
    zIndex: 1000,
    width: `${width}px`,
    height: `${height}px`,
    background: computed.getPropertyValue(background),
    border: `1px solid ${computed.getPropertyValue(borderColor)}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
  };
}

export function createTileDragGhost(tile: IgcTileComponent): IgcTileComponent {
  const clone = tile.cloneNode(true) as IgcTileComponent;
  const computed = getComputedStyle(tile);

  Object.assign(clone, {
    id: null,
    inert: true,
    position: -1,
  });

  Object.assign(
    clone.style,
    getBaseGhostStyles(
      tile,
      computed,
      '--tile-background',
      '--hover-border-color'
    ),
    {
      direction: isLTR(tile) ? 'ltr' : 'rtl',
      top: 0,
      left: 0,
      opacity: 0.6,
      boxShadow: computed.getPropertyValue('--drag-elevation'),
      viewTransitionName: 'dragged-tile-ghost',
    }
  );

  return clone;
}

export function createTileGhost(tile: IgcTileComponent): HTMLElement {
  const element = document.createElement('div');
  const computed = getComputedStyle(tile);
  const { x, y } = tile.getBoundingClientRect();
  const { scrollX, scrollY } = window;

  Object.assign(
    element.style,
    getBaseGhostStyles(
      tile,
      computed,
      '--placeholder-background',
      '--ghost-border'
    ),
    {
      boxSizing: 'border-box',
      top: `${y + scrollY}px`,
      left: `${x + scrollX}px`,
    }
  );

  return element;
}
