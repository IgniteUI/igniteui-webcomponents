import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import IgcCalendarComponent from '../calendar/calendar.js';
import { getCalendarDOM, getDOMDate } from '../calendar/helpers.spec.js';
import { CalendarDay } from '../calendar/model.js';
import { type DateRangeDescriptor, DateRangeType } from '../calendar/types.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  type ValidationContainerTestsParams,
  checkDatesEqual,
  createFormAssociatedTestBed,
  isFocused,
  runValidationContainerTests,
  simulateClick,
  simulateKeyboard,
} from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import IgcInputComponent from '../input/input.js';
import IgcDateRangePickerComponent, {
  type DateRangeValue,
} from './date-range-picker.js';

describe('Date range picker', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let dateTimeInputs: Array<IgcDateTimeInputComponent>;
  let calendar: IgcCalendarComponent;

  const toggleIcon = 'today';
  const clearIcon = 'input_clear';
  const today = CalendarDay.from(new Date());
  const tomorrow = today.add('day', 1);

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker use-two-inputs></igc-date-range-picker>`
    );
    dateTimeInputs = Array.from(
      picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
    );

    calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;
  });

  describe('Rendering and initialization', () => {
    it('is defined', async () => {
      expect(picker).is.not.undefined;
    });

    it('is accessible (closed state)', async () => {
      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    xit('is accessible (open state) - default dropdown mode', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    xit('is accessible (open state) - dialog mode', async () => {
      picker.open = true;
      picker.mode = 'dialog';
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('should not render title slot elements in dropdown mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dropdown">
          <p slot="title">Custom title</p>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.be.null;
    });

    it('should render title slot elements in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dialog">
          <p slot="title">Custom title</p>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.not.be.null;
    });

    it('should be successfully initialized with value', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
          use-two-inputs
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue);
    });

    it('should be successfully initialized in open state in dropdown mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker open></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dropdown');
      await picker.show();

      const popover = picker.renderRoot.querySelector('igc-popover');
      expect(popover).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.have.tagName('igc-focus-trap');
    });

    it('should be successfully initialized in open state in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker open mode="dialog"></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dialog');
      await picker.show();

      const dialog = picker.renderRoot.querySelector('igc-dialog');
      expect(dialog).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.equal(dialog);
    });

    it('should be initialized as single input', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker></igc-date-range-picker>`
      );

      expect(picker.useTwoInputs).to.equal(false);
      await picker.show();

      const input = picker.renderRoot.querySelectorAll(
        IgcInputComponent.tagName
      )!;
      expect(input).to.have.length(1);
      const dateTimeInputs = picker.renderRoot.querySelectorAll(
        IgcDateTimeInputComponent.tagName
      );
      expect(dateTimeInputs).to.have.length(0);
    });
  });
  describe('Properties', () => {
    it('should set value through attribute correctly in case the date values are valid ISO 8601 strings', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      const attributeValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          value="${JSON.stringify(attributeValue)}"
        ></igc-date-range-picker>`
      );
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue, false);
    });

    it('should keep the calendar selection and input values on changing the mode', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue, false);

      picker.mode = 'dialog';
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue, false);
    });

    it('should keep the calendar selection and input values on switching to two inputs and back', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );
      checkSelectedRange(picker, expectedValue, false);

      await elementUpdated(picker);
      checkSelectedRange(picker, expectedValue, false);

      picker.useTwoInputs = true;
      await elementUpdated(picker);
      checkSelectedRange(picker, expectedValue, true);
    });

    it('should not close calendar on clicking outside of it when keepOpenOnOutsideClick is true', async () => {
      expect(picker.open).to.equal(false);
      picker.keepOpenOnOutsideClick = true;
      await elementUpdated(picker);

      await picker.show();
      expect(picker.open).to.equal(true);

      simulateClick(document.body);
      await elementUpdated(picker);
      expect(picker.open).to.equal(true);

      await picker.hide();

      picker.mode = 'dialog';
      picker.keepOpenOnOutsideClick = true;
      await elementUpdated(picker);
      await picker.show();
      expect(picker.open).to.equal(true);

      simulateClick(document.body);
      await elementUpdated(picker);
      expect(picker.open).to.equal(true);
    });

    it('should close calendar on clicking outside of it when keepOpenOnOutsideClick is false (default)', async () => {
      expect(picker.open).to.equal(false);
      await elementUpdated(picker);
      await picker.show();
      expect(picker.open).to.equal(true);

      simulateClick(document.body);
      await elementUpdated(picker);
      expect(picker.open).to.equal(false);

      picker.mode = 'dialog';
      await elementUpdated(picker);
      await picker.show();
      expect(picker.open).to.equal(true);

      simulateClick(document.body);
      await elementUpdated(picker);
      expect(picker.open).to.equal(false);
    });

    it('should keep the picker open when keepOpenOnSelect is enabled and a selection is made in the calendar picker', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.keepOpenOnSelect = true;
      await elementUpdated(picker);
      await picker.show();
      await selectDates(today, tomorrow, calendar);
      expect(eventSpy).calledWith('igcChange');
      checkSelectedRange(picker, { start: today.native, end: tomorrow.native });
      expect(picker.open).to.equal(true);

      await picker.hide();
      picker.mode = 'dialog';
      await elementUpdated(picker);
      expect(picker.open).to.equal(false);

      await picker.show();
      await selectDates(today.add('day', 2), tomorrow.add('day', 2), calendar);
      checkSelectedRange(picker, {
        start: today.add('day', 2).native,
        end: tomorrow.add('day', 2).native,
      });
      expect(picker.open).to.equal(true);
    });

    it('should not modify value through selection or typing when readOnly is true', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.readOnly = true;
      await elementUpdated(picker);
      expect(picker.value).to.deep.equal({ start: null, end: null });

      await picker.show();
      await selectDates(today, tomorrow, calendar);

      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(calendar.values).to.deep.equal([]);
      expect(eventSpy).not.to.be.called;

      await picker.hide();

      dateTimeInputs[0].focus();
      simulateKeyboard(dateTimeInputs[0], 'ArrowDown');
      await elementUpdated(picker);
      expect(isFocused(dateTimeInputs[0])).to.be.true;
      expect(dateTimeInputs[0].value).to.equal(null);
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(calendar.values).to.deep.equal([]);
      expect(eventSpy).not.to.be.called;

      picker.useTwoInputs = false;
      await elementUpdated(picker);
      await picker.show();

      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;
      await selectDates(today, tomorrow, calendar);
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(calendar.values).to.deep.equal([]);
      expect(eventSpy).not.to.be.called;
    });

    it('should modify value only through calendar selection and not input when nonEditable is true (two inputs)', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.nonEditable = true;
      await elementUpdated(picker);

      dateTimeInputs[0].focus();
      simulateKeyboard(dateTimeInputs[0], 'ArrowDown');
      await elementUpdated(picker);

      expect(isFocused(dateTimeInputs[0])).to.be.true;
      expect(dateTimeInputs[0].value).to.equal(null);
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(calendar.values).to.deep.equal([]);
      expect(eventSpy).not.to.be.called;

      await picker.show();
      await selectDates(today, tomorrow, calendar);
      checkSelectedRange(picker, { start: today.native, end: tomorrow.native });
      expect(eventSpy).calledWith('igcChange');
    });

    it('should set properties of the calendar correctly', async () => {
      const props = {
        weekStart: 'friday',
        hideOutsideDays: true,
        hideHeader: true,
        showWeekNumbers: true,
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
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(picker.weekStart).to.equal('sunday');
      expect(picker.hideOutsideDays).to.equal(false);
      expect(picker.hideHeader).to.equal(false);
      expect(picker.showWeekNumbers).to.equal(false);
      expect(picker.headerOrientation).to.equal('horizontal');
      expect(picker.orientation).to.equal('horizontal');
      expect(calendar.disabledDates).to.be.undefined;
      expect(calendar.specialDates).to.be.undefined;

      Object.assign(picker, props);
      await elementUpdated(picker);

      for (const [prop, value] of Object.entries(props)) {
        expect((calendar as any)[prop]).to.eql(value);
      }
    });

    it('should set properties of the input(s) correctly', async () => {
      const props = {
        disabled: true,
        labelStart: 'Sample label start',
        labelEnd: 'Sample label end',
        placeholderStart: 'Sample placeholder start',
        placeholderEnd: 'Sample placeholder end',
        displayFormat: 'yyyy/MM/dd',
        inputFormat: 'yyyy-MM-dd',
        outlined: true,
      };

      Object.assign(picker, props);
      await elementUpdated(picker);

      dateTimeInputs = Array.from(
        picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
      );

      expect(dateTimeInputs[0].placeholder).to.equal(props.placeholderStart);
      expect(dateTimeInputs[1].placeholder).to.equal(props.placeholderEnd);
      expect(dateTimeInputs[0].label).to.equal(props.labelStart);
      expect(dateTimeInputs[1].label).to.equal(props.labelEnd);

      for (const prop in props) {
        if (
          ![
            'labelStart',
            'labelEnd',
            'placeholderStart',
            'placeholderEnd',
          ].includes(prop)
        ) {
          expect((dateTimeInputs[0] as any)[prop], `Fail for ${prop}`).to.equal(
            (props as any)[prop]
          );
          expect((dateTimeInputs[1] as any)[prop], `Fail for ${prop}`).to.equal(
            (props as any)[prop]
          );
        }
      }

      picker.useTwoInputs = false;
      await elementUpdated(picker);

      const propsSingle = {
        required: true,
        disabled: true,
        placeholder: 'Sample placeholder',
        outlined: true,
      };

      Object.assign(picker, propsSingle);
      await elementUpdated(picker);

      const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
      for (const [prop, value] of Object.entries(propsSingle)) {
        expect((input as any)[prop], `Fail for ${prop}`).to.equal(value);
      }
    });

    describe('Localization', () => {
      it('should properly set displayFormat to the set of predefined formats', async () => {
        const predefinedFormats = ['short', 'medium', 'long', 'full'];

        for (let i = 0; i < predefinedFormats.length; i++) {
          const format = predefinedFormats[i];
          picker.displayFormat = format;
          await elementUpdated(picker);

          dateTimeInputs = Array.from(
            picker.renderRoot.querySelectorAll(
              IgcDateTimeInputComponent.tagName
            )
          );
          expect(dateTimeInputs[0].displayFormat).to.equal(`${format}Date`);
          expect(dateTimeInputs[1].displayFormat).to.equal(`${format}Date`);
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

    it('should expose the default strings for localization', async () => {
      picker.resourceStrings.done = 'Done - localized';
      picker.resourceStrings.cancel = 'Cancel - localized';
      picker.resourceStrings.separator = 'Separator - localized';
      picker.mode = 'dialog';
      picker.open = true;
      await elementUpdated(picker);

      const doneBtn = picker.shadowRoot!.querySelector(
        'igc-button[slot="footer"]:last-of-type'
      ) as HTMLButtonElement;
      expect(doneBtn.innerText).to.equal('Done - localized');

      const cancelBtn = picker.shadowRoot!.querySelector(
        'igc-button[slot="footer"]'
      ) as HTMLButtonElement;
      expect(cancelBtn.innerText).to.equal('Cancel - localized');

      picker.open = false;
      await elementUpdated(picker);
      const separator = picker.shadowRoot!.querySelector(
        '[part="separator"]'
      ) as any;
      expect(separator?.innerText).to.equal('Separator - localized');
    });
  });
  describe('Methods', () => {
    it('should open/close the picker on invoking show/hide/toggle and not emit events', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      expect(picker.open).to.be.false;
      await picker.show();

      expect(eventSpy).not.called;
      expect(picker.open).to.be.true;

      await picker.hide();

      expect(eventSpy).not.called;
      expect(picker.open).to.be.false;

      await picker.toggle();

      expect(eventSpy).not.called;
      expect(picker.open).to.be.true;

      await picker.toggle();

      expect(eventSpy).not.called;
      expect(picker.open).to.be.false;
    });
    it('should clear the input on invoking clear()', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.value = { start: today.native, end: tomorrow.native };
      await elementUpdated(picker);

      expect(dateTimeInputs[0].value).to.equal(picker.value.start);
      expect(dateTimeInputs[1].value).to.equal(picker.value.end);
      picker.clear();
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(dateTimeInputs[0].value).to.be.null;
      expect(dateTimeInputs[1].value).to.be.null;
    });
    it('should select a date range on invoking select', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      expect(picker.value).to.deep.equal({ start: null, end: null });

      picker.select({ start: today.native, end: tomorrow.native });
      await elementUpdated(picker);

      expect(picker.value).to.deep.equal({
        start: today.native,
        end: tomorrow.native,
      });
      expect(dateTimeInputs[0].value).to.equal(picker.value?.start);
      expect(dateTimeInputs[1].value).to.equal(picker.value?.end);
      expect(eventSpy).not.called;
    });
  });
  describe('Interactions', () => {
    describe('Selection via the calendar', () => {
      it('should select a single date in dropdown mode and emit igcChange', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.open = true;
        await elementUpdated(picker);
        await selectDates(today, null, calendar);

        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, { start: today.native, end: today.native });

        const popover = picker.renderRoot.querySelector('igc-popover');
        // when selecting a single date, the calendar won't close
        expect(popover?.hasAttribute('open')).to.equal(true);
      });

      it('should select a range of dates in dropdown mode and emit igcChange', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.open = true;
        await elementUpdated(picker);
        await selectDates(today, tomorrow, calendar);

        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });

        const popover = picker.renderRoot.querySelector('igc-popover');
        // with the second click, the calendar closes
        expect(popover?.hasAttribute('open')).to.equal(false);
      });

      // TODO
      it('should swap the selected dates if the end is earlier than the start', async () => {});

      it('should select a range of dates in dialog mode and emit igcChange when done is clicked', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);
        await selectDates(today, tomorrow, calendar);

        expect(eventSpy).not.to.be.calledWith('igcChange');
        let dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(true);

        const doneBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]:last-of-type'
        ) as HTMLButtonElement;
        doneBtn?.click();
        await elementUpdated(picker);
        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });

        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
      });

      it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = today.add('day', -2);
        const date2 = today.add('day', 2);
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);
        expect(eventSpy).not.to.be.calledWith('igcChange'); // TODO: should igcChange be emitted for dialog selection before clicking DONE?
        let dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(true);
        checkSelectedRange(picker, { start: date1.native, end: date2.native });

        const cancelBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]'
        ) as HTMLButtonElement;
        cancelBtn?.click();
        await elementUpdated(picker);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });
      });

      it('should revert to no value when cancel is clicked and initial value is null', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = today.add('day', -2);
        const date2 = today.add('day', 2);
        picker.value = null;
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);
        expect(eventSpy).not.to.be.calledWith('igcChange'); // TODO: should igcChange be emitted for dialog selection before clicking DONE?
        let dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(true);
        checkSelectedRange(picker, { start: date1.native, end: date2.native });

        const cancelBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]'
        ) as HTMLButtonElement;
        cancelBtn?.click();
        await elementUpdated(picker);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);

        dateTimeInputs = Array.from(
          picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
        );
        calendar = picker.renderRoot.querySelector(
          IgcCalendarComponent.tagName
        )!;

        expect(dateTimeInputs[0].value).to.equal(null);
        expect(dateTimeInputs[1].value).to.equal(null);
        expect(calendar.values).to.deep.equal([]);
      });
    });
    describe('Keyboard navigation', () => {
      it('should close the picker when in open state on pressing Escape', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.focus();
        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);
        expect(eventSpy).not.called;

        await picker.show();
        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);

        expect(eventSpy).calledTwice;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
        eventSpy.resetHistory();

        // dialog mode
        picker.mode = 'dialog';
        await picker.show();

        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);

        expect(eventSpy).calledTwice;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });

      it('should open the calendar picker on Alt + ArrowDown and close it on Alt + ArrowUp - dropdown mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        expect(picker.open).to.be.false;
        picker.focus();
        simulateKeyboard(picker, [altKey, arrowDown]);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
        expect(eventSpy).calledWith('igcOpening');
        expect(eventSpy).calledWith('igcOpened');

        eventSpy.resetHistory();

        simulateKeyboard(picker, [altKey, arrowUp]);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
        eventSpy.resetHistory();
      });

      it('should open the calendar picker on Alt + ArrowDown and close it on Alt + ArrowUp - dialog mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        expect(picker.open).to.be.false;
        picker.focus();
        picker.mode = 'dialog';
        await elementUpdated(picker);

        simulateKeyboard(picker, [altKey, arrowDown]);
        await elementUpdated(picker);

        const dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(picker.open).to.be.true;
        expect(dialog).not.to.be.undefined;
        expect(dialog?.open).to.be.true;
        expect(eventSpy).calledWith('igcOpening');
        expect(eventSpy).calledWith('igcOpened');
        eventSpy.resetHistory();

        simulateKeyboard(picker, [altKey, arrowUp]);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(eventSpy).calledWith('igcClosing');
        expect(eventSpy).calledWith('igcClosed');
      });
    });
    describe('Interactions with the inputs and the open and clear buttons', () => {
      it('should emit or not igcInput according to nonEditable property', async () => {
        const expectedValue = today.native;
        const eventSpy = spy(picker, 'emitEvent');

        dateTimeInputs[0].focus();
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledOnceWith('igcInput');
        eventSpy.resetHistory();
        expect(dateTimeInputs[0].value).to.not.be.null;
        checkDatesEqual(dateTimeInputs[0].value!, expectedValue);

        picker.value = null;
        picker.nonEditable = true;
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).not.called;
        expect(dateTimeInputs[0].value).to.be.null;

        dateTimeInputs[0].dispatchEvent(
          new CustomEvent('igcInput', { detail: expectedValue })
        );
        await elementUpdated(picker);

        expect(eventSpy).not.to.be.called;
        expect(picker.value).to.deep.equal({ start: null, end: null });
      });

      it('should open the picker on calendar show icon click in dropdown mode', async () => {
        simulateClick(getIcon(picker, toggleIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
      });

      it('should not open the picker when clicking the input in dropdown mode', async () => {
        simulateClick(dateTimeInputs[0]);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
      });

      it('should open the picker on calendar show icon click in dialog mode', async () => {
        picker.mode = 'dialog';
        await elementUpdated(picker);

        simulateClick(getIcon(picker, toggleIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
      });

      it('should open the picker when clicking the input in dialog mode', async () => {
        picker.mode = 'dialog';
        await elementUpdated(picker);

        simulateClick(dateTimeInputs[0].renderRoot.querySelector('input')!);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
      });

      it('should not open the picker in dropdown mode when clicking the clear icon', async () => {
        // TODO -elaborate test scenario?
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        simulateClick(getIcon(picker, clearIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(picker.value).to.deep.equal({ start: null, end: null });
      });

      it('should not open the picker in dialog mode when clicking the clear icon', async () => {
        // TODO -elaborate test scenario?
        picker.mode = 'dialog';
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        simulateClick(getIcon(picker, clearIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        picker.value = { start: null, end: null };
      });

      // TODO
      it('should emit igcInput and igcChange on input value change', async () => {});

      it('should not swap the dates while typing', async () => {});

      it('should set the calendar active date to the start of the range while typing', async () => {});
    });
  });
  describe('Slots', () => {
    it('should render slotted elements - two inputs', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker use-two-inputs>
          <span slot="prefix-start">$</span>
          <span slot="prefix-end">$-end</span>
          <span slot="suffix-start">~</span>
          <span slot="suffix-end">~-end</span>
          <p slot="helper-text">For example, select a range</p>
          <p slot="title">Custom title</p>
          <p slot="header-date">Custom header date</p>
          <span slot="calendar-icon-open-start">v</span>
          <span slot="calendar-icon-open-end">v-end</span>
          <span slot="calendar-icon-start">^</span>
          <span slot="calendar-icon-end">^-end</span>
          <span slot="clear-icon-start">X</span>
          <span slot="clear-icon-end">X-end</span>
          <button slot="actions">Custom action</button>
          <span slot="separator">Custom separator</span>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slotTests = [
        {
          slot: 'prefix-start',
          tagName: 'span',
          content: '$',
        },
        {
          slot: 'prefix-end',
          tagName: 'span',
          content: '$-end',
        },
        {
          slot: 'suffix-start',
          tagName: 'span',
          content: '~',
        },
        {
          slot: 'suffix-end',
          tagName: 'span',
          content: '~-end',
        },
        {
          slot: 'title',
          tagName: 'p',
          content: 'Custom title',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
        },
        {
          slot: 'header-date',
          tagName: 'p',
          content: 'Custom header date',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
        },
        {
          slot: 'helper-text',
          tagName: 'p',
          content: 'For example, select a range',
        },
        {
          slot: 'calendar-icon-start',
          tagName: 'span',
          content: '^',
        },
        {
          slot: 'calendar-icon-end',
          tagName: 'span',
          content: '^-end',
        },
        {
          slot: 'calendar-icon-open-start',
          tagName: 'span',
          content: 'v',
          prerequisite: async () => await picker.show(),
        },
        {
          slot: 'calendar-icon-open-end',
          tagName: 'span',
          content: 'v-end',
          prerequisite: async () => await picker.show(),
        },
        {
          slot: 'clear-icon-start',
          tagName: 'span',
          content: 'X',
          prerequisite: () => {
            picker.value = { start: today.native, end: tomorrow.native };
          },
        },
        {
          slot: 'clear-icon-end',
          tagName: 'span',
          content: 'X-end',
          prerequisite: () => {
            picker.value = { start: today.native, end: tomorrow.native };
          },
        },
        {
          slot: 'actions',
          tagName: 'button',
          content: 'Custom action',
          prerequisite: async () => await picker.show(),
        },
        {
          slot: 'separator',
          tagName: 'span',
          content: 'Custom separator',
        },
      ];

      for (let i = 0; i < slotTests.length; i++) {
        await slotTests[i].prerequisite?.();
        await elementUpdated(picker);

        const slot = picker.renderRoot.querySelector(
          `slot[name="${slotTests[i].slot}"]`
        ) as HTMLSlotElement;
        const elements = slot.assignedElements();

        expect((elements[0] as HTMLElement).innerText).to.equal(
          slotTests[i].content
        );
        expect(elements[0].tagName.toLowerCase()).to.equal(
          slotTests[i].tagName
        );
      }
    });

    it('should render slotted elements - single input', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dialog">
          <span slot="prefix">$</span>
          <span slot="suffix">~</span>
          <p slot="helper-text">For example, select a range</p>
          <p slot="title">Custom title</p>
          <p slot="header-date">Custom header date</p>
          <span slot="calendar-icon-open">v</span>
          <span slot="calendar-icon">^</span>
          <span slot="clear-icon">X</span>
          <button slot="actions">Custom action</button>
          <span slot="separator">Custom separator</span>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slotTests = [
        {
          slot: 'prefix',
          tagName: 'span',
          content: '$',
        },
        {
          slot: 'suffix',
          tagName: 'span',
          content: '~',
        },
        {
          slot: 'title',
          tagName: 'p',
          content: 'Custom title',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
        },
        {
          slot: 'header-date',
          tagName: 'p',
          content: 'Custom header date',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
        },
        {
          slot: 'helper-text',
          tagName: 'p',
          content: 'For example, select a range',
        },
        {
          slot: 'calendar-icon',
          tagName: 'span',
          content: '^',
        },
        {
          slot: 'calendar-icon-open',
          tagName: 'span',
          content: 'v',
          prerequisite: async () => await picker.show(),
        },
        {
          slot: 'clear-icon',
          tagName: 'span',
          content: 'X',
          prerequisite: () => {
            picker.value = { start: today.native, end: tomorrow.native };
          },
        },
        {
          slot: 'actions',
          tagName: 'button',
          content: 'Custom action',
          prerequisite: async () => await picker.show(),
        },
      ];

      for (let i = 0; i < slotTests.length; i++) {
        await slotTests[i].prerequisite?.();
        await elementUpdated(picker);

        const slot = picker.renderRoot.querySelector(
          `slot[name="${slotTests[i].slot}"]`
        ) as HTMLSlotElement;
        const elements = slot.assignedElements();

        expect((elements[0] as HTMLElement).innerText).to.equal(
          slotTests[i].content
        );
        expect(elements[0].tagName.toLowerCase()).to.equal(
          slotTests[i].tagName
        );
      }
    });

    // TODO
    it('should render area with chips to select predefined date ranges', async () => {});

    it('should render area for custom actions', async () => {});
  });

  // #region Forms
  describe('Form integration', () => {
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
      startKey = `${spec.element.name}-start`;
      endKey = `${spec.element.name}-end`;
      value = { start: today.native, end: tomorrow.native };
    });

    it('should be form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('should not participate in form submission if the value is empty/invalid', async () => {
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

      // Invalid min constraint
      spec.setProperties({
        value: { start: new Date(2022, 0, 1), end: new Date(2022, 0, 1) },
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

      // Invalid min constraint
      spec.setProperties({ value });
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

    it('should not enter in invalid state when clicking the calendar toggle part - single input', async () => {
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
        use-two-inputs
      ></igc-date-range-picker>
    `);

    beforeEach(async () => {
      await spec.setup(IgcDateRangePickerComponent.tagName);
      startKey = `${spec.element.name}-start`;
      endKey = `${spec.element.name}-end`;
    });

    it('correct initial state', async () => {
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
    it('', async () => {
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
// #endregion

const selectDates = async (
  startDate: CalendarDay | null,
  endDate: CalendarDay | null,
  calendar: IgcCalendarComponent
) => {
  const daysView = getCalendarDOM(calendar).views.days;
  if (startDate) {
    const startDayDOM = getDOMDate(startDate, daysView);
    simulateClick(startDayDOM);
    await elementUpdated(calendar);
  }
  if (endDate) {
    const endDayDom = getDOMDate(endDate, daysView);
    simulateClick(endDayDom);
    await elementUpdated(calendar);
  }
};

const checkSelectedRange = (
  picker: IgcDateRangePickerComponent,
  expectedValue: DateRangeValue | null,
  useTwoInputs = true
) => {
  const calendar = picker.renderRoot.querySelector(
    IgcCalendarComponent.tagName
  )!;

  checkDatesEqual(picker.value?.start!, expectedValue?.start!);
  checkDatesEqual(picker.value?.end!, expectedValue?.end!);

  if (!useTwoInputs) {
    const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
    const start = expectedValue?.start
      ? DateTimeUtil.formatDate(
          expectedValue.start,
          picker.locale,
          picker.displayFormat || picker.inputFormat
        )
      : '';
    const end = expectedValue?.end
      ? DateTimeUtil.formatDate(
          expectedValue.end,
          picker.locale,
          picker.displayFormat || picker.inputFormat
        )
      : '';
    expect(input.value).to.equal(`${start} - ${end}`);
  } else {
    const inputs = picker.renderRoot.querySelectorAll(
      IgcDateTimeInputComponent.tagName
    );
    checkDatesEqual(inputs[0].value!, expectedValue?.start!);
    checkDatesEqual(inputs[1].value!, expectedValue?.end!);
  }

  if (expectedValue?.start) {
    checkDatesEqual(calendar.values[0], expectedValue?.start!);
  }
  if (expectedValue?.end) {
    const length = calendar.values.length;
    checkDatesEqual(calendar.values[length - 1], expectedValue?.end!);
  }
  if (!expectedValue?.start && !expectedValue?.end) {
    expect(calendar.values).to.deep.equal([]);
  }
};

const getIcon = (picker: IgcDateRangePickerComponent, name: string) => {
  return picker.renderRoot.querySelector(`[name='${name}']`)!;
};

const checkInputsInvalidState = async (
  el: IgcDateRangePickerComponent,
  first: boolean,
  second: boolean
) => {
  await elementUpdated(el);
  const inputs = el.renderRoot.querySelectorAll(
    IgcDateTimeInputComponent.tagName
  );
  expect(inputs[0].invalid).to.equal(first);
  expect(inputs[1].invalid).to.equal(second);
};
