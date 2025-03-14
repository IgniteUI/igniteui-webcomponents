/**
 * Default ghost element factory for the igc-resize implementation.
 */
export function createDefaultGhostElement({
  x,
  y,
  width,
  height,
}: DOMRect): HTMLElement {
  const element = document.createElement('div');
  const { scrollX, scrollY } = window;

  Object.assign(element.style, {
    position: 'absolute',
    top: `${y + scrollY}px`,
    left: `${x + scrollX}px`,
    zIndex: 1000,
    background: 'pink',
    opacity: 0.85,
    width: `${width}px`,
    height: `${height}px`,
  });

  return element;
}

export function getDefaultLayer(): HTMLElement {
  return document.body;
}
