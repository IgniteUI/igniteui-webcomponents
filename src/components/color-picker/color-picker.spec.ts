import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { createFormAssociatedTestBed } from '../common/utils.spec.js';
import type IgcInputComponent from '../input/input.js';
import IgcColorPickerComponent from './color-picker.js';

async function createDefaultColorPicker() {
  return await fixture<IgcColorPickerComponent>(
    html`<igc-color-picker label="Choose a color"></igc-color-picker>`
  );
}

function getAnchor(picker: IgcColorPickerComponent): HTMLElement {
  return picker.renderRoot.querySelector('[part~="anchor"]')!;
}

function isAnchorEmpty(picker: IgcColorPickerComponent): boolean {
  return getAnchor(picker).part.contains('empty');
}

function getColorInput(picker: IgcColorPickerComponent): IgcInputComponent {
  return picker.renderRoot.querySelector<IgcInputComponent>('#color-input')!;
}

function commitColorInput(input: IgcInputComponent, value: string): void {
  input.value = value;
  input.dispatchEvent(
    new CustomEvent('igcChange', {
      detail: value,
      bubbles: true,
      composed: true,
    })
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

  describe('Empty value', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
    });

    it('has an empty value by default', () => {
      expect(picker.value).to.equal('');
    });

    it('renders a checkered anchor when empty', async () => {
      expect(isAnchorEmpty(picker)).to.be.true;

      picker.value = '#ff0000';
      await elementUpdated(picker);
      expect(isAnchorEmpty(picker)).to.be.false;
    });

    it('reverts to an empty value for null/undefined/empty', async () => {
      for (const value of ['', null, undefined]) {
        picker.value = '#ff0000';
        await elementUpdated(picker);

        picker.value = value as unknown as string;
        await elementUpdated(picker);

        expect(picker.value).to.equal('');
        expect(isAnchorEmpty(picker)).to.be.true;
      }
    });
  });

  describe('Color value input', () => {
    beforeEach(async () => {
      picker = await createDefaultColorPicker();
      picker.value = '#ff0000';
      picker.open = true;
      await elementUpdated(picker);
    });

    it('commits a valid color', async () => {
      commitColorInput(getColorInput(picker), '#00ff00');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#00ff00');
    });

    it('reverts the input on an invalid color', async () => {
      const input = getColorInput(picker);
      commitColorInput(input, 'not-a-color');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
      expect(input.value).to.equal('#ff0000');
    });

    it('reverts the input on an empty color', async () => {
      const input = getColorInput(picker);
      commitColorInput(input, '');
      await elementUpdated(picker);

      expect(picker.value).to.equal('#ff0000');
      expect(input.value).to.equal('#ff0000');
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
      expect(spec.element.value).to.equal('');
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
