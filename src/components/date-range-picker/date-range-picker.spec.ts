import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import IgcCalendarComponent from '../calendar/calendar.js';
import { getCalendarDOM, getDOMDate } from '../calendar/helpers.spec.js';
import { CalendarDay } from '../calendar/model.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  isFocused,
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

  const pickerShowIcon = 'today';
  const pickerClearIcon = 'input_clear';
  const today = CalendarDay.from(new Date());
  const tomorrow = today.add('day', 1);

  function getIcon(name: string) {
    return picker.renderRoot.querySelector(`[name='${name}']`)!;
  }

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
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

    it('is accessible (open state) - default dropdown mode', async () => {
      picker.open = true;
      await elementUpdated(picker);

      await expect(picker).shadowDom.to.be.accessible();
      await expect(picker).lightDom.to.be.accessible();
    });

    it('is accessible (open state) - dialog mode', async () => {
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
        html`<igc-date-range-picker single-input></igc-date-range-picker>`
      );

      expect(picker.singleInput).to.equal(true);
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
      const attributeValue = `${today.native.toISOString()}, ${tomorrow.native.toISOString()}`;
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          value="${attributeValue}"
        ></igc-date-range-picker>`
      );
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue);
    });

    it('should keep the calendar selection and input values on changing the mode', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue);

      picker.mode = 'dialog';
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue);
    });

    it('should keep the calendar selection and input values on switching to singleInput and back', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );
      checkSelectedRange(picker, expectedValue);

      picker.singleInput = true;
      await elementUpdated(picker);
      checkSelectedRange(picker, expectedValue, true);
      picker.singleInput = false;
      await elementUpdated(picker);
      checkSelectedRange(picker, expectedValue);
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

      picker.singleInput = true;
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
  });
  describe('Interactions', () => {
    describe('Selection via the calendar', () => {
      it('should select a single date in dropdown mode and emit igcChange', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.open = true;
        await elementUpdated(picker);

        await selectDates(today, null, calendar);

        expect(eventSpy).calledWith('igcChange');
        expect(picker.value?.start).to.deep.equal(today.native);
        expect(picker.value?.end).to.deep.equal(today.native);

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
        expect(picker.value?.start).to.deep.equal(today.native);
        expect(picker.value?.end).to.deep.equal(tomorrow.native);

        const popover = picker.renderRoot.querySelector('igc-popover');
        // with the second click, the calendar closes
        expect(popover?.hasAttribute('open')).to.equal(false);
      });

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
        expect(picker.value?.start).to.deep.equal(today.native);
        expect(picker.value?.end).to.deep.equal(tomorrow.native);

        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
      });

      it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = today.add('day', -2);
        const date2 = today.add('day', 2);
        picker.value = { start: date1.native, end: date2.native };
        await elementUpdated(picker);
        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);

        expect(eventSpy).not.to.be.calledWith('igcChange');
        let dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(true);

        const cancelBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]'
        ) as HTMLButtonElement;
        cancelBtn?.click();
        await elementUpdated(picker);

        expect(eventSpy).not.to.be.calledWith('igcChange');
        picker.value = { start: date1.native, end: date2.native };
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
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
    describe('Interactions with the intputs and the open and clear buttons', () => {
      it('should emit or not igcInput according to nonEditable property', async () => {
        const expectedValue = new Date();
        const eventSpy = spy(picker, 'emitEvent');

        dateTimeInputs[0].focus();
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledOnceWith('igcInput');
        eventSpy.resetHistory();
        expect(dateTimeInputs[0].value).to.not.be.null;
        expect(dateTimeInputs[0].value?.getTime()).to.be.closeTo(
          expectedValue.getTime(),
          5
        );

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

        expect(eventSpy).not.called;
        expect(picker.value).to.deep.equal({ start: null, end: null });
      });

      it('should open the picker on calendar show icon click in dropdown mode', async () => {
        simulateClick(getIcon(pickerShowIcon));
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

        simulateClick(getIcon(pickerShowIcon));
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
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        simulateClick(getIcon(pickerClearIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(picker.value).to.deep.equal({ start: null, end: null });
      });

      it('should not open the picker in dialog mode when clicking the clear icon', async () => {
        picker.mode = 'dialog';
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        simulateClick(getIcon(pickerClearIcon));
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        picker.value = { start: null, end: null };
      });
    });
  });
});

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
  singleInput = false
) => {
  const calendar = picker.renderRoot.querySelector(
    IgcCalendarComponent.tagName
  )!;

  expect(picker.value?.start).to.deep.equal(expectedValue?.start);
  expect(picker.value?.end).to.deep.equal(expectedValue?.end);

  if (singleInput) {
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
    expect(inputs[0].value).to.deep.equal(expectedValue?.start);
    expect(inputs[1].value).to.deep.equal(expectedValue?.end);
  }

  // Calendar values are still expected as array:
  if (expectedValue?.start && expectedValue?.end) {
    expect(calendar.values).to.deep.equal([
      expectedValue.start,
      expectedValue.end,
    ]);
  } else if (expectedValue?.start) {
    expect(calendar.values).to.deep.equal([expectedValue.start]);
  } else {
    expect(calendar.values).to.deep.equal([]);
  }
};
