import { setStyles } from '#internals/utils/dom.js';
import type IgcTileComponent from './tile.js';

/**
 * The attributes that act again when the drag copy connects, with the elements
 * that have them. A named radio joins and unchecks the group of the original,
 * and a radio group names its radios again. A frame loads its page again, and
 * `autoplay` plays the media.
 */
const LIVE_ATTRIBUTES = {
  name: 'input[type="radio"], igc-radio, igc-radio-group',
  src: 'iframe, embed',
  srcdoc: 'iframe',
  data: 'object',
  autoplay: 'audio, video',
};

/** The look of the drag and resize ghosts, themed from the CSS variables of the tile. */
function getBaseGhostStyles(
  computed: CSSStyleDeclaration,
  background: string,
  borderColor: string
): Partial<CSSStyleDeclaration> {
  return {
    contain: 'strict',
    background: computed.getPropertyValue(background),
    border: `1px solid ${computed.getPropertyValue(borderColor)}`,
    borderRadius: computed.getPropertyValue('--border-radius'),
  };
}

export function createTileDragGhost(tile: IgcTileComponent): IgcTileComponent {
  const clone = tile.cloneNode(true) as IgcTileComponent;
  const computed = getComputedStyle(tile);

  // An empty id gives the clone a new one when it connects.
  Object.assign(clone, { id: '', inert: true });

  // A copy must not repeat a view transition name, or the browser skips the
  // swap transitions.
  for (const element of clone.querySelectorAll<HTMLElement>('*')) {
    element.style.viewTransitionName = 'none';

    // A copied control joins the form of its `form` attribute, else a form
    // around the ghost. An empty `form` joins no form.
    if ('form' in element) {
      element.setAttribute('form', '');
    }
  }

  for (const [attribute, selector] of Object.entries(LIVE_ATTRIBUTES)) {
    for (const element of clone.querySelectorAll(selector)) {
      element.removeAttribute(attribute);
    }
  }

  setStyles(clone, {
    ...getBaseGhostStyles(
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

export function createTileGhost(tile: IgcTileComponent): HTMLElement {
  const element = document.createElement('div');

  setStyles(element, {
    ...getBaseGhostStyles(
      getComputedStyle(tile),
      '--placeholder-background',
      '--ghost-border'
    ),
    boxSizing: 'border-box',
  });

  return element;
}
