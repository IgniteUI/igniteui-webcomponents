import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import PopperTestComponent from './test.component.spec.js';
import { IToggleOptions } from './utilities.js';

customElements.define('test-popper', PopperTestComponent);

describe('Toggle Directive', () => {
  let toggleDir: any;
  let popper: PopperTestComponent;
  let target: HTMLDivElement;

  describe('', () => {
    beforeEach(async () => {
      target = (await fixture(html`<div>Toggle</div>`)) as HTMLDivElement;
      popper = await fixture<PopperTestComponent>(
        html`<test-popper .target=${target}></test-popper>`
      );
      await elementUpdated(popper);
      toggleDir = popper.toggleDirective;
    });

    it('is created with the values specified.', () => {
      const values = toggleDir.values;
      expect(values.length).to.equal(3);
      expect(values[0]).to.be.instanceof(HTMLDivElement);
      expect(values[1]).to.equal(false);
      expect(values[2]).to.be.undefined;
    });

    it('successfully creates the popper element with default options.', () => {
      expect(popper).to.be.accessible;
      expect(
        popper.renderRoot.children[0].classList.contains('igc-toggle-hidden')
      ).to.be.true;
      const popperEl = popper.renderRoot.children[0];
      const attributes = popperEl.attributes;
      expect(attributes.getNamedItem('data-popper-placement')?.value).to.equal(
        'bottom-start'
      );
      expect(attributes.getNamedItem('style')?.value).to.contain(
        'position: absolute'
      );
    });
  });
  describe('', () => {
    beforeEach(async () => {
      target = (await fixture(html`<span>Toggle</span>`)) as HTMLDivElement;
      const open = true;
      const options: IToggleOptions = {
        placement: 'right-start',
        strategy: 'fixed',
        flip: false,
      };
      popper = await fixture<PopperTestComponent>(
        html`<test-popper
          .target=${target}
          .open=${open}
          .options=${options}
        ></test-popper>`
      );
      await elementUpdated(popper);
      toggleDir = popper.toggleDirective;
    });

    it('successfully creates & shows the popper element.', async () => {
      expect(
        popper.renderRoot.children[0].classList.contains('igc-toggle-hidden')
      ).to.be.false;
    });

    it('creates a popper with the passed options.', () => {
      expect(popper).to.be.accessible;
      const popperEl = popper.renderRoot.children[0];
      const attributes = popperEl.attributes;
      expect(attributes.getNamedItem('data-popper-placement')?.value).to.equal(
        'right-start'
      );
      expect(attributes.getNamedItem('style')?.value).to.contain(
        'position: fixed'
      );
    });
  });
});
