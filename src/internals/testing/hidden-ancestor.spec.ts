import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { resetMouse } from '@web/test-runner-commands';
import type { TemplateResult } from 'lit';
import { configureTheme } from '#theming/config.js';
import { THEMES } from '#theming/types.js';
import {
  allowMotion,
  elementsIn,
  enterState,
  INTERACTION_STATES,
  partLabel,
  shadowRootsIn,
} from './helpers.spec.js';

function visibilityTransitionsIn(container: HTMLElement): string[] {
  const animations = [
    ...container.getAnimations({ subtree: true }),
    ...shadowRootsIn(container).flatMap((root) => root.getAnimations()),
  ];

  return animations
    .filter(
      (animation) =>
        animation instanceof CSSTransition &&
        animation.transitionProperty === 'visibility'
    )
    .map(({ effect }) => {
      const { target, pseudoElement } = effect as KeyframeEffect;
      return partLabel(target!, pseudoElement);
    });
}

function visibleElementsIn(container: HTMLElement): string[] {
  return elementsIn(container)
    .filter((element) => getComputedStyle(element).visibility !== 'hidden')
    .map((element) => partLabel(element));
}

/**
 * Tests in each theme that `template` hides with a hidden ancestor, at rest,
 * with its first element focused and with the pointer over it: no
 * `visibility` transition runs, and no element stays visible.
 */
export function runHiddenAncestorTests(template: TemplateResult): void {
  describe('Hidden ancestor', () => {
    allowMotion();

    afterEach(() => resetMouse());
    after(() => configureTheme('bootstrap'));

    for (const theme of THEMES) {
      for (const state of INTERACTION_STATES) {
        it(`hides at once with a hidden ancestor in the ${theme} theme (${state})`, async () => {
          configureTheme(theme);
          const container = await fixture<HTMLElement>(
            html`<div>${template}</div>`
          );
          await enterState(state, container.firstElementChild as HTMLElement);
          await nextFrame();

          container.style.visibility = 'hidden';

          expect(visibilityTransitionsIn(container)).to.eql([]);
          expect(visibleElementsIn(container)).to.eql([]);
        });
      }
    }
  });
}
