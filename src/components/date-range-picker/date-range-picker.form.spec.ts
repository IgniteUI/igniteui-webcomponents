import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { createFormAssociatedTestBed } from '#internals/testing/form-testbed.spec.js';
import {
  simulateClick,
  simulateInput,
} from '#internals/testing/simulate.spec.js';
import {
  runValidationContainerTests,
  type ValidationContainerTestsParams,
  ValidityHelpers,
} from '#internals/testing/validity-helpers.spec.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import { type DateRangeDescriptor, DateRangeType } from '../calendar/types.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import IgcDateRangePickerComponent from './date-range-picker.js';
import {
  checkSelectedRange,
  getEditorRange,
  getEditors,
  getIcon,
  getInput,
  typeAt,
} from './date-range-picker.utils.spec.js';

describe('Date range picker - Form integration', () => {
  before(() =>
    defineComponents(IgcDateRangePickerComponent, IgcDateRangeInputComponent)
  );

  const today = CalendarDay.today;
  const tomorrow = today.add('day', 1);
  const yesterday = today.add('day', -1);
  const value = { start: today.native, end: tomorrow.native };
  const toggleIcon = 'today';
  const startKey = 'rangePicker-start';
  const endKey = 'rangePicker-end';

  describe('Form integration in each layout', () => {
    for (const useTwoInputs of [false, true]) {
      describe(useTwoInputs ? 'Two inputs' : 'Single input', () => {
        const checkEditorsInvalid = async (
          picker: IgcDateRangePickerComponent,
          invalid: boolean
        ) => {
          await elementUpdated(picker);
          const editors = getEditors(picker);

          expect(editors).lengthOf(useTwoInputs ? 2 : 1);
          for (const editor of editors) {
            expect(editor.invalid).to.equal(invalid);
          }
        };

        describe('Form associated', () => {
          const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
            html`<igc-date-range-picker
              name="rangePicker"
              ?use-two-inputs=${useTwoInputs}
            ></igc-date-range-picker>`
          );

          beforeEach(async () => {
            await spec.setup(IgcDateRangePickerComponent.tagName);
          });

          it('should be form associated', () => {
            expect(spec.element.form).to.equal(spec.form);
          });

          it('should not participate in form submission if the value is empty/invalid', () => {
            spec.setProperties({ value: { start: null, end: null } });
            spec.assertSubmitHasKeyValue(startKey, null);
            spec.assertSubmitHasKeyValue(endKey, null);
          });

          it('should participate in form submission if there is a value and the value adheres to the validation constraints', () => {
            spec.setProperties({ value });
            spec.assertSubmitHasKeyValue(startKey, value.start.toISOString());
            spec.assertSubmitHasKeyValue(endKey, value.end.toISOString());
          });

          it('submits the range under a new name', async () => {
            spec.setProperties({ value });
            await spec.rename('renamed');

            spec.assertSubmitHasKeyValue(
              'renamed-start',
              value.start.toISOString()
            );
            spec.assertSubmitHasKeyValue(
              'renamed-end',
              value.end.toISOString()
            );
          });

          it('is correctly reset on form reset', async () => {
            const initial = spec.element.value;

            spec.setProperties({ value });
            await elementUpdated(spec.element);

            checkSelectedRange(spec.element, value, useTwoInputs);

            spec.reset();
            await elementUpdated(spec.element);

            expect(spec.element.value).to.deep.equal(initial);
            expect(getEditorRange(spec.element)).to.be.null;
          });

          it('discards a partly typed date on form reset', async () => {
            const initial = spec.element.value;
            const [editor] = getEditors(spec.element);
            const input = getInput(spec.element);

            editor.focus();
            await elementUpdated(editor);
            const emptyMask = input.value;

            typeAt(input, '12', 0);
            await elementUpdated(editor);

            expect(input.value).to.not.equal(emptyMask);

            spec.reset();
            await elementUpdated(spec.element);
            await elementUpdated(editor);

            expect(input.value).to.equal(emptyMask);

            editor.blur();
            await elementUpdated(spec.element);

            expect(spec.element.value).to.deep.equal(initial);
            expect(getEditorRange(spec.element)).to.be.null;
          });

          it('shows the empty mask when a form reset empties the value', async () => {
            const [editor] = getEditors(spec.element);
            const input = getInput(spec.element);

            editor.focus();
            await elementUpdated(editor);
            const emptyMask = input.value;
            editor.blur();

            spec.setProperties({ value });
            await elementUpdated(spec.element);
            editor.focus();
            await elementUpdated(editor);

            expect(input.value).to.not.equal(emptyMask);

            spec.reset();
            await elementUpdated(spec.element);
            await elementUpdated(editor);

            expect(input.value).to.equal(emptyMask);
          });

          it('keeps the restored default when the editor blurs after a form reset', async () => {
            const defaultRange = {
              start: new Date(2024, 0, 15),
              end: new Date(2024, 0, 20),
            };
            spec.setProperties({ defaultValue: defaultRange });
            await elementUpdated(spec.element);

            const [editor] = getEditors(spec.element);
            const input = getInput(spec.element);

            editor.focus();
            await elementUpdated(editor);
            const shown = input.value;

            typeAt(input, '12', 0);
            await elementUpdated(editor);

            expect(input.value).to.not.equal(shown);

            spec.reset();
            await elementUpdated(spec.element);
            await elementUpdated(editor);

            expect(input.value).to.equal(shown);

            editor.blur();
            await elementUpdated(spec.element);

            checkSelectedRange(spec.element, defaultRange, useTwoInputs);
            spec.assertSubmitHasKeyValue(
              startKey,
              defaultRange.start.toISOString()
            );
          });

          it('drops the typed calendar selection on a form reset that keeps the value', async () => {
            const defaultRange = {
              start: new Date(2024, 0, 15),
              end: new Date(2024, 0, 20),
            };
            spec.setProperties({ defaultValue: defaultRange });
            await elementUpdated(spec.element);

            const [editor] = getEditors(spec.element);
            const input = getInput(spec.element);
            const calendar = spec.element.renderRoot.querySelector(
              IgcCalendarComponent.tagName
            )!;

            editor.focus();
            await elementUpdated(editor);

            // January 17 as the start.
            typeAt(input, '7', 4);
            await elementUpdated(spec.element);
            expect(calendar.values).to.eql([
              new Date(2024, 0, 17),
              defaultRange.end,
            ]);

            spec.reset();
            await elementUpdated(spec.element);

            expect(spec.element.value).to.eql(defaultRange);
            expect(calendar.values).to.eql([
              defaultRange.start,
              defaultRange.end,
            ]);
          });

          it('should not be in invalid state on reset for a required control which previously had value', async () => {
            spec.setProperties({ value });
            spec.setProperties({ required: true });

            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);

            spec.setProperties({ value: null });

            spec.reset();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should not be in invalid state on reset for a required control with no value', async () => {
            spec.setProperties({ value: null });
            spec.setProperties({ required: true });

            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            spec.reset();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should reset to the new default value after setAttribute() call', async () => {
            const newValue = {
              start: today.add('day', -2).native,
              end: today.add('day', 2).native,
            };
            spec.setAttributes({ value: JSON.stringify(newValue) });
            spec.setProperties({ value: { start: null, end: null } });
            await elementUpdated(spec.element);

            expect(getEditorRange(spec.element)).to.be.null;

            spec.reset();
            await elementUpdated(spec.element);

            spec.assertSubmitHasKeyValue(
              startKey,
              newValue.start.toISOString()
            );
            spec.assertSubmitHasKeyValue(endKey, newValue.end.toISOString());
            checkSelectedRange(spec.element, newValue, useTwoInputs);
          });

          it('should submit on pressing Enter when value is valid', () => {
            spec.setProperties({ value });
            expect(spec.submitWithEnter(getEditors(spec.element)[0])).to.be
              .true;
          });

          it('should not submit on pressing Enter when value is invalid', () => {
            spec.setProperties({ required: true, value: null });
            expect(spec.submitWithEnter(getEditors(spec.element)[0])).to.be
              .false;
          });

          it('submits once on a real Enter', async () => {
            expect(await spec.pressEnter()).to.equal(1);
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
            await checkEditorsInvalid(spec.element, true);

            spec.setProperties({ value });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should enforce min value constraint', async () => {
            // No value - submit passes
            spec.setProperties({ min: new Date(2026, 0, 1) });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);

            // Invalid min constraint for both values
            spec.setProperties({
              value: { start: new Date(2022, 0, 1), end: new Date(2022, 0, 1) },
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Invalid min constraint for start value
            spec.setProperties({
              value: { start: new Date(2022, 0, 1), end: new Date(2026, 0, 2) },
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Invalid min constraint for end value
            spec.setProperties({
              value: { start: new Date(2026, 0, 2), end: new Date(2022, 0, 2) },
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Valid value
            spec.setProperties({
              value: { start: new Date(2026, 0, 2), end: new Date(2026, 0, 3) },
            });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should enforce max value constraint', async () => {
            // No value - submit passes
            spec.setProperties({ max: new Date(2020, 0, 1) });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);

            // Invalid max constraint for both values
            spec.setProperties({ value });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Invalid max constraint for start value
            spec.setProperties({
              value: { start: today.native, end: new Date(2019, 0, 2) },
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Invalid max constraint for end value
            spec.setProperties({
              value: { start: new Date(2019, 0, 2), end: today.native },
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Valid value
            spec.setProperties({
              value: { start: new Date(2019, 0, 2), end: new Date(2019, 0, 3) },
            });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should enforce min value constraint with string property', async () => {
            // No value - submit passes
            spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);

            // Invalid min constraint
            spec.setProperties({
              value: JSON.stringify({
                start: new Date(2022, 0, 1),
                end: new Date(2022, 0, 1),
              }),
            });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Valid value
            spec.setProperties({
              value: JSON.stringify({
                start: new Date(2026, 0, 2),
                end: new Date(2026, 0, 3),
              }),
            });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should enforce max value constraint with string property', async () => {
            // No value - submit passes
            spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);

            // Invalid max constraint
            spec.setProperties({ value: JSON.stringify(value) });
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            // Valid value
            spec.setProperties({
              value: JSON.stringify({
                start: new Date(2019, 0, 2),
                end: new Date(2019, 0, 3),
              }),
            });
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
          });

          it('should invalidate the component if a disabled date is typed in the input', async () => {
            const disabledDates: DateRangeDescriptor[] = [
              {
                type: DateRangeType.Between,
                dateRange: [new Date(2025, 1, 1), new Date(2025, 1, 28)],
              },
            ];

            const cases = [
              // both values within the disabled range
              [new Date(2025, 1, 20), new Date(2025, 1, 26), true],
              // start and end values are valid, but wrap the disabled range
              [new Date(2025, 0, 20), new Date(2025, 2, 26), true],
              // start within the disabled range, end is valid
              [new Date(2025, 1, 20), new Date(2025, 2, 26), true],
              // end within the disabled range, start is valid
              [new Date(2025, 0, 20), new Date(2025, 1, 26), true],
              // single selected date outside the disabled range
              [new Date(2025, 0, 20), new Date(2025, 0, 20), false],
              // single selected date in the disabled range
              [new Date(2025, 1, 20), new Date(2025, 1, 20), true],
            ] as const;

            ValidityHelpers.setTouchedState(spec.element);

            for (const [start, end, invalid] of cases) {
              spec.setProperties({ disabledDates, value: { start, end } });
              expect(spec.element.invalid).to.equal(invalid);
              invalid ? spec.assertSubmitFails() : spec.assertSubmitPasses();
              await checkEditorsInvalid(spec.element, invalid);
            }
          });

          it('should enforce custom constraint', async () => {
            spec.element.setCustomValidity('invalid');
            spec.assertSubmitFails();
            await checkEditorsInvalid(spec.element, true);

            spec.element.setCustomValidity('');
            spec.assertSubmitPasses();
            await checkEditorsInvalid(spec.element, false);
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
          it('should not enter in invalid state when clicking the calendar toggle part', async () => {
            const picker = await fixture<IgcDateRangePickerComponent>(
              html`<igc-date-range-picker
                required
                ?use-two-inputs=${useTwoInputs}
              ></igc-date-range-picker>`
            );

            expect(picker.invalid).to.be.false;
            await checkEditorsInvalid(picker, false);

            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            expect(picker.invalid).to.be.false;
            await checkEditorsInvalid(picker, false);
          });
        });

        describe('defaultValue', () => {
          const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
            html`<igc-date-range-picker
              name="rangePicker"
              ?use-two-inputs=${useTwoInputs}
              .defaultValue=${value}
            ></igc-date-range-picker>`
          );

          beforeEach(async () => {
            await spec.setup(IgcDateRangePickerComponent.tagName);
          });

          it('correct initial state', () => {
            spec.assertIsPristine();
            checkSelectedRange(spec.element, value, useTwoInputs);
          });

          it('is correctly submitted', () => {
            spec.assertSubmitHasKeyValue(startKey, value.start.toISOString());
            spec.assertSubmitHasKeyValue(endKey, value.end.toISOString());
          });

          it('is correctly reset', async () => {
            spec.setProperties({
              value: {
                start: today.add('day', -2).native,
                end: today.add('day', 2).native,
              },
            });
            await elementUpdated(spec.element);

            spec.reset();
            await elementUpdated(spec.element);

            checkSelectedRange(spec.element, value, useTwoInputs);
          });
        });

        describe('Validation message slots', () => {
          it('', async () => {
            const testParameters: ValidationContainerTestsParams<IgcDateRangePickerComponent>[] =
              [
                {
                  slots: ['valueMissing'],
                  props: { useTwoInputs, required: true },
                },
                {
                  slots: ['rangeOverflow'],
                  props: {
                    useTwoInputs,
                    value: { start: today.native, end: tomorrow.native },
                    max: yesterday.native,
                  },
                },
                {
                  slots: ['rangeUnderflow'],
                  props: {
                    useTwoInputs,
                    value: { start: yesterday.native, end: today.native },
                    min: tomorrow.native,
                  },
                },
                {
                  slots: ['badInput'],
                  props: {
                    useTwoInputs,
                    value: { start: yesterday.native, end: tomorrow.native },
                    disabledDates: [
                      {
                        type: DateRangeType.Between,
                        dateRange: [yesterday.native, tomorrow.native],
                      },
                    ],
                  },
                },
                { slots: ['customError'], props: { useTwoInputs } },
                { slots: ['invalid'], props: { useTwoInputs, required: true } },
              ];

            await runValidationContainerTests(
              IgcDateRangePickerComponent,
              testParameters
            );
          });
        });
      });
    }
  });

  describe('Single input form integration', () => {
    const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker name="rangePicker"></igc-date-range-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDateRangePickerComponent.tagName);
    });

    it('should report the required message for a partial out-of-bounds range', async () => {
      // Regression: a partial range below `min` fails required and min.
      // The message must match the `valueMissing` flag.
      spec.setProperties({
        required: true,
        min: today.native,
        value: { start: today.add('day', -5).native, end: null },
      });
      await elementUpdated(spec.element);

      expect(spec.element.validity.valueMissing).to.be.true;
      expect(spec.element.validity.rangeUnderflow).to.be.false;
      expect(spec.element.validationMessage).to.equal('This field is required');
    });

    it('shows the invalid state of the picker on the inner editor at once', () => {
      const input = spec.element.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;

      spec.element.invalid = true;
      ValidityHelpers.hasInvalidStyles(input).to.be.true;

      spec.element.invalid = false;
      ValidityHelpers.hasInvalidStyles(input).to.be.false;
    });
  });

  describe('Two inputs form integration', () => {
    const spec = createFormAssociatedTestBed<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker
        name="rangePicker"
        use-two-inputs
      ></igc-date-range-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDateRangePickerComponent.tagName);
    });

    it('is correctly validated on switching between two and single inputs', async () => {
      ValidityHelpers.setTouchedState(spec.element);
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

    describe('Editor commit', () => {
      it('marks the picker as touched when an editor commits a value', async () => {
        // The focus stays in the picker, so only the commit marks it as touched.
        spec.setProperties({ min: today.native });

        const [start] = spec.element.renderRoot.querySelectorAll(
          IgcDateTimeInputComponent.tagName
        );

        start.value = today.add('day', -5).native;
        start.dispatchEvent(
          new CustomEvent('igcChange', { detail: start.value })
        );
        await elementUpdated(spec.element);

        expect(spec.element.validity.rangeUnderflow).to.be.true;
        ValidityHelpers.hasInvalidStyles(spec.element).to.be.true;
      });
    });

    describe('Form reset', () => {
      it('clears the invalid styles of the inner editors', async () => {
        spec.setProperties({
          min: today.native,
          defaultValue: { start: today.add('day', -5).native, end: null },
        });

        const [start] = spec.element.renderRoot.querySelectorAll(
          IgcDateTimeInputComponent.tagName
        );
        const native = start.renderRoot.querySelector('input')!;

        native.focus();
        native.blur();
        await elementUpdated(spec.element);
        await elementUpdated(start);

        ValidityHelpers.hasInvalidStyles(start).to.be.true;

        spec.reset();
        await elementUpdated(spec.element);
        await elementUpdated(start);

        ValidityHelpers.hasInvalidStyles(start).to.be.false;
        checkSelectedRange(spec.element, {
          start: today.add('day', -5).native,
          end: null,
        });
      });
    });
  });
});
