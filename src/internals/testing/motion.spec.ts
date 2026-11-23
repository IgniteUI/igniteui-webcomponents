import { getCSSTransitions } from '#animations/css-transitions.js';
import { configureTheme } from '#theming/config.js';
import type { Theme } from '#theming/types.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import { styles as fluent } from '../../styles/themes/light/fluent.css.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import { styles as material } from '../../styles/themes/light/material.css.js';
import { shadowRootsIn, withDocumentSheets } from './helpers.spec.js';

/** The test page has no palette, so no color changes without one. */
const PALETTES = { bootstrap, fluent, indigo, material };

/** The running CSS transitions in `container` and its shadow roots, as `element property`. */
export function transitionsIn(container: Element): string[] {
  return [container, ...shadowRootsIn(container)]
    .flatMap((root) => getCSSTransitions(root, { subtree: true }))
    .map(({ effect, transitionProperty }) => {
      const { target, pseudoElement } = effect as KeyframeEffect;
      const part = target?.getAttribute('part');
      return `${target?.localName}${part ? `[part="${part}"]` : ''}${pseudoElement ?? ''} ${transitionProperty}`;
    });
}

/** Runs `fn` in `theme`, with its palette, then goes back to the default theme. */
export async function withTheme<R>(
  theme: Theme,
  fn: () => R | Promise<R>
): Promise<R> {
  configureTheme(theme);

  try {
    return await withDocumentSheets([PALETTES[theme].styleSheet!], fn);
  } finally {
    configureTheme('bootstrap');
  }
}
