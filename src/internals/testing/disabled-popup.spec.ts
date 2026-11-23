import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html, unsafeStatic } from 'lit/static-html.js';
import { spy } from 'sinon';
import type { IgcBaseComboBoxComponent } from '../bases/combo-box.js';
import { defineComponents } from '../definitions/defineComponents.js';
import type { IgniteComponent } from '../definitions/register.js';

type DisabledPopupHost = IgcBaseComboBoxComponent & { disabled: boolean };

/**
 * Tests that a disabled `component` stays closed: disabling closes it without
 * events, `show()`, `toggle()` and `open` do not open it, and a disabled
 * fieldset closes it. `getAriaTarget` returns the element with `aria-expanded`.
 */
export function runDisabledPopupTests<T extends HTMLElement>(
  component: IgniteComponent & (new () => T),
  { getAriaTarget }: { getAriaTarget?: (host: T) => Element } = {}
): void {
  const tag = unsafeStatic(component.tagName);

  describe('Disabled popup', () => {
    before(() => defineComponents(component));

    it('closes without events when disabled, and opens again when enabled', async () => {
      const host = await fixture<T & DisabledPopupHost>(
        html`<${tag}></${tag}>`
      );
      await host.show();
      await elementUpdated(host);
      const eventSpy = spy(host, 'emitEvent');

      host.disabled = true;
      await elementUpdated(host);

      expect(host.open, 'open').to.be.false;
      expect(host.hasAttribute('open'), 'open attribute').to.be.false;
      if (getAriaTarget) {
        expect(
          getAriaTarget(host).getAttribute('aria-expanded'),
          'aria-expanded'
        ).to.equal('false');
      }
      expect(eventSpy.called, 'events').to.be.false;

      host.disabled = false;
      await elementUpdated(host);

      expect(await host.show(), 'show()').to.be.true;
      expect(host.open, 'open after show()').to.be.true;
    });

    it('does not open while disabled', async () => {
      const host = await fixture<DisabledPopupHost>(
        html`<${tag} disabled></${tag}>`
      );

      expect(await host.show(), 'show()').to.be.false;
      expect(await host.toggle(), 'toggle()').to.be.false;

      host.open = true;
      await elementUpdated(host);

      expect(host.open, 'open').to.be.false;
    });

    it('renders closed with both `open` and `disabled` in markup', async () => {
      const host = await fixture<DisabledPopupHost>(
        html`<${tag} open disabled></${tag}>`
      );

      expect(host.open, 'open').to.be.false;
      expect(host.hasAttribute('open'), 'open attribute').to.be.false;
    });

    it('closes when a fieldset disables it, and opens again when enabled', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <fieldset><${tag}></${tag}></fieldset>
        </form>`
      );
      const host = form.querySelector<DisabledPopupHost>(component.tagName)!;
      const fieldset = form.querySelector('fieldset')!;

      await host.show();
      fieldset.disabled = true;
      await elementUpdated(host);

      expect(host.open, 'open').to.be.false;

      fieldset.disabled = false;
      await elementUpdated(host);

      expect(await host.show(), 'show()').to.be.true;
      expect(host.open, 'open after show()').to.be.true;
    });
  });
}
