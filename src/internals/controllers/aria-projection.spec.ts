import { expect, fixture, html } from '@open-wc/testing';
import { render } from 'lit';
import {
  type ARIABindings,
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
});
