import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { createFormAssociatedTestBed } from '../common/utils.spec.js';
import IgcColorPickerComponent from './color-picker.js';

async function createDefaultColorPicker() {
  return await fixture<IgcColorPickerComponent>(
    html`<igc-color-picker label="Choose a color"></igc-color-picker>`
  );
}

describe('Color picker', () => {
  before(() => defineComponents(IgcColorPickerComponent));

  let picker: IgcColorPickerComponent;

  describe('Default', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('is initialized', () => {
      expect(picker).to.exist;
    });

    it('is accessible (close state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('`toggle()`', async () => {
      await picker.toggle();
      expect(picker.open).to.be.true;

      await picker.toggle();
      expect(picker.open).to.be.false;
    });
  });

  describe('Form associated', () => {
    const spec = createFormAssociatedTestBed<IgcColorPickerComponent>(
      html`<igc-color-picker name="color-picker"></igc-color-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcColorPickerComponent.tagName);
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', () => {
      spec.setProperties({ value: '#bada55' });
      spec.assertSubmitHasValue('#bada55');
    });

    it('is correctly reset on form reset', () => {
      spec.setProperties({ value: '#bada55' });

      spec.reset();
      expect(spec.element.value).to.equal('#000000');
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });
  });
});
