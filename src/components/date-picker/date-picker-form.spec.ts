import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CalendarDay, toCalendarDay } from '../calendar/model.js';
import { type DateRangeDescriptor, DateRangeType } from '../calendar/types.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { equal } from '../common/util.js';
import {
  createFormAssociatedTestBed,
  simulatePointerDown,
} from '../common/utils.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '../common/validity-helpers.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDatePickerComponent from './date-picker.js';

describe('igc-datepicker form integration', () => {
  before(() => defineComponents(IgcDatePickerComponent));

  function checkDatesEqual(a: CalendarDay | Date, b: CalendarDay | Date) {
    expect(equal(toCalendarDay(a), toCalendarDay(b))).to.be.true;
  }

  describe('Initial validation', () => {
    it('should not enter in invalid state when clicking the calendar toggle part', async () => {
      const picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker required></igc-date-picker>`
      );
      const dateTimeInput = picker.renderRoot.querySelector(
        IgcDateTimeInputComponent.tagName
      )!;
      const icon = picker.renderRoot.querySelector('[name="today"]')!;

      expect(picker.invalid).to.be.false;
      expect(dateTimeInput.invalid).to.be.false;

      simulatePointerDown(icon);
      await elementUpdated(picker);

      expect(picker.invalid).to.be.false;
      expect(dateTimeInput.invalid).to.be.false;
    });
  });

  describe('Form integration', () => {
    const today = CalendarDay.today;
    const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(
      html`<igc-date-picker name="datePicker"></igc-date-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDatePickerComponent.tagName);
    });

    it('should be form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('should not participate in form submission if the value is empty/invalid', () => {
      spec.assertSubmitHasValue(null);
    });

    it('should participate in form submission if there is a value and the value adheres to the validation constraints', () => {
      spec.setProperties({ value: today.native });
      spec.assertSubmitHasValue(spec.element.value?.toISOString());
    });

    it('should reset to its default value state on form reset', () => {
      spec.setProperties({ value: today.native });
      spec.reset();

      expect(spec.element.value).to.be.null;
    });

    it('should reset to the new default value after setAttribute() call', () => {
      spec.setAttributes({ value: today.native.toISOString() });
      spec.setProperties({ value: today.add('day', 180).native });
      spec.reset();

      checkDatesEqual(spec.element.value!, today);
      spec.assertSubmitHasValue(today.native.toISOString());
    });

    it('should reflect disabled ancestor state (fieldset/form)', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('should enforce required constraint', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();

      spec.setProperties({ value: today.native });
      spec.assertSubmitPasses();
    });

    it('should enforce min value constraint', () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1) });
      spec.assertSubmitPasses();

      // Invalid min constraint
      spec.setProperties({ value: new Date(2022, 0, 1) });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2026, 0, 2) });
      spec.assertSubmitPasses();
    });

    it('should enforce max value constraint', () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();

      // Invalid max constraint
      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();
    });

    it('should enforce min value constraint with string property', () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      // Invalid min constraint
      spec.setProperties({ value: new Date(2022, 0, 1).toISOString() });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2026, 0, 2).toISOString() });
      spec.assertSubmitPasses();
    });

    it('should enforce max value constraint with string property', () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      // Invalid max constraint
      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();
    });

    it('should invalidate the component if a disabled date is typed in the input', () => {
      const minDate = new Date(2024, 1, 1);
      const maxDate = new Date(2024, 1, 28);

      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      ValidityHelpers.setTouchedState(spec.element);
      spec.setProperties({ disabledDates, value: new Date(2024, 1, 26) });

      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
    });

    it('should enforce custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });

    it('synchronous form validation', () => {
      spec.setProperties({ required: true }, false);

      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      spec.setProperties({ value: today.native }, false);

      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('defaultValue', () => {
    const today = CalendarDay.today;

    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(html`
        <igc-date-picker
          name="datePicker"
          .defaultValue=${today.native}
        ></igc-date-picker>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDatePickerComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        checkDatesEqual(spec.element.value!, today);
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(today.native.toISOString());
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: today.add('day', 1).native });
        spec.reset();

        checkDatesEqual(spec.element.value!, today);
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(html`
        <igc-date-picker name="datePicker"></igc-date-picker>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDatePickerComponent.tagName);
      });

      it('fails required validation', () => {
        spec.setProperties({ required: true });
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation when updating defaultValue', () => {
        spec.setProperties({ required: true, defaultValue: today.native });
        spec.assertIsPristine();

        spec.assertSubmitPasses();
      });

      it('fails min validation', () => {
        spec.setProperties({
          min: today.native,
          defaultValue: today.add('day', -1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes min validation', () => {
        spec.setProperties({ min: today.native, defaultValue: today.native });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.add('day', 1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.native,
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails for range constraints', () => {
        const minDate = new Date(2024, 1, 1);
        const maxDate = new Date(2024, 1, 28);

        const disabledDates: DateRangeDescriptor[] = [
          {
            type: DateRangeType.Between,
            dateRange: [minDate, maxDate],
          },
        ];

        spec.setProperties({
          disabledDates,
          defaultValue: new Date(2024, 1, 28),
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes for range constraints', () => {
        const minDate = new Date(2024, 1, 1);
        const maxDate = new Date(2024, 1, 28);

        const disabledDates: DateRangeDescriptor[] = [
          {
            type: DateRangeType.Between,
            dateRange: [minDate, maxDate],
          },
        ];

        spec.setProperties({
          disabledDates,
          defaultValue: new Date(2024, 1, 29),
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });
    });
  });

  describe('Validation message slots', () => {
    it('', () => {
      const now = CalendarDay.today;
      const tomorrow = now.add('day', 1);
      const yesterday = now.add('day', -1);

      const testParameters: ValidationContainerTestsParams<IgcDatePickerComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          {
            slots: ['rangeOverflow'],
            props: { value: now.native, max: yesterday.native }, // range-overflow slot
          },
          {
            slots: ['rangeUnderflow'],
            props: { value: now.native, min: tomorrow.native }, // range-underflow slot
          },
          {
            slots: ['badInput'],
            props: {
              value: now.native,
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

      runValidationContainerTests(IgcDatePickerComponent, testParameters);
    });
  });
});
