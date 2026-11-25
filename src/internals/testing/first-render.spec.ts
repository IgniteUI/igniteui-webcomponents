import { expect, fixture } from '@open-wc/testing';
import type { LitElement, ReactiveControllerHost } from 'lit';

/**
 * Connects `host` and returns what `read` gives after the first update, before
 * a later update, such as the one that a `slotchange` requests, changes the DOM.
 */
export async function readFirstUpdate<T>(
  host: ReactiveControllerHost & Element,
  read: () => T
): Promise<T> {
  let result!: T;
  const reader = {
    hostUpdated: () => {
      host.removeController(reader);
      result = read();
    },
  };

  host.addController(reader);
  await fixture(host);
  return result;
}

/** Checks that the first render of a toggle control shows its slotted label. */
export function runFirstRenderLabelTests(tagName: string): void {
  describe('First render', () => {
    it('shows the slotted label', async () => {
      const host = document.createElement(tagName) as LitElement;
      host.textContent = 'Label';

      const hidden = await readFirstUpdate(
        host,
        () =>
          host.renderRoot.querySelector<HTMLElement>('[part~="label"]')!.hidden
      );

      expect(hidden).to.be.false;
    });
  });
}
