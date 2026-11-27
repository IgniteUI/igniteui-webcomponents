import { fixture } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineAllComponents } from '../definitions/defineAllComponents.js';

/** Tags that render only inside a parent, mounted in that parent. */
const PARENTS = new Map([
  ['igc-message-attachments', 'igc-chat'],
  ['igc-tab', 'igc-tabs'],
]);

/** The tags that `defineAllComponents` defines, with their dependencies. */
export function definedTags(): string[] {
  const define = spy(customElements, 'define');

  try {
    defineAllComponents();
    return define.args.map(([tag]) => tag);
  } finally {
    define.restore();
  }
}

/**
 * Mounts a bare `tag`, in its parent for a tag that renders only there. The
 * `container` is the mounted element: the parent, or else the tag element.
 */
export async function fixtureTag(
  tag: string
): Promise<{ container: HTMLElement; element: HTMLElement }> {
  const parent = PARENTS.get(tag);
  const container = await fixture<HTMLElement>(
    parent ? `<${parent}><${tag}></${tag}></${parent}>` : `<${tag}></${tag}>`
  );

  return {
    container,
    element: parent ? container.querySelector<HTMLElement>(tag)! : container,
  };
}
