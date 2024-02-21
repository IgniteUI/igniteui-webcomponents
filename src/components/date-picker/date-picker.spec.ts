import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import IgcDatepickerComponent from './date-picker.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import { DateRangeType } from '../calendar/common/calendar.model.js';
import IgcDaysViewComponent from '../calendar/days-view/days-view.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';

describe('Date picker', () => {
  before(() => defineComponents(IgcDatepickerComponent));

  let picker: IgcDatepickerComponent;
  let dateTimeInput: IgcDateTimeInputComponent;
  let calendar: IgcCalendarComponent;

  describe('Rendering and initialization', () => {
    beforeEach(async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker></igc-datepicker>`
      );
      dateTimeInput = picker.shadowRoot!.querySelector(
        IgcDateTimeInputComponent.tagName
      ) as IgcDateTimeInputComponent;

      calendar = picker.shadowRoot!.querySelector(
        IgcCalendarComponent.tagName
      ) as IgcCalendarComponent;
    });

    it('is defined', async () => {
      expect(picker).is.not.undefined;
    });

    it('is accessible (closed state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    describe('Basic', () => {
      it('should set prompt char correctly', async () => {
        picker.prompt = '*';
        await elementUpdated(picker);

        expect(dateTimeInput.prompt).to.equal('*');
      });

      it('should not close calendar after selection when keepOpenOnSelect is true', async () => {
        expect(picker.open).to.equal(false);
        picker.keepOpenOnSelect = true;
        await elementUpdated(picker);

        picker.show();
        await elementUpdated(picker);

        const currentDate = new Date(new Date().setHours(0, 0, 0));
        const eventSpy = spy(picker, 'emitEvent');

        selectCurrentDate(calendar);
        await elementUpdated(picker);

        expect(eventSpy).calledOnce;

        expect((picker.value as Date).toLocaleDateString('en-US')).to.equal(
          currentDate.toLocaleDateString('en-US')
        );

        expect((calendar.value as Date).toLocaleDateString('en-US')).to.equal(
          currentDate.toLocaleDateString('en-US')
        );

        expect(picker.open).to.equal(true);
      });

      it('should not close calendar on clicking outside of it when keepOpenOnOutsideClick is true', async () => {
        expect(picker.open).to.equal(false);
        picker.keepOpenOnOutsideClick = true;
        await elementUpdated(picker);

        picker.show();
        await elementUpdated(picker);

        document.body.click();
        await elementUpdated(picker);

        expect(picker.open).to.equal(true);
      });

      it('should set properties of the calendar correctly', async () => {
        const props = {
          weekStart: 'friday',
          hideOutsideDays: true,
          hideHeader: true,
          showWeekNumbers: true,
          visibleMonths: 3,
          headerOrientation: 'vertical',
          orientation: 'vertical',
          disabledDates: [
            {
              type: DateRangeType.Before,
              dateRange: [new Date()],
            },
          ],
          specialDates: [
            {
              type: DateRangeType.Weekends,
              dateRange: [],
            },
          ],
        };

        //test defaults
        expect(picker.weekStart).to.equal('sunday');
        expect(picker.hideOutsideDays).to.equal(false);
        expect(picker.hideHeader).to.equal(false);
        expect(picker.showWeekNumbers).to.equal(false);
        expect(picker.visibleMonths).to.equal(1);
        expect(picker.headerOrientation).to.equal('horizontal');
        expect(picker.orientation).to.equal('horizontal');
        expect(calendar.disabledDates).to.be.undefined;
        expect(calendar.specialDates).to.be.undefined;

        Object.assign(picker, props);
        await elementUpdated(picker);

        for (const [prop, value] of Object.entries(props)) {
          expect((calendar as any)[prop]).to.equal(value);
        }
      });

      it('should set the mode property correctly', async () => {
        // TODO
      });

      it('should set properties of the input correctly', async () => {
        const props = {
          required: true,
          label: 'Sample Label',
          disabled: true,
          placeholder: 'Sample placeholder',
          outlined: true,
        };

        Object.assign(picker, props);
        await elementUpdated(picker);

        for (const [prop, value] of Object.entries(props)) {
          expect((dateTimeInput as any)[prop]).to.equal(value);
        }
      });

      describe('Active date', () => {
        const currentDate = new Date();
        const currentDateString = currentDate.toLocaleDateString('en-US');

        const tomorrowDate = new Date(
          currentDate.setDate(currentDate.getDate() + 1)
        );
        const tomorrowDateString = tomorrowDate.toLocaleDateString('en-US');

        const after10DaysDate = new Date(
          currentDate.setDate(currentDate.getDate() + 10)
        );
        const after10DaysString = after10DaysDate.toLocaleDateString('en-US');

        const after20DaysDate = new Date(
          currentDate.setDate(currentDate.getDate() + 20)
        );

        it('should initialize activeDate with current date, when not set', async () => {
          expect(picker.activeDate.toLocaleDateString('en-US')).to.equal(
            currentDateString
          );
          expect(picker.value).to.be.undefined;
          expect(calendar.activeDate.toLocaleDateString('en-US')).to.equal(
            currentDateString
          );
          expect(calendar.value).to.be.undefined;
        });

        it('should initialize activeDate = value when it is not set, but value is', async () => {
          const valueDate = after10DaysDate;
          picker = await fixture<IgcDatepickerComponent>(
            html`<igc-datepicker .value=${valueDate} />`
          );
          await elementUpdated(picker);
          await elementUpdated(picker);

          expect(picker.value?.toLocaleDateString('en-US')).to.equal(
            valueDate.toLocaleDateString('en-US')
          );

          calendar = picker.shadowRoot!.querySelector(
            IgcCalendarComponent.tagName
          ) as IgcCalendarComponent;

          expect(picker.activeDate.toLocaleDateString('en-US')).to.equal(
            after10DaysString
          );
          expect(calendar.activeDate.toLocaleDateString('en-US')).to.equal(
            after10DaysString
          );
          expect(calendar.value!.toLocaleDateString('en-US')).to.equal(
            after10DaysString
          );
        });

        it('should set activeDate correctly', async () => {
          picker.activeDate = tomorrowDate;

          await elementUpdated(picker);
          expect(calendar.activeDate.toLocaleDateString('en-US')).to.equal(
            tomorrowDateString
          );
          // value is not defined
          expect(picker.value).to.be.undefined;

          // setting the value does not affect the activeDate, when it is explicitly set
          picker.value = after20DaysDate;
          await elementUpdated(picker);

          expect(calendar.activeDate.toLocaleDateString('en-US')).to.equal(
            tomorrowDateString
          );
        });
      });
    });

    describe('Methods', () => {
      let input: HTMLInputElement;

      beforeEach(() => {
        input = dateTimeInput.shadowRoot!.querySelector(
          'input'
        ) as HTMLInputElement;
      });

      it('should open/close the picker on invoking show/hide/toggle and not emit events', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        expect(picker.open).to.be.false;
        picker.show();
        await elementUpdated(picker);

        expect(eventSpy).not.called;
        expect(picker.open).to.be.true;

        picker.hide();
        await elementUpdated(picker);

        expect(eventSpy).not.called;
        expect(picker.open).to.be.false;

        picker.toggle();
        await elementUpdated(picker);

        expect(eventSpy).not.called;
        expect(picker.open).to.be.true;

        picker.toggle();
        await elementUpdated(picker);

        expect(eventSpy).not.called;
        expect(picker.open).to.be.false;
      });

      it('should clear the input on invoking clear()', async () => {
        picker.value = new Date();
        await elementUpdated(picker);

        expect(dateTimeInput.value).to.equal(picker.value);
        picker.clear();
        await elementUpdated(picker);

        expect(picker.value).to.be.undefined;
        expect(dateTimeInput.value).to.be.null;
      });

      it('should delegate stepUp and stepDown to the igc-date-time-input', async () => {
        const stepUpSpy = spy(dateTimeInput, 'stepUp');
        const stepDownSpy = spy(dateTimeInput, 'stepDown');

        picker.stepUp();
        await elementUpdated(picker);

        expect(stepUpSpy).called;

        picker.stepDown();
        await elementUpdated(picker);

        expect(stepDownSpy).called;
      });

      it('should select the text in the input with the select method', async () => {
        const selectSpy = spy(dateTimeInput, 'select');
        picker.value = new Date();
        await elementUpdated(picker);

        dateTimeInput.focus();
        picker.select();
        await elementUpdated(picker);

        expect(selectSpy).to.be.called;
        expect(input.selectionStart).to.eq(0);
        expect(input.selectionEnd).to.eq(input.value.length);
      });

      it('should set the text selection range in the input with setSelectionRange()', async () => {
        const selectionRangeSpy = spy(dateTimeInput, 'setSelectionRange');
        picker.value = new Date();
        await elementUpdated(picker);

        dateTimeInput.focus();
        picker.setSelectionRange(0, 2);
        await elementUpdated(picker);

        expect(selectionRangeSpy).to.be.called;
        expect(input.selectionStart).to.eq(0);
        expect(input.selectionEnd).to.eq(2);
      });

      it('should replace the selected text in the input and re-apply the mask with setRangeText()', async () => {
        // TODO - fix of src/components/date-picker/date-picker.spec.ts
        /*
        const setRangeTextSpy = spy(dateTimeInput, 'setRangeText');
        picker.value = new Date(2024, 2, 21);
        const expectedValue = new Date(2023, 2, 21);
        await elementUpdated(picker);

        dateTimeInput.focus();
        picker.setRangeText('2023', 6, 10);
        await elementUpdated(picker);

        expect(setRangeTextSpy).to.be.called;

        expect(new Date(input.value).toISOString()).to.equal(
          expectedValue.toISOString()
        );
        expect(picker.value).to.eq(expectedValue);
        expect(dateTimeInput.value).to.eq(expectedValue);
        */
      });
    });

    describe('Slotted content', () => {
      // TODO
    });

    describe('Localization', () => {
      it('should set inputFormat correctly', async () => {
        const testFormat = 'dd--MM--yyyy';
        picker.inputFormat = testFormat;
        await elementUpdated(picker);

        expect(dateTimeInput.inputFormat).to.equal(testFormat);
      });

      it('should set displayFormat correctly', async () => {
        let testFormat = 'dd-MM-yyyy';
        picker.displayFormat = testFormat;
        await elementUpdated(picker);

        expect(dateTimeInput.displayFormat).to.equal(testFormat);

        // set via attribute
        testFormat = 'dd--MM--yyyy';
        picker.setAttribute('display-format', testFormat);
        await elementUpdated(picker);

        expect(dateTimeInput.displayFormat).to.equal(testFormat);
        expect(picker.displayFormat).not.to.equal(picker.inputFormat);
      });

      it('should properly set displayFormat to the set of predefined formats', async () => {
        const predefinedFormats = ['short', 'medium', 'long', 'full'];

        for (let i = 0; i < predefinedFormats.length; i++) {
          const format = predefinedFormats[i];
          picker.displayFormat = format;
          await elementUpdated(picker);

          expect(dateTimeInput.displayFormat).to.equal(format + 'Date');
        }
      });

      it('should default inputFormat to whatever Intl.DateTimeFormat returns for the current locale', async () => {
        const defaultFormat = 'MM/dd/yyyy';
        expect(picker.locale).to.equal('en');
        expect(picker.inputFormat).to.equal(defaultFormat);

        picker.locale = 'fr';
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
      });

      it('should use the value of inputFormat for displayFormat, if it is not defined', async () => {
        expect(picker.locale).to.equal('en');
        expect(picker.getAttribute('display-format')).to.be.null;
        expect(picker.displayFormat).to.equal(picker.inputFormat);

        // updates inputFormat according to changed locale
        picker.locale = 'fr';
        await elementUpdated(picker);
        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);

        // sets inputFormat as attribute
        picker.setAttribute('input-format', 'dd-MM-yyyy');
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd-MM-yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);
      });
    });

    describe('Validation', () => {
      it('should set the min and max properties and update validity according to set value', async () => {
        expect(picker.min).to.be.undefined;
        expect(dateTimeInput.min).to.be.undefined;
        expect(picker.max).to.be.undefined;
        expect(dateTimeInput.max).to.be.undefined;
        expect(picker.invalid).to.be.false;

        picker.value = new Date(2024, 2, 18);
        await elementUpdated(picker);

        picker.min = new Date(2024, 2, 20);
        await elementUpdated(picker);

        // only changing the min/max property does not set invalid state - updating the value does ?
        expect(picker.invalid).to.be.false;
        picker.value = new Date(2024, 2, 19);
        await elementUpdated(picker);

        expect(picker.invalid).to.be.true;

        picker.value = new Date(2024, 2, 24);
        await elementUpdated(picker);

        expect(picker.invalid).to.be.false;

        picker.max = new Date(2024, 2, 22);
        await elementUpdated(picker);

        expect(picker.invalid).to.be.false;

        picker.value = new Date(2024, 2, 23);
        await elementUpdated(picker);

        expect(picker.invalid).to.be.true;

        picker.value = new Date(2024, 2, 21);
        await elementUpdated(picker);

        expect(picker.invalid).to.be.false;
        // TODO check same on typing - untouched/dirty
      });
    });

    describe('Form integration', () => {
      it('should set a custom validation message with setCustomValidity()', async () => {
        // TODO
        //  As long as message is not empty, the component is considered invalid
      });
    });
  });
});

const selectCurrentDate = (calendar: IgcCalendarComponent) => {
  const daysView = calendar.shadowRoot?.querySelector(
    'igc-days-view'
  ) as IgcDaysViewComponent;

  const currentDaySpan = daysView.shadowRoot?.querySelector(
    'span[part~="current"]'
  ) as HTMLElement;
  (currentDaySpan?.children[0] as HTMLElement).click();
};
