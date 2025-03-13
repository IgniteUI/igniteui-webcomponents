import type IgcTileComponent from './tile.js';

export function createTileDragGhost(tile: IgcTileComponent): IgcTileComponent {
  const clone = tile.cloneNode(true) as IgcTileComponent;
  const computed = getComputedStyle(tile);

  const { width, height } = tile.getBoundingClientRect();

  Object.assign(clone, {
    id: null,
    inert: true,
    position: -1,
  });

  Object.assign(clone.style, {
    position: 'absolute',
    contain: 'strict',
    top: 0,
    left: 0,
    width: `${width}px`,
    height: `${height}px`,
    opacity: 0.6,
    background: computed.getPropertyValue('--tile-background'),
    border: `1px solid ${computed.getPropertyValue('--hover-border-color')}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
    boxShadow: computed.getPropertyValue('--drag-elevation'),
    zIndex: 1000,
    viewTransitionName: 'dragged-tile-ghost',
  });

  return clone;
}

export function createTileGhost(tile: IgcTileComponent): HTMLElement {
  const element = document.createElement('div');
  const computed = getComputedStyle(tile);
  const { x, y, width, height } = tile.getBoundingClientRect();
  const { scrollX, scrollY } = window;

  Object.assign(element.style, {
    boxSizing: 'border-box',
    position: 'absolute',
    contain: 'strict',
    top: `${y + scrollY}px`,
    left: `${x + scrollX}px`,
    zIndex: 1000,
    background: computed.getPropertyValue('--placeholder-background'),
    border: `1px solid ${computed.getPropertyValue('--ghost-border')}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
    width: `${width}px`,
    height: `${height}px`,
  });

  return element;
}
