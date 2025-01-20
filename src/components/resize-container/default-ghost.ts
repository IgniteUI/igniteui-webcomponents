/**
 * Default ghost element factory for the igc-resize-container implementation.
 */
export function createDefaultGhostElement(
  width: number,
  height: number
): HTMLElement {
  const element = document.createElement('div');

  Object.assign(element.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000, // REVIEW: Expose as a CSS variable
    background: 'pink', // REVIEW: Expose as a CSS variable
    opacity: 0.85, // REVIEW: Expose as a CSS variable
    width: `${width}px`,
    height: `${height}px`,
  });

  return element;
}
