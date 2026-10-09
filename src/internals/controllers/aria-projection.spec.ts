import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, render } from 'lit';
import sinon from 'sinon';
import {
  type ARIABindings,
  addAriaProjector,
  addAriaTarget,
  ariaBindings,
  resolveNaming,
} from './aria-projection.js';

describe('ARIA projection', () => {
  describe('ariaBindings', () => {
    let container: HTMLElement;

    function renderInput(bindings: ARIABindings): HTMLInputElement {
      render(
        html`<span id="own">Own</span
          ><input role="combobox" ${ariaBindings(bindings)} />`,
        container
      );
      return container.querySelector('input')!;
    }

    beforeEach(async () => {
      container = await fixture<HTMLElement>(html`<div></div>`);
    });

    it('keeps a same-root IDREF across renders', () => {
      renderInput({ describedByRef: 'own', labelledByRef: 'own' });
      const input = renderInput({
        describedByRef: 'own',
        labelledByRef: 'own',
      });

      expect(input.getAttribute('aria-describedby')).to.equal('own');
      expect(input.getAttribute('aria-labelledby')).to.equal('own');
    });

    it('switches between an IDREF and element references', async () => {
      const external = await fixture<HTMLElement>(
        html`<label>External</label>`
      );

      renderInput({ labelledByRef: 'own' });
      let input = renderInput({ labelledBy: [external] });
      expect(input.ariaLabelledByElements).to.eql([external]);

      input = renderInput({ labelledByRef: 'own' });
      expect(input.getAttribute('aria-labelledby')).to.equal('own');

      input = renderInput({});
      expect(input.hasAttribute('aria-labelledby')).to.be.false;
    });

    it('leaves the attributes that its bindings never had', () => {
      renderInput({});
      const input = renderInput({ label: 'Name' });

      expect(input.getAttribute('role')).to.equal('combobox');
      expect(input.getAttribute('aria-label')).to.equal('Name');
    });
  });

  describe('resolveNaming', () => {
    let host: HTMLElement;
    let referenced: HTMLElement;

    beforeEach(async () => {
      const root = await fixture<HTMLElement>(
        html`<div>
          <span id="referenced">Referenced</span>
          <div id="host" aria-label="Host label"></div>
        </div>`
      );

      host = root.querySelector('#host')!;
      referenced = root.querySelector('#referenced')!;
    });

    it('prefers the host `aria-labelledby`', () => {
      host.setAttribute('aria-labelledby', 'referenced');

      expect(resolveNaming(host, true)).to.eql({ labelledBy: [referenced] });
    });

    it('keeps the host `aria-label` off while an own label names the control', () => {
      expect(resolveNaming(host, true, 'Fallback')).to.eql({
        labelledBy: null,
        label: undefined,
      });
    });

    it('falls back to the host `aria-label`, then to the fallback', () => {
      expect(resolveNaming(host, false, 'Fallback').label).to.equal(
        'Host label'
      );

      host.removeAttribute('aria-label');
      expect(resolveNaming(host, false, 'Fallback').label).to.equal('Fallback');
    });
  });

  describe('ariaBindings part type', () => {
    it('throws outside an element expression', async () => {
      const container = await fixture<HTMLElement>(html`<div></div>`);

      expect(() =>
        render(html`<input aria-label=${ariaBindings({})} />`, container)
      ).to.throw('`ariaBindings()` can only be used as an element expression.');
    });
  });

  describe('Projector with a late target definition', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('projects once the definition of the target resolves', async () => {
      const targetTag = `late-aria-target-${Math.random().toString(36).slice(2)}`;
      const target = unsafeStatic(targetTag);
      const whenDefined = sinon.spy(customElements, 'whenDefined');
      let hasPopup: string | undefined = 'listbox';

      const hostTag = unsafeStatic(
        defineCE(
          class extends LitElement {
            constructor() {
              super();
              addAriaProjector(this, {
                target: () => this.renderRoot.querySelector(targetTag),
                state: () => ({
                  role: 'combobox',
                  hasPopup,
                  expanded: 'false',
                }),
                naming: false,
              });
            }

            protected override render() {
              return html`<${target}></${target}>`;
            }
          }
        )
      );

      const host = await fixture<LitElement>(html`<${hostTag}></${hostTag}>`);

      // A second update before the definition schedules no second retry.
      host.requestUpdate();
      await elementUpdated(host);

      expect(whenDefined.withArgs(targetTag).callCount).to.equal(1);

      customElements.define(
        targetTag,
        class extends LitElement {
          private readonly _aria = addAriaTarget(this, () => null);

          protected override render() {
            return html`<input
              ${ariaBindings(this._aria.resolveBindings())}
            />`;
          }
        }
      );

      await customElements.whenDefined(targetTag);
      await elementUpdated(host);
      const element = host.renderRoot.querySelector(targetTag) as LitElement;
      await elementUpdated(element);
      await nextFrame();

      const input = element.renderRoot.querySelector('input')!;

      expect(input.getAttribute('role')).to.equal('combobox');
      expect(input.getAttribute('aria-haspopup')).to.equal('listbox');
      expect(input.getAttribute('aria-expanded')).to.equal('false');
      expect(element.dataset.role).to.equal('combobox');
      expect(element.dataset.haspopup).to.equal('listbox');

      hasPopup = undefined;
      host.requestUpdate();
      await elementUpdated(host);
      await elementUpdated(element);

      expect(input.hasAttribute('aria-haspopup')).to.be.false;
      expect(element.hasAttribute('data-haspopup')).to.be.false;
      expect(element.dataset.role).to.equal('combobox');
    });
  });
});
