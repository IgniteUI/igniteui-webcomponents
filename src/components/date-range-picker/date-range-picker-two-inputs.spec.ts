import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';
import IgcCalendarComponent from '../calendar/calendar.js';
import { CalendarDay } from '../calendar/model.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  checkDatesEqual,
  isFocused,
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import type IgcDialogComponent from '../dialog/dialog.js';
import IgcDateRangePickerComponent from './date-range-picker.js';
import {
  checkSelectedRange,
  getIcon,
  selectDates,
} from './date-range-picker.utils.spec.js';

describe('Date range picker - two inputs', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let dateTimeInputs: Array<IgcDateTimeInputComponent>;
  let calendar: IgcCalendarComponent;

  const toggleIcon = 'today';
  const clearIcon = 'input_clear';
  const today = CalendarDay.today;
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
        html`<igc-date-range-picker mode="dropdown" use-two-inputs>
          <p slot="title">Custom title</p>
        </igc-date-range-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.be.null;
      expect(picker.useTwoInputs).to.be.true;
    });

    it('should render title slot elements in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker mode="dialog" use-two-inputs>
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
  });
  describe('Properties', () => {
    it('should set value through attribute correctly in case the date values are valid ISO 8601 strings', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      const attributeValue = { start: today.native, end: tomorrow.native };
      picker.setAttribute('value', JSON.stringify(attributeValue));
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue);
    });
    it('should keep the calendar selection and input values on changing the mode', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          use-two-inputs
          .value="${expectedValue}"
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue);

      picker.mode = 'dialog';
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue);
    });

    it('should modify value only through calendar selection and not input when nonEditable is true', async () => {
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

    it('should set properties of the inputs correctly', async () => {
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
    });
  });
  describe('Localization', () => {
    it('should properly set displayFormat to the set of predefined formats', async () => {
      const predefinedFormats = ['short', 'medium', 'long', 'full'];

      for (const format of predefinedFormats) {
        picker.displayFormat = format;
        await elementUpdated(picker);

        dateTimeInputs = Array.from(
          picker.renderRoot.querySelectorAll(IgcDateTimeInputComponent.tagName)
        );
        expect(dateTimeInputs[0].displayFormat).to.equal(`${format}Date`);
        expect(dateTimeInputs[1].displayFormat).to.equal(`${format}Date`);
      }
    });
  });
  describe('Methods', () => {
    it('should clear the input on invoking clear()', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.value = { start: today.native, end: tomorrow.native };
      await elementUpdated(picker);

      expect(dateTimeInputs[0].value).to.equal(picker.value.start);
      expect(dateTimeInputs[1].value).to.equal(picker.value.end);
      picker.clear();
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      expect(picker.value).to.deep.equal(null);
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

      it('should swap the selected dates after input if the end is earlier than the start', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const aMonthAgo = today.add('month', -1);
        picker.value = null;
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        eventSpy.resetHistory();

        dateTimeInputs[1].focus();
        // first arrow sets today, second sets aMonthAgo
        dateTimeInputs[1].setSelectionRange(0, 1); // make sure caret is on the month part (MM/dd/yyyy)
        simulateKeyboard(dateTimeInputs[1], arrowDown);
        simulateKeyboard(dateTimeInputs[1], arrowDown);
        await elementUpdated(picker);

        dateTimeInputs[1].blur();
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, {
          start: aMonthAgo.native,
          end: today.native,
        });
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
        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });

        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
      });

      it('should select a range of dates in dialog mode and emit igcChange when clicked outside of dialog', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);
        await selectDates(today, tomorrow, calendar);

        expect(eventSpy).not.to.be.calledWith('igcChange');
        let dialog = picker.renderRoot.querySelector(
          'igc-dialog'
        ) as IgcDialogComponent;
        const nativeDialog = dialog.renderRoot.querySelector('dialog')!;
        expect(dialog?.hasAttribute('open')).to.equal(true);

        const { x, y } = dialog.getBoundingClientRect();
        simulateClick(nativeDialog, { clientX: x + 1, clientY: y - 1 });
        await elementUpdated(dialog);

        await waitUntil(() => eventSpy.calledWith('igcClosed'));
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });

        dialog = picker.renderRoot.querySelector(
          'igc-dialog'
        ) as IgcDialogComponent;
        expect(dialog?.hasAttribute('open')).to.equal(false);
      });

      it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 10,
        });
        const date2 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 14,
        });
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);
        expect(eventSpy).not.to.be.calledWith('igcChange');
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
        const date1 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 10,
        });
        const date2 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 14,
        });
        picker.value = null;
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);
        expect(eventSpy).not.to.be.calledWith('igcChange');
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

      it('should not emit igcChange when escape is pressed and the value should be the initial value', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 10,
        });
        const date2 = new CalendarDay({
          year: today.year,
          month: today.month,
          date: 14,
        });
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        await selectDates(date1, date2, calendar);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        let dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(true);
        checkSelectedRange(picker, { start: date1.native, end: date2.native });

        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);
        await elementUpdated(dateTimeInputs[0]);
        await elementUpdated(dateTimeInputs[1]);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);

        checkSelectedRange(picker, {
          start: today.native,
          end: tomorrow.native,
        });
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
        expect(picker.value).to.deep.equal(null);
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

      it('should open the picker when clicking the input in dialog mode', async () => {
        picker.mode = 'dialog';
        await elementUpdated(picker);

        simulateClick(dateTimeInputs[0].renderRoot.querySelector('input')!);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
      });

      it('should clear the inputs on clicking the clear icon', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);

        simulateClick(getIcon(picker, clearIcon));

        dateTimeInputs[0].blur();
        await elementUpdated(dateTimeInputs[0]);

        expect(isFocused(dateTimeInputs[0])).to.be.false;
        expect(eventSpy).to.be.calledWith('igcChange', {
          detail: { start: null, end: null },
        });
        expect(picker.open).to.be.false;
        expect(picker.value).to.deep.equal({ start: null, end: null });
        expect(dateTimeInputs[0].value).to.be.null;
        expect(dateTimeInputs[1].value).to.be.null;
      });

      it('should emit igcInput and igcChange on input value change', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: today.native, end: null },
        });
        eventSpy.resetHistory();

        dateTimeInputs[0].setSelectionRange(0, 1); // make sure caret is on the month part (MM/dd/yyyy)
        simulateKeyboard(dateTimeInputs[0], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: today.add('month', -1).native, end: null },
        });
        eventSpy.resetHistory();

        dateTimeInputs[0].blur();
        expect(eventSpy).calledWith('igcChange', {
          detail: { start: today.add('month', -1).native, end: null },
        });
      });

      it('should set the calendar active date to the altered date of the range while typing', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const aMonthAgo = today.add('month', -1);
        const twoMonthsAgo = today.add('month', -2);
        picker.value = null;
        picker.open = true;
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        dateTimeInputs[0].setSelectionRange(0, 1); // make sure caret is on the month part (MM/dd/yyyy)
        simulateKeyboard(dateTimeInputs[0], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        expect(eventSpy).not.calledWith('igcChange');
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[0].value!, today.native);
        // typing a single date does not select a range in the calendar
        checkSelectedRange(picker, { start: today.native, end: null });
        checkDatesEqual(calendar.activeDate, today.native);

        dateTimeInputs[1].focus();
        expect(isFocused(dateTimeInputs[1])).to.be.true;

        // emit igcChange on losing focus of the edited input
        expect(eventSpy).calledWith('igcChange', {
          detail: { start: today.native, end: null },
        });
        eventSpy.resetHistory();

        dateTimeInputs[1].setSelectionRange(0, 1);
        simulateKeyboard(dateTimeInputs[1], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[1].value!, today.native);
        // typing the end date as well results in a selected range of a single date
        checkSelectedRange(picker, { start: today.native, end: today.native });
        checkDatesEqual(calendar.activeDate, today.native);

        simulateKeyboard(dateTimeInputs[1], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[1].value!, aMonthAgo.native);
        // changing the end date while typing alters the selected range
        // the active date is set to the typed date, in this case the end one
        checkSelectedRange(picker, {
          start: today.native,
          end: aMonthAgo.native,
        });
        checkDatesEqual(calendar.activeDate, aMonthAgo.native);

        // on losing focus of the end input, the dates are swapped since end is earlier than start
        dateTimeInputs[0].focus();
        expect(isFocused(dateTimeInputs[0])).to.be.true;
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange', {
          detail: { start: aMonthAgo.native, end: today.native },
        });
        eventSpy.resetHistory();

        checkSelectedRange(picker, {
          start: aMonthAgo.native,
          end: today.native,
        });
        checkDatesEqual(calendar.activeDate, aMonthAgo.native);

        dateTimeInputs[0].setSelectionRange(0, 1);
        simulateKeyboard(dateTimeInputs[0], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        checkDatesEqual(dateTimeInputs[0].value!, twoMonthsAgo.native);
        checkSelectedRange(picker, {
          start: twoMonthsAgo.native,
          end: today.native,
        });
        checkDatesEqual(calendar.activeDate, twoMonthsAgo.native);
      });

      it('should set the calendar active date to the typed date and reflect selection in calendar', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.value = null;
        picker.open = true;
        await elementUpdated(picker);

        const input1 = dateTimeInputs[0].shadowRoot!.querySelector('input')!;
        dateTimeInputs[0].focus();
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        dateTimeInputs[0].setSelectionRange(0, 0);
        simulateInput(input1, { value: '04/24/2025', inputType: 'insertText' });
        await elementUpdated(picker);

        const expectedDate = CalendarDay.today.set({
          month: 3,
          date: 24,
          year: 2025,
        }).native;
        checkSelectedRange(picker, { start: expectedDate, end: null });
        checkDatesEqual(calendar.activeDate, expectedDate);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: expectedDate, end: null },
        });

        const input2 = dateTimeInputs[1].shadowRoot!.querySelector('input')!;
        dateTimeInputs[1].focus();
        expect(isFocused(dateTimeInputs[1])).to.be.true;

        dateTimeInputs[1].setSelectionRange(0, 0);
        simulateInput(input2, { value: '04/25/2025', inputType: 'insertText' });
        await elementUpdated(picker);

        const expectedDate2 = CalendarDay.today.set({
          month: 3,
          date: 25,
          year: 2025,
        }).native;
        checkSelectedRange(picker, { start: expectedDate, end: expectedDate2 });
        checkDatesEqual(calendar.activeDate, expectedDate2);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: expectedDate, end: expectedDate2 },
        });
      });

      it('should set the calendar active date to any of the defined dates start/end', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const march1st2025 = today.set({
          month: 2,
          date: 1,
          year: 2025,
        }).native;
        const june3rd2025 = today.set({ month: 5, date: 3, year: 2025 }).native;
        picker.value = { start: march1st2025, end: june3rd2025 };
        picker.open = true;
        await elementUpdated(picker);

        // initially set active date as per assigned value
        checkDatesEqual(calendar.activeDate, march1st2025);

        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        const input1 = dateTimeInputs[0].shadowRoot!.querySelector('input')!;
        dateTimeInputs[0].setSelectionRange(0, input1.value.length);
        simulateInput(input1, { inputType: 'deleteContentBackward' });
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        // the active date is set to the end date as it is the first defined in the range
        checkDatesEqual(calendar.activeDate, june3rd2025);

        // when end value is cleared as well, the last active date remains
        const input2 = dateTimeInputs[1].shadowRoot!.querySelector('input')!;
        dateTimeInputs[1].setSelectionRange(0, input2.value.length);
        simulateInput(input2, { inputType: 'deleteContentBackward' });
        await elementUpdated(picker);

        checkDatesEqual(calendar.activeDate, june3rd2025);
      });
      it('should toggle the calendar with keyboard combinations and keep focus', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        dateTimeInputs[0].focus();

        expect(isFocused(dateTimeInputs[0])).to.be.true;

        simulateKeyboard(dateTimeInputs[0], [altKey, arrowDown]);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
        expect(isFocused(dateTimeInputs[0])).to.be.false;
        expect(eventSpy.firstCall).calledWith('igcOpening');
        expect(eventSpy.lastCall).calledWith('igcOpened');
        eventSpy.resetHistory();

        simulateKeyboard(dateTimeInputs[0], [altKey, arrowUp]);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(isFocused(dateTimeInputs[0])).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcClosing');
        expect(eventSpy.lastCall).calledWith('igcClosed');

        simulateKeyboard(dateTimeInputs[0], [altKey, arrowDown]);
        await elementUpdated(picker);
        eventSpy.resetHistory();

        simulateKeyboard(dateTimeInputs[0], escapeKey);
        await elementUpdated(picker);
        await elementUpdated(dateTimeInputs[0]);

        expect(picker.open).to.be.false;
        expect(isFocused(dateTimeInputs[0])).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcClosing');
        expect(eventSpy.lastCall).calledWith('igcClosed');
      });
    });
    describe('Readonly state', () => {
      beforeEach(async () => {
        picker.readOnly = true;
        await elementUpdated(picker);
      });
      it('should not modify value through selection or typing when readOnly is true', async () => {
        const eventSpy = spy(picker, 'emitEvent');
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
      });
      it('should not clear the inputs via the clear icon when readOnly is true', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const testValue = { start: today.native, end: tomorrow.native };
        picker.value = testValue;
        await elementUpdated(picker);

        simulateClick(getIcon(picker, clearIcon));

        expect(picker.value).to.deep.equal(testValue);
        expect(eventSpy).not.called;
        checkSelectedRange(picker, testValue);
      });
      it('should not open the calendar on clicking the input - dropdown mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const nativeInput =
          dateTimeInputs[0].renderRoot.querySelector('input')!;
        simulateClick(nativeInput);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(eventSpy).not.called;
      });
      it('should not open the calendar on clicking the input - dialog mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.mode = 'dialog';
        await elementUpdated(picker);

        const nativeInput =
          dateTimeInputs[0].renderRoot.querySelector('input')!;
        simulateClick(nativeInput);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(eventSpy).not.called;
      });
    });
  });
  describe('Slots', () => {
    it('should render slotted elements', async () => {
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
            picker.open = true;
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
          prerequisite: async () => await picker.hide(),
        },
        {
          slot: 'calendar-icon-end',
          tagName: 'span',
          content: '^-end',
          prerequisite: async () => await picker.hide(),
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

      for (const testCase of slotTests) {
        await testCase.prerequisite?.();
        await elementUpdated(picker);

        const slot = picker.renderRoot.querySelector(
          `slot[name="${testCase.slot}"]`
        ) as HTMLSlotElement;
        const elements = slot.assignedElements();

        expect((elements[0] as HTMLElement).innerText).to.equal(
          testCase.content
        );
        expect(elements[0].tagName.toLowerCase()).to.equal(testCase.tagName);

        const rendered = elements[0].getBoundingClientRect().width > 0;
        expect(rendered, `Element for slot "${testCase.slot}" is not rendered`)
          .to.be.true;
      }
    });
  });
});
