import { expect } from '@open-wc/testing';
import {
  definedTags,
  fixtureTag,
} from '#internals/testing/defined-tags.spec.js';
import {
  elementsIn,
  isUnderPageLayer,
  partLabel,
} from '#internals/testing/helpers.spec.js';
import { configureTheme } from '#theming/config.js';
import { THEMES } from '#theming/types.js';

/** Whether the point that `isUnderPageLayer` hit-tests lies in `box`, where the page layer goes. */
function isOver(box: DOMRect, part: Element): boolean {
  const { left, top, right, bottom } = part.getBoundingClientRect();
  const x = (Math.max(left, 0) + Math.min(right, innerWidth)) / 2;
  const y = (Math.max(top, 0) + Math.min(bottom, innerHeight)) / 2;

  return (
    right > left &&
    bottom > top &&
    x > box.left &&
    x < box.right &&
    y > box.top &&
    y < box.bottom
  );
}

/**
 * Hit tests do not reach pseudo-elements, so the z-index of `::before` and
 * `::after` is not checked.
 */
describe('z-index containment', () => {
  const tags = definedTags();

  after(() => configureTheme('bootstrap'));

  for (const theme of THEMES) {
    describe(`${theme} theme`, () => {
      before(() => configureTheme(theme));

      for (const tag of tags) {
        it(`paints the parts of <${tag}> under an earlier page layer`, async () => {
          const { container, element } = await fixtureTag(tag);
          const box = container.parentElement!.getBoundingClientRect();

          const leaks = (
            element.shadowRoot ? elementsIn(element.shadowRoot) : []
          )
            .filter((part) => getComputedStyle(part).zIndex !== 'auto')
            .filter((part) => isOver(box, part))
            .filter((part) => !isUnderPageLayer(container, part))
            .map((part) => partLabel(part));

          expect(leaks).to.eql([]);
        });
      }
    });
  }
});
