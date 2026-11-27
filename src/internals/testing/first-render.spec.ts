import {
  elementUpdated,
  expect,
  fixture,
  fixtureSync,
  html,
  nextFrame,
} from '@open-wc/testing';
import type { LitElement, ReactiveControllerHost } from 'lit';

/**
 * Parses a server render of `tagName` synchronously, so the caller acts before
 * the first update. Stops `slotchange`: a page fires it before the upgrade.
 */
export function parseServerRendered<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children: string,
  shadow = '<slot></slot>'
): HTMLElementTagNameMap[K] {
  const container = fixtureSync<HTMLDivElement>(html`<div></div>`);
  container.setHTMLUnsafe(
    `<${tagName}><template shadowrootmode="open">${shadow}</template>${children}</${tagName}>`
  );

  const host = container.firstElementChild as HTMLElementTagNameMap[K];
  host.shadowRoot!.addEventListener(
    'slotchange',
    (event) => event.stopImmediatePropagation(),
    { capture: true }
  );

  return host;
}

/** Waits until a host from `parseServerRendered` ends its hydration. */
export async function waitForHydration(host: Element): Promise<void> {
  await nextFrame();
  await elementUpdated(host);
}

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
