import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CalendarDay } from '../calendar/model.js';
import { type DateRangeDescriptor, DateRangeType } from '../calendar/types.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  simulateClick,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '../common/validity-helpers.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcDateRangePickerComponent, {
  type DateRangeValue,
} from './date-range-picker.js';
import { checkSelectedRange, getIcon } from './date-range-picker.utils.spec.js';

describe('Date Range Picker Single Input - Form integration', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let input: IgcInputComponent;
  let startKey = '';
  let endKey = '';

  const today = CalendarDay.today;
  const tomorrow = today.add('day', 1);

  const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
    html`<igc-date-range-picker name="rangePicker"></igc-date-range-picker>`
  );

  let value: DateRangeValue;

  beforeEach(async () => {
    await spec.setup(IgcDateRangePickerComponent.tagName);
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
    );
    startKey = `${spec.element.name}-start`;
    endKey = `${spec.element.name}-end`;
    value = { start: today.native, end: tomorrow.native };
  });

  describe('Form associated', () => {
    it('should be form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('should not participate in form submission if the value is empty/invalid', () => {
      value = { start: null, end: null };
      spec.setProperties({ value });
      spec.assertSubmitHasKeyValue('rangePicker', null);
    });

    it('should participate in form submission if there is a value and the value adheres to the validation constraints', () => {
      spec.setProperties({ value });
      spec.assertSubmitHasKeyValue('rangePicker', null);
    });

    it('is correctly reset on form reset', async () => {
      const initial = spec.element.value;

      spec.setProperties({ value });
      await elementUpdated(spec.element);

      input = picker.renderRoot.querySelector(
        IgcInputComponent.tagName
      ) as IgcInputComponent;

      checkSelectedRange(spec.element, value, false);

      spec.reset();
      await elementUpdated(spec.element);

      expect(spec.element.value).to.deep.equal(initial);
      expect(input.value).to.equal('');
    });

    it('should not be in invalid state on reset for a required control which previously had value', () => {
      spec.setProperties({ value: value });
      spec.setProperties({ required: true });

      spec.assertSubmitPasses();
      const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
      expect(input.invalid).to.be.false;

      spec.setProperties({ value: null });

      spec.reset();
      expect(input.invalid).to.be.false;
    });

    it('should not be in invalid state on reset for a required control with no value', async () => {
      spec.setProperties({ value: null });
      spec.setProperties({ required: true });

      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.true;

      spec.reset();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should reset to the new default value after setAttribute() call', async () => {
      const date1 = today.add('day', -2);
      const date2 = today.add('day', 2);
      const newValue = { start: date1.native, end: date2.native };
      spec.setAttributes({ value: JSON.stringify(newValue) });
      spec.setProperties({ value: { start: null, end: null } });
      await elementUpdated(spec.element);

      input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      ) as IgcInputComponent;

      expect(input.value).to.equal('');

      spec.reset();
      await elementUpdated(spec.element);

      spec.assertSubmitHasKeyValue(startKey, newValue.start?.toISOString());
      spec.assertSubmitHasKeyValue(endKey, newValue.end?.toISOString());
      checkSelectedRange(spec.element, newValue, false);
    });

    it('should reflect disabled ancestor state (fieldset/form)', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('should enforce required constraint', async () => {
      spec.setProperties({ value: null });
      spec.setProperties({ required: true });

      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.true;

      spec.setProperties({ value });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should enforce min value constraint', async () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1) });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.false;

      // Invalid min constraint for both values
      spec.setProperties({
        value: { start: new Date(2022, 0, 1), end: new Date(2022, 0, 1) },
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Invalid min constraint for start value
      spec.setProperties({
        value: { start: new Date(2022, 0, 1), end: new Date(2026, 0, 2) },
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Invalid min constraint for end value
      spec.setProperties({
        value: { start: new Date(2026, 0, 2), end: new Date(2022, 0, 2) },
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Valid value
      spec.setProperties({
        value: { start: new Date(2026, 0, 2), end: new Date(2026, 0, 3) },
      });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should enforce max value constraint', async () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.false;

      // Invalid max constraint for both values
      spec.setProperties({ value });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Invalid max constraint for start value
      spec.setProperties({
        value: { start: today.native, end: new Date(2019, 0, 2) },
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Invalid max constraint for end value
      spec.setProperties({
        value: { start: new Date(2019, 0, 2), end: today.native },
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Valid value
      spec.setProperties({
        value: { start: new Date(2019, 0, 2), end: new Date(2019, 0, 3) },
      });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should enforce min value constraint with string property', async () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.false;

      // Invalid min constraint
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2022, 0, 1),
          end: new Date(2022, 0, 1),
        }),
      });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Valid value
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2026, 0, 2),
          end: new Date(2026, 0, 3),
        }),
      });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should enforce max value constraint with string property', async () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.false;

      // Invalid min constraint
      spec.setProperties({ value: JSON.stringify(value) });
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // Valid value
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2019, 0, 2),
          end: new Date(2019, 0, 3),
        }),
      });
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('should invalidate the component if a disabled date is typed in the input', async () => {
      const minDate = new Date(2025, 1, 1);
      const maxDate = new Date(2025, 1, 28);

      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      ValidityHelpers.setTouchedState(spec.element);

      // both values within disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 1, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.true;

      // start and end values are valid, but wrap the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 2, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // start within the disabled range, end is valid
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 2, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // end within the disabled range, start is valid
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 1, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;

      // single selected date outside the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 0, 20) },
      });
      expect(spec.element.invalid).to.be.false;
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;

      // single selected date in the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 1, 20) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.true;
    });

    it('should enforce custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();
      await elementUpdated(spec.element);
      const input = spec.element.renderRoot.querySelector(
        IgcInputComponent.tagName
      )!;
      expect(input.invalid).to.be.true;

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
      await elementUpdated(spec.element);
      expect(input.invalid).to.be.false;
    });

    it('synchronous form validation', () => {
      spec.setProperties({ required: true }, false);

      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      spec.setProperties({ value }, false);

      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('Initial validation', () => {
    const toggleIcon = 'today';

    it('should not enter in invalid state when clicking the calendar toggle part', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker required></igc-date-range-picker>`
      );
      const input = picker.renderRoot.querySelector(
        IgcInputComponent.tagName
      ) as IgcInputComponent;

      expect(picker.invalid).to.be.false;
      expect(input.invalid).to.be.false;

      simulateClick(getIcon(picker, toggleIcon));
      await elementUpdated(picker);

      expect(picker.invalid).to.be.false;
      expect(input.invalid).to.be.false;
    });
  });

  describe('defaultValue', () => {
    const value: DateRangeValue | null = {
      start: today.native,
      end: tomorrow.native,
    };
    let startKey = '';
    let endKey = '';

    const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(html`
      <igc-date-range-picker
        name="rangePicker"
        .defaultValue=${value}
      ></igc-date-range-picker>
    `);

    beforeEach(async () => {
      await spec.setup(IgcDateRangePickerComponent.tagName);
      startKey = `${spec.element.name}-start`;
      endKey = `${spec.element.name}-end`;
    });

    it('correct initial state', () => {
      spec.assertIsPristine();
      checkSelectedRange(spec.element, value, false);
    });

    it('is correctly submitted', () => {
      spec.assertSubmitHasKeyValue(startKey, value.start?.toISOString());
      spec.assertSubmitHasKeyValue(endKey, value.end?.toISOString());
    });

    it('is correctly reset', async () => {
      const date1 = today.add('day', -2);
      const date2 = today.add('day', 2);
      spec.setProperties({ value: { start: date1.native, end: date2.native } });
      await elementUpdated(spec.element);

      spec.reset();
      await elementUpdated(spec.element);

      checkSelectedRange(spec.element, value, false);
    });
  });
  describe('Validation message slots', () => {
    it('', () => {
      const now = CalendarDay.today;
      const tomorrow = now.add('day', 1);
      const yesterday = now.add('day', -1);

      const testParameters: ValidationContainerTestsParams<IgcDateRangePickerComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          {
            slots: ['rangeOverflow'],
            props: {
              value: { start: now.native, end: tomorrow.native },
              max: yesterday.native,
            }, // range-overflow slot
          },
          {
            slots: ['rangeUnderflow'],
            props: {
              value: { start: yesterday.native, end: now.native },
              min: tomorrow.native,
            }, // range-underflow slot
          },
          {
            slots: ['badInput'],
            props: {
              value: { start: yesterday.native, end: tomorrow.native },
              disabledDates: [
                {
                  type: DateRangeType.Between,
                  dateRange: [yesterday.native, tomorrow.native], // bad-input slot
                },
              ],
            },
          },
          { slots: ['customError'] }, // custom-error slot
          { slots: ['invalid'], props: { required: true } }, // invalid slot
        ];

      runValidationContainerTests(IgcDateRangePickerComponent, testParameters);
    });
  });
});
