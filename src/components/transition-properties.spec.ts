import { expect } from '@open-wc/testing';
import { resetMouse } from '@web/test-runner-commands';
import {
  definedTags,
  fixtureTag,
} from '#internals/testing/defined-tags.spec.js';
import {
  allowMotion,
  elementsIn,
  enterState,
  INTERACTION_STATES,
  partLabel,
} from '#internals/testing/helpers.spec.js';
import { instantMarksEnded } from '#internals/testing/value-state.spec.js';
import { configureTheme } from '#theming/config.js';
import { THEMES } from '#theming/types.js';

const PSEUDO_ELEMENTS = [null, '::before', '::after'] as const;

/** A `transition-property` of `all` with a time above zero. */
function transitionsAll(style: CSSStyleDeclaration): boolean {
  const durations = style.transitionDuration.split(',').map(parseFloat);
  const delays = style.transitionDelay.split(',').map(parseFloat);

  return style.transitionProperty
    .split(',')
    .some(
      (property, index) =>
        property.trim() === 'all' &&
        durations[index % durations.length] + delays[index % delays.length] > 0
    );
}

/** The elements and pseudo-elements in `container` that transition `all`, with their host. */
function elementsTransitioningAll(container: Element): string[] {
  return [container, ...elementsIn(container)].flatMap((element) => {
    const root = element.getRootNode();
    const host = root instanceof ShadowRoot ? `${root.host.localName} ` : '';

    return PSEUDO_ELEMENTS.filter((pseudoElement) =>
      transitionsAll(getComputedStyle(element, pseudoElement))
    ).map((pseudoElement) => host + partLabel(element, pseudoElement));
  });
}

/**
 * Stylelint rejects an explicit `all`, but a rule that sets only the timing
 * properties also transitions `all` when no other rule names the properties.
 * Not checked: slotted content and states other than `INTERACTION_STATES`.
 */
describe('Transition properties', () => {
  const tags = definedTags();

  allowMotion();

  after(() => resetMouse());
  after(() => configureTheme('bootstrap'));

  for (const theme of THEMES) {
    describe(`${theme} theme`, () => {
      before(() => configureTheme(theme));

      for (const tag of tags) {
        it(`names the transitioned properties of <${tag}>`, async () => {
          const { container, element } = await fixtureTag(tag);
          const leaks: string[] = [];

          await instantMarksEnded(container);

          for (const state of INTERACTION_STATES) {
            await enterState(state, element);
            leaks.push(
              ...elementsTransitioningAll(container).map(
                (leak) => `${leak} (${state})`
              )
            );
          }

          expect(leaks).to.eql([]);
        });
      }
    });
  }
});
