import { expect, fixture } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineAllComponents } from '#internals/definitions/defineAllComponents.js';
import { isUnderPageLayer } from '#internals/testing/helpers.spec.js';
import { configureTheme } from '#theming/config.js';
import { THEMES } from '#theming/types.js';

/** Tags that render only inside a parent, mounted in that parent. */
const PARENTS = new Map([
  ['igc-message-attachments', 'igc-chat'],
  ['igc-tab', 'igc-tabs'],
]);

/** The tags that `defineAllComponents` defines, with their dependencies. */
function definedTags(): string[] {
  const define = spy(customElements, 'define');

  try {
    defineAllComponents();
    return define.args.map(([tag]) => tag);
  } finally {
    define.restore();
  }
}

function zIndexedElementsIn(root: ShadowRoot): Element[] {
  return Array.from(root.querySelectorAll('*')).flatMap((element) => [
    ...(getComputedStyle(element).zIndex === 'auto' ? [] : [element]),
    ...(element.shadowRoot ? zIndexedElementsIn(element.shadowRoot) : []),
  ]);
}

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

function label(element: Element): string {
  return `${element.localName}[part="${element.getAttribute('part')}"]`;
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
          const parent = PARENTS.get(tag);
          const element = await fixture<HTMLElement>(
            parent
              ? `<${parent}><${tag}></${tag}></${parent}>`
              : `<${tag}></${tag}>`
          );
          const { shadowRoot } = parent ? element.querySelector(tag)! : element;
          const box = element.parentElement!.getBoundingClientRect();

          const leaks = (shadowRoot ? zIndexedElementsIn(shadowRoot) : [])
            .filter((part) => isOver(box, part))
            .filter((part) => !isUnderPageLayer(element, part))
            .map(label);

          expect(leaks).to.eql([]);
        });
      }
    });
  }
});
