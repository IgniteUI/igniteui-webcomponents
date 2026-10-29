import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import type { TemplateResult } from 'lit';
import { configureTheme } from '#theming/config.js';
import { THEMES } from '#theming/types.js';

const STATES = ['idle', 'focused', 'hovered'] as const;

function shadowRootsIn(root: ParentNode): ShadowRoot[] {
  return Array.from(root.querySelectorAll('*')).flatMap(({ shadowRoot }) =>
    shadowRoot ? [shadowRoot, ...shadowRootsIn(shadowRoot)] : []
  );
}

function label(element: Element | null, pseudoElement?: string | null): string {
  return `${element?.localName}[part="${element?.getAttribute('part')}"]${pseudoElement ?? ''}`;
}

async function enter(
  state: (typeof STATES)[number],
  element: HTMLElement
): Promise<void> {
  if (state === 'focused') {
    element.focus();
  } else if (state === 'hovered') {
    const { left, top, width, height } = element.getBoundingClientRect();
    await sendMouse({
      type: 'move',
      position: [Math.round(left + width / 2), Math.round(top + height / 2)],
    });
  }
}

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
      return label(target, pseudoElement);
    });
}

function visibleElementsIn(container: HTMLElement): string[] {
  return [container, ...shadowRootsIn(container)]
    .flatMap((root) => Array.from(root.querySelectorAll('*')))
    .filter((element) => getComputedStyle(element).visibility !== 'hidden')
    .map((element) => label(element));
}

/**
 * Tests in each theme that `template` hides with a hidden ancestor, at rest,
 * with its first element focused and with the pointer over it: no
 * `visibility` transition runs, and no element stays visible.
 */
export function runHiddenAncestorTests(template: TemplateResult): void {
  describe('Hidden ancestor', () => {
    afterEach(() => resetMouse());
    after(() => configureTheme('bootstrap'));

    for (const theme of THEMES) {
      for (const state of STATES) {
        it(`hides at once with a hidden ancestor in the ${theme} theme (${state})`, async () => {
          configureTheme(theme);
          const container = await fixture<HTMLElement>(
            html`<div>${template}</div>`
          );
          await enter(state, container.firstElementChild as HTMLElement);
          await nextFrame();

          container.style.visibility = 'hidden';

          expect(visibilityTransitionsIn(container)).to.eql([]);
          expect(visibleElementsIn(container)).to.eql([]);
        });
      }
    }
  });
}
