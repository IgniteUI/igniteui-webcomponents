import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import {
  addInternalsController,
  type ElementInternalsController,
} from './internals.js';

describe('ElementInternals controller', () => {
  describe('reflectRole', () => {
    let tag: string;
    let tagName: ReturnType<typeof unsafeStatic>;

    before(() => {
      tag = defineCE(
        class extends LitElement {
          public internals = addInternalsController(this, {
            initialARIA: { role: 'option' },
            reflectRole: true,
          });
        }
      );
      tagName = unsafeStatic(tag);
    });

    it('mirrors the internals role as a content attribute on connect', async () => {
      const instance = await fixture<LitElement>(
        html`<${tagName}></${tagName}>`
      );

      expect(instance.getAttribute('role')).to.equal('option');
    });

    it('yields to an author-supplied role attribute present before connect', async () => {
      const instance = await fixture<LitElement>(
        html`<${tagName} role="presentation"></${tagName}>`
      );

      expect(instance.getAttribute('role')).to.equal('presentation');
    });

    it('updates its own attribute when the internals role changes', async () => {
      const instance = await fixture<
        LitElement & { internals: ElementInternalsController }
      >(html`<${tagName}></${tagName}>`);

      instance.internals.setARIA({ role: 'listitem' });

      expect(instance.getAttribute('role')).to.equal('listitem');
    });

    it('keeps an author override through an internals role change', async () => {
      const instance = await fixture<
        LitElement & { internals: ElementInternalsController }
      >(html`<${tagName}></${tagName}>`);

      instance.setAttribute('role', 'presentation');
      instance.internals.setARIA({ role: 'listitem' });

      expect(instance.getAttribute('role')).to.equal('presentation');
    });

    it('keeps an author override through a DOM reconnection', async () => {
      const container = await fixture<HTMLDivElement>(
        html`<div><${tagName}></${tagName}></div>`
      );
      const instance = container.querySelector<LitElement>(tag)!;

      expect(instance.getAttribute('role')).to.equal('option');

      instance.setAttribute('role', 'presentation');

      // Re-parenting an upgraded element re-runs `hostConnected` and with it
      // the role reflection.
      instance.remove();
      container.append(instance);

      expect(instance.getAttribute('role')).to.equal('presentation');
    });

    it('restores its attribute after the author removes it, on the next reflection', async () => {
      const instance = await fixture<
        LitElement & { internals: ElementInternalsController }
      >(html`<${tagName}></${tagName}>`);

      instance.removeAttribute('role');
      instance.internals.setARIA({ role: 'option' });

      expect(instance.getAttribute('role')).to.equal('option');
    });
  });
});
