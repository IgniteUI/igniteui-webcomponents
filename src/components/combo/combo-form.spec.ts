import { elementUpdated, expect, html } from '@open-wc/testing';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { type City, cities } from '#internals/testing/combo.spec.js';
import { createFormAssociatedTestBed } from '#internals/testing/form-testbed.spec.js';
import {
  axeReflectedRelationsOptions,
  suppressResizeObserverLoopError,
} from '#internals/testing/helpers.spec.js';
import { simulateBlur } from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '#internals/testing/validity-helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import type IgcInputComponent from '../input/input.js';
import IgcComboComponent from './combo.js';

describe('Combo', () => {
  before(() => {
    defineComponents(IgcComboComponent);
    suppressResizeObserverLoopError();
  });

  describe('Form integration', () => {
    const spec = createFormAssociatedTestBed<IgcComboComponent<City>>(
      html`<igc-combo
        name="combo"
        .data=${cities}
        value-key="id"
        display-key="name"
      ></igc-combo>`
    );

    beforeEach(async () => {
      await spec.setup(IgcComboComponent.tagName);
      spec.setAttributes({ value: JSON.stringify(['BG01', 'BG02']) });
    });

    it('is form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if no value', () => {
      spec.setProperties({ value: [] });
      spec.assertSubmitHasValue(null);
    });

    it('is associated on submit with value-key (single)', () => {
      spec.setProperties({ singleSelect: true });
      spec.setProperties({ value: ['BG01', 'BG02'] });
      spec.assertSubmitHasValue('BG01');
    });

    it('is associated on submit with value-key (multiple)', () => {
      spec.assertSubmitHasValue('BG01');
      spec.assertSubmitHasValues(['BG01', 'BG02']);
    });

    it('is associated on submit without value-key (single)', () => {
      const [first, second, _] = cities;

      spec.setProperties({ valueKey: undefined, singleSelect: true });
      spec.element.select([first, second]);

      expect(spec.formData.getAll(spec.element.name)).lengthOf(1);
      spec.assertSubmitPasses();
    });

    it('is associated on submit without value-key (multiple)', () => {
      const [first, second, _] = cities;

      spec.setProperties({ valueKey: undefined });
      spec.element.select([first, second]);

      expect(spec.formData.getAll(spec.element.name)).lengthOf(2);
      spec.assertSubmitPasses();
    });

    it('is correctly reset on form reset (multiple)', () => {
      const initial = spec.element.value;

      spec.setAttributes({ value: JSON.stringify(['BG01', 'BG02']) });
      spec.setProperties({ value: [] });

      spec.reset();
      expect(spec.element.value).to.eql(initial);
    });

    it('is correctly reset on form reset (single)', () => {
      // Initial value is a multiple array. The combo defaults to the first item
      const initial = [firstOf(spec.element.value)];

      spec.setProperties({ singleSelect: true });
      spec.setProperties({ value: ['US01'] });

      expect(spec.element.value).to.eql(['US01']);

      spec.reset();
      expect(spec.element.value).to.eql(initial);
    });

    it('should reset to the new default value after setAttribute() call (multiple)', () => {
      spec.setAttributes({ value: JSON.stringify(['US01', 'US02']) });
      spec.setProperties({ value: [] });

      spec.reset();
      expect(spec.element.value).to.eql(['US01', 'US02']);
      spec.assertSubmitHasValues(spec.element.value);
    });

    it('should reset to the new default value after setAttribute() call (single)', () => {
      spec.setProperties({ singleSelect: true });
      spec.setAttributes({ value: JSON.stringify(['US01']) });
      spec.setProperties({ value: [] });

      spec.reset();

      expect(spec.element.value).to.eql(['US01']);
      spec.assertSubmitHasValue('US01');
    });

    it('should handle invalid JSON in value attribute gracefully', () => {
      const defaultValue = spec.element.defaultValue;

      spec.setAttributes({ value: 'invalid' });
      expect(spec.element.value).to.be.empty;
      expect(spec.element.defaultValue).to.equal(defaultValue);
    });

    it('should handle empty string in value attribute gracefully', () => {
      spec.setAttributes({ value: '' });
      expect(spec.element.value).to.be.empty;
      expect(spec.element.defaultValue).to.be.empty;
    });

    it('should handle null in value attribute gracefully', () => {
      spec.setAttributes({ value: null as any });
      expect(spec.element.value).to.be.empty;
      expect(spec.element.defaultValue).to.be.empty;
    });

    it('reflects disabled ancestor state', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', () => {
      spec.setProperties({ value: [], required: true });
      spec.assertSubmitFails();

      spec.setProperties({ value: ['BG01', 'BG02'] });
      spec.assertSubmitPasses();
    });

    it('fulfils custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });

    it('clears the invalid styles of the single-select input on form reset', async () => {
      spec.setAttributes({ value: '[]' });
      spec.setProperties({ singleSelect: true, required: true });
      await elementUpdated(spec.element);

      const target =
        spec.element.renderRoot.querySelector<IgcInputComponent>('#target')!;

      simulateBlur(target.renderRoot.querySelector('input')!);
      await elementUpdated(spec.element);
      ValidityHelpers.hasInvalidStyles(target).to.be.true;

      spec.reset();
      await elementUpdated(spec.element);

      ValidityHelpers.hasInvalidStyles(spec.element).to.be.false;
      ValidityHelpers.hasInvalidStyles(target).to.be.false;
    });

    it('keeps the text of the single-select input on form reset', async () => {
      spec.setProperties({ singleSelect: true });
      await elementUpdated(spec.element);

      const target =
        spec.element.renderRoot.querySelector<IgcInputComponent>('#target')!;
      expect(target.value).to.equal('Sofia');

      spec.reset();
      await elementUpdated(spec.element);

      expect(target.value).to.equal('Sofia');
    });

    it('is accessible while a submit fails', async () => {
      spec.setProperties({ label: 'Cities', required: true, value: [] });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(spec.element.invalid).to.be.true;

      await expect(spec.element).shadowDom.to.be.accessible(
        axeReflectedRelationsOptions
      );
      await expect(spec.element).to.be.accessible(axeReflectedRelationsOptions);
    });
  });

  describe('defaultValue', () => {
    const value = ['BG01', 'BG02'];

    describe('Form integration (single)', () => {
      const spec = createFormAssociatedTestBed<IgcComboComponent<City>>(html`
        <igc-combo
          name="combo"
          .data=${cities}
          .defaultValue=${value}
          single-select
          value-key="id"
          display-key="name"
        ></igc-combo>
      `);

      beforeEach(async () => {
        await spec.setup(IgcComboComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.eql([firstOf(value)]);
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(firstOf(value));
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: [] });
        spec.reset();

        expect(spec.element.value).to.eql([firstOf(value)]);
      });
    });

    describe('Form integration (multiple)', () => {
      const spec = createFormAssociatedTestBed<IgcComboComponent<City>>(html`
        <igc-combo
          name="combo"
          .data=${cities}
          .defaultValue=${value}
          value-key="id"
          display-key="name"
        ></igc-combo>
      `);

      beforeEach(async () => {
        await spec.setup(IgcComboComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        expect(spec.element.value).to.eql(value);
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValues(value);
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: [] });
        spec.reset();

        expect(spec.element.value).to.eql(value);
      });
    });

    describe('Form integration with delayed data', () => {
      const spec = createFormAssociatedTestBed<IgcComboComponent<City>>(html`
        <igc-combo name="combo" value-key="id" display-key="name"></igc-combo>
      `);

      function initDataDefaultValue(single = false) {
        spec.element.singleSelect = single;
        // assign data after init to simulate async data
        spec.element.data = cities;
        spec.element.defaultValue = value;
      }

      beforeEach(async () => {
        await spec.setup(IgcComboComponent.tagName);
      });

      it('correct initial state (single)', () => {
        initDataDefaultValue(true);
        spec.assertIsPristine();
        expect(spec.element.value).to.eql([firstOf(value)]);
      });

      it('correct initial state (multiple)', () => {
        initDataDefaultValue();
        spec.assertIsPristine();
        expect(spec.element.value).to.eql(value);
      });

      it('is correctly submitted (single)', () => {
        initDataDefaultValue(true);
        spec.assertSubmitHasValue(firstOf(value));
      });

      it('is correctly submitted (multiple)', () => {
        initDataDefaultValue();
        spec.assertSubmitHasValues(value);
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcComboComponent<City>>(html`
        <igc-combo
          name="combo"
          .data=${cities}
          .defaultValue=${[]}
          required
          value-key="id"
          display-key="name"
        ></igc-combo>
      `);

      beforeEach(async () => {
        await spec.setup(IgcComboComponent.tagName);
      });

      it('fails required validation', () => {
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation', () => {
        spec.setProperties({ defaultValue: value });
        spec.assertIsPristine();

        spec.assertSubmitHasValues(value);
      });
    });
  });

  describe('Validation message slots', () => {
    it('', async () => {
      const testParameters: ValidationContainerTestsParams<IgcComboComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } },
          { slots: ['customError'] },
          { slots: ['invalid'], props: { required: true } },
        ];

      await runValidationContainerTests(IgcComboComponent, testParameters);
    });
  });
});
