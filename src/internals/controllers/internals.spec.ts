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
  describe('reactive ARIA', () => {
    let tag: string;
    let tagName: ReturnType<typeof unsafeStatic>;

    type Fixture = LitElement & {
      selected: boolean;
      internals: ElementInternalsController;
    };

    before(() => {
      tag = defineCE(
        class extends LitElement {
          public static override properties = { selected: { type: Boolean } };
          declare public selected: boolean;

          public internals = addInternalsController(this, {
            reflectRole: true,
            aria: () => ({
              role: this.selected ? 'option' : 'listitem',
              ariaSelected: `${this.selected}`,
            }),
          });

          constructor() {
            super();
            this.selected = false;
          }
        }
      );
      tagName = unsafeStatic(tag);
    });

    it('derives internals ARIA on the first update', async () => {
      const instance = await fixture<Fixture>(html`<${tagName}></${tagName}>`);

      expect(instance.internals.getARIA('ariaSelected')).to.equal('false');
      expect(instance.internals.getARIA('role')).to.equal('listitem');
    });

    it('recomputes the derived ARIA when host state changes', async () => {
      const instance = await fixture<Fixture>(html`<${tagName}></${tagName}>`);

      instance.selected = true;
      await instance.updateComplete;

      expect(instance.internals.getARIA('ariaSelected')).to.equal('true');
      expect(instance.internals.getARIA('role')).to.equal('option');
    });

    it('a derived role participates in role reflection', async () => {
      const instance = await fixture<Fixture>(html`<${tagName}></${tagName}>`);

      expect(instance.getAttribute('role')).to.equal('listitem');

      instance.selected = true;
      await instance.updateComplete;

      expect(instance.getAttribute('role')).to.equal('option');
    });
  });

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

    it('removes its own attribute when the internals role is cleared', async () => {
      const instance = await fixture<
        LitElement & { internals: ElementInternalsController }
      >(html`<${tagName}></${tagName}>`);

      instance.internals.setARIA({ role: null });

      expect(instance).to.not.have.attribute('role');

      // The controller owns the attribute again once the role comes back.
      instance.internals.setARIA({ role: 'option' });

      expect(instance.getAttribute('role')).to.equal('option');
    });

    it('keeps an author override when the internals role is cleared', async () => {
      const instance = await fixture<
        LitElement & { internals: ElementInternalsController }
      >(html`<${tagName}></${tagName}>`);

      instance.setAttribute('role', 'presentation');
      instance.internals.setARIA({ role: null });

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
