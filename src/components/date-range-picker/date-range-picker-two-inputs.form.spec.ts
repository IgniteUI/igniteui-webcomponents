import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CalendarDay } from '../calendar/model.js';
import { type DateRangeDescriptor, DateRangeType } from '../calendar/types.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  createFormAssociatedTestBed,
  runValidationContainerTests,
  simulateClick,
  simulateInput,
  type ValidationContainerTestsParams,
} from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import IgcDateRangePickerComponent, {
  type DateRangeValue,
} from './date-range-picker.js';
import {
  checkInputsInvalidState,
  checkSelectedRange,
  getIcon,
} from './date-range-picker.utils.spec.js';

describe('Date Range Picker Two Inputs - Form integration', () => {
  before(() =>
    defineComponents(IgcDateRangePickerComponent, IgcDateRangeInputComponent)
  );

  let picker: IgcDateRangePickerComponent;
  let dateTimeInputs: IgcDateTimeInputComponent[];

  const today = CalendarDay.today;
  const tomorrow = today.add('day', 1);
  const yesterday = today.add('day', -1);

  const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
    html`<igc-date-range-picker
      name="rangePicker"
      use-two-inputs
    ></igc-date-range-picker>`
  );

  let startKey = '';
  let endKey = '';
  let value: DateRangeValue;

  beforeEach(async () => {
    await spec.setup(IgcDateRangePickerComponent.tagName);
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker use-two-inputs></igc-date-range-picker>`
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
      spec.assertSubmitHasKeyValue(startKey, null);
      spec.assertSubmitHasKeyValue(endKey, null);
    });

    it('should participate in form submission if there is a value and the value adheres to the validation constraints', () => {
      spec.setProperties({ value });
      spec.assertSubmitHasKeyValue(startKey, value.start?.toISOString());
      spec.assertSubmitHasKeyValue(endKey, value.end?.toISOString());
    });

    it('is correctly reset on form reset', async () => {
      const initial = spec.element.value;

      spec.setProperties({ value });
      await elementUpdated(spec.element);

      dateTimeInputs = Array.from(
        picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
      );
      checkSelectedRange(spec.element, value);

      spec.reset();
      await elementUpdated(spec.element);

      expect(spec.element.value).to.deep.equal(initial);
      expect(dateTimeInputs[0].value).to.equal(null);
      expect(dateTimeInputs[1].value).to.equal(null);
    });

    it('should not be in invalid state on reset for a required control which previously had value', async () => {
      spec.setProperties({ value: value });
      spec.setProperties({ required: true });

      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      spec.setProperties({ value: null });

      spec.reset();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should not be in invalid state on reset for a required control with no value', async () => {
      spec.setProperties({ value: null });
      spec.setProperties({ required: true });

      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      spec.reset();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should reset to the new default value after setAttribute() call', async () => {
      const date1 = today.add('day', -2);
      const date2 = today.add('day', 2);
      const newValue = { start: date1.native, end: date2.native };
      spec.setAttributes({ value: JSON.stringify(newValue) });
      spec.setProperties({ value: { start: null, end: null } });
      await elementUpdated(spec.element);

      dateTimeInputs = Array.from(
        picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
      );
      expect(dateTimeInputs[0].value).to.equal(null);
      expect(dateTimeInputs[1].value).to.equal(null);

      spec.reset();
      await elementUpdated(spec.element);

      spec.assertSubmitHasKeyValue(startKey, newValue.start?.toISOString());
      spec.assertSubmitHasKeyValue(endKey, newValue.end?.toISOString());
      checkSelectedRange(spec.element, newValue);
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
      await checkInputsInvalidState(spec.element, true, true);

      spec.setProperties({ value });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should enforce min value constraint', async () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1) });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      // Invalid min constraint for both values
      spec.setProperties({
        value: { start: new Date(2022, 0, 1), end: new Date(2022, 0, 1) },
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Invalid min constraint for start value
      spec.setProperties({
        value: { start: new Date(2022, 0, 1), end: new Date(2026, 0, 2) },
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Invalid min constraint for end value
      spec.setProperties({
        value: { start: new Date(2026, 0, 2), end: new Date(2022, 0, 2) },
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Valid value
      spec.setProperties({
        value: { start: new Date(2026, 0, 2), end: new Date(2026, 0, 3) },
      });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should enforce max value constraint', async () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      // Invalid max constraint for both values
      spec.setProperties({ value });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Invalid max constraint for start value
      spec.setProperties({
        value: { start: today.native, end: new Date(2019, 0, 2) },
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Invalid max constraint for end value
      spec.setProperties({
        value: { start: new Date(2019, 0, 2), end: today.native },
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Valid value
      spec.setProperties({
        value: { start: new Date(2019, 0, 2), end: new Date(2019, 0, 3) },
      });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should enforce min value constraint with string property', async () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      // Invalid min constraint
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2022, 0, 1),
          end: new Date(2022, 0, 1),
        }),
      });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Valid value
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2026, 0, 2),
          end: new Date(2026, 0, 3),
        }),
      });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
    });

    it('should enforce max value constraint with string property', async () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      // Invalid min constraint
      spec.setProperties({ value: JSON.stringify(value) });
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // Valid value
      spec.setProperties({
        value: JSON.stringify({
          start: new Date(2019, 0, 2),
          end: new Date(2019, 0, 3),
        }),
      });
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
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

      // both values within disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 1, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // start and end values are valid, but wrap the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 2, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // start within the disabled range, end is valid
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 2, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // end within the disabled range, start is valid
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 1, 26) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      // single selected date outside the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 0, 20), end: new Date(2025, 0, 20) },
      });
      expect(spec.element.invalid).to.be.false;
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);

      // single selected date in the disabled range
      spec.setProperties({
        disabledDates,
        value: { start: new Date(2025, 1, 20), end: new Date(2025, 1, 20) },
      });
      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);
    });

    it('should enforce custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();
      await checkInputsInvalidState(spec.element, true, true);

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
      await checkInputsInvalidState(spec.element, false, false);
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

    it('should not enter in invalid state when clicking the calendar toggle part - two inputs', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          required
          use-two-inputs
        ></igc-date-range-picker>`
      );

      expect(picker.invalid).to.be.false;
      await checkInputsInvalidState(picker, false, false);

      simulateClick(getIcon(picker, toggleIcon));
      await elementUpdated(picker);

      expect(picker.invalid).to.be.false;
      await checkInputsInvalidState(picker, false, false);
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
        use-two-inputs
      ></igc-date-range-picker>
    `);

    beforeEach(async () => {
      await spec.setup(IgcDateRangePickerComponent.tagName);
      startKey = `${spec.element.name}-start`;
      endKey = `${spec.element.name}-end`;
    });

    it('correct initial state', () => {
      spec.assertIsPristine();
      checkSelectedRange(spec.element, value);
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

      checkSelectedRange(spec.element, value);
    });
  });
  describe('Validation message slots', () => {
    it('', () => {
      const now = CalendarDay.today;

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
  it('is correctly validated on switching between two and single inputs', async () => {
    spec.setProperties({ useTwoInputs: false });
    await elementUpdated(spec.element);

    spec.setProperties({ value: null });
    spec.setProperties({ required: true });
    await elementUpdated(spec.element);

    let singleInput = spec.element.renderRoot.querySelector(
      IgcDateRangeInputComponent.tagName
    )!;
    expect(singleInput.invalid).to.be.true;

    spec.setProperties({ useTwoInputs: true });
    await elementUpdated(spec.element);

    const dti = spec.element.renderRoot.querySelectorAll(
      IgcDateTimeInputComponent.tagName
    );
    const input = dti[0]!.shadowRoot!.querySelector(
      'input'
    ) as HTMLInputElement;
    simulateInput(input, { value: '01/01/2025', inputType: 'insertText' });
    // expect both inputs to be invalid as the date range is not complete
    expect(dti[0]!.invalid).to.be.true;
    expect(dti[1]!.invalid).to.be.true;

    spec.setProperties({ useTwoInputs: false });
    await elementUpdated(spec.element);

    spec.setProperties({
      disabledDates: [
        {
          type: DateRangeType.Between,
          dateRange: [today.native, tomorrow.native],
        },
      ],
    });
    await elementUpdated(spec.element);

    spec.setProperties({
      value: {
        start: today.add('day', -2).native,
        end: tomorrow.add('day', 2).native,
      },
    });
    await elementUpdated(spec.element);

    singleInput = spec.element.renderRoot.querySelector(
      IgcDateRangeInputComponent.tagName
    )!;
    expect(singleInput.invalid).to.be.true;
  });
});
