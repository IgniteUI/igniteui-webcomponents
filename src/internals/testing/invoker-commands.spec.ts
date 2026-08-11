import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import type { LitElement, TemplateResult } from 'lit';
import IgcButtonComponent from '../../components/button/button.js';
import { defineComponents } from '../definitions/defineComponents.js';

interface ToggleComponent extends LitElement {
  open: boolean;
  show(): unknown;
  hide(): unknown;
}

export interface InvokerCommandsTestConfig {
  /** Tag name of the component under test. Queried from the rendered fixture. */
  tagName: string;
  /**
   * Fixture content — the component under test carrying an `id` equal to
   * {@link InvokerCommandsTestConfig.commandFor}, plus any required children.
   */
  template: TemplateResult;
  /** The id of the component instance the invoker button targets. */
  commandFor: string;
}

/**
 * Shared test suite asserting that a component with `open`/`show()`/`hide()`
 * semantics integrates with the Invoker Commands API — an `igc-button` with
 * `command="--show" | "--hide" | "--toggle"` and `commandfor` pointing at the
 * component toggles it declaratively.
 */
export function runInvokerCommandsTests(
  config: InvokerCommandsTestConfig
): void {
  const { tagName, template, commandFor } = config;

  describe('Invoker Commands API', () => {
    let invoker: IgcButtonComponent;
    let host: ToggleComponent;

    before(() => {
      defineComponents(IgcButtonComponent);
    });

    afterEach(async () => {
      if (host.open) {
        await host.hide();
      }
    });

    describe('with igc-button', () => {
      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button command="--show" commandfor=${commandFor}
              >Show</igc-button
            >
            ${template}
          </div>
        `);

        invoker = container.querySelector<IgcButtonComponent>(
          IgcButtonComponent.tagName
        )!;
        host = container.querySelector<ToggleComponent>(tagName)!;
      });

      it('`--show` opens the component', async () => {
        expect(host.open).to.be.false;

        invoker.click();
        await waitUntil(() => host.open);

        expect(host.open).to.be.true;
      });

      it('`--hide` closes an open component', async () => {
        await host.show();
        expect(host.open).to.be.true;

        invoker.command = '--hide';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !host.open);

        expect(host.open).to.be.false;
      });

      it('`--toggle` opens a closed component', async () => {
        expect(host.open).to.be.false;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => host.open);

        expect(host.open).to.be.true;
      });

      it('`--toggle` closes an open component', async () => {
        await host.show();
        expect(host.open).to.be.true;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !host.open);

        expect(host.open).to.be.false;
      });

      it('a disabled igc-button does not invoke commands', async () => {
        invoker.disabled = true;
        await elementUpdated(invoker);

        invoker.click();
        await elementUpdated(host);

        expect(host.open).to.be.false;
      });
    });
  });
}
