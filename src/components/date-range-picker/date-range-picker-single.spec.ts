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
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  isFocused,
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '../common/utils.spec.js';
import type IgcDialogComponent from '../dialog/dialog.js';
import IgcInputComponent from '../input/input.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import IgcDateRangePickerComponent from './date-range-picker.js';
import {
  checkSelectedRange,
  getIcon,
  getInput,
  selectDates,
} from './date-range-picker.utils.spec.js';

describe('Date range picker - single input', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let rangeInput: IgcDateRangeInputComponent;
  let input: HTMLInputElement;
  let calendar: IgcCalendarComponent;

  const clearIcon = 'input_clear';
  const today = CalendarDay.today;
  const tomorrow = today.add('day', 1);

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
    );
    rangeInput = picker.renderRoot.querySelector(
      IgcDateRangeInputComponent.tagName
    )!;
    rangeInput.renderRoot.querySelector('input')!;

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
      expect(picker.useTwoInputs).to.be.false;
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
  });
  describe('Properties', () => {
    it('should set value through attribute correctly in case the date values are valid ISO 8601 strings', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      const attributeValue = { start: today.native, end: tomorrow.native };
      picker.setAttribute('value', JSON.stringify(attributeValue));
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue, false);
    });

    it('should keep the calendar selection and input values on changing the mode', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value=${expectedValue}
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue, false);

      picker.mode = 'dialog';
      await elementUpdated(picker);

      checkSelectedRange(picker, expectedValue, false);
    });

    it('should modify value only through calendar selection and not input', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      // current implementation of DRP single input is not editable;
      // to refactor when the input is made editable
      picker.nonEditable = true;
      await elementUpdated(picker);

      input = getInput(picker);
      input.focus();
      simulateKeyboard(input, arrowDown);
      await elementUpdated(picker);

      expect(isFocused(input)).to.be.true;
      expect(input.value).to.equal('');
      expect(picker.value).to.deep.equal({ start: null, end: null });
      expect(calendar.values).to.deep.equal([]);
      expect(eventSpy).not.to.be.called;

      await picker.show();
      await selectDates(today, tomorrow, calendar);
      checkSelectedRange(
        picker,
        { start: today.native, end: tomorrow.native },
        false
      );
      expect(eventSpy).calledWith('igcChange');
    });

    it('should set properties of the input correctly', async () => {
      const propsSingle = {
        required: true,
        disabled: true,
        placeholder: 'Sample placeholder',
        outlined: true,
      };

      Object.assign(picker, propsSingle);
      await elementUpdated(picker);

      const input = picker.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;
      for (const [prop, value] of Object.entries(propsSingle)) {
        expect((input as any)[prop], `Fail for ${prop}`).to.equal(value);
      }
    });
  });

  describe('Localization', () => {
    it('should properly set displayFormat to the set of predefined formats - single input', async () => {
      const predefinedFormats = [
        { format: 'short', formattedValue: '4/14/25' },
        { format: 'medium', formattedValue: 'Apr 14, 2025' },
        { format: 'long', formattedValue: 'April 14, 2025' },
        { format: 'full', formattedValue: 'Monday, April 14, 2025' },
      ];
      picker.value = {
        start: CalendarDay.from(new Date(2025, 3, 14)).native,
        end: CalendarDay.from(new Date(2025, 3, 14)).native,
      };
      picker.useTwoInputs = false;
      await elementUpdated(picker);

      for (const obj of predefinedFormats) {
        picker.displayFormat = obj.format;
        await elementUpdated(picker);

        input = getInput(picker);
        expect(input.value).to.equal(
          `${obj.formattedValue} - ${obj.formattedValue}`
        );
      }
    });

    it('should update the masked value with the locale', async () => {
      expect(picker.displayFormat).to.equal('M/d/yyyy');

      picker.value = {
        start: CalendarDay.from(new Date(2025, 3, 9)).native,
        end: CalendarDay.from(new Date(2025, 3, 10)).native,
      };
      await elementUpdated(picker);
      const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
      expect(input.value).to.equal('4/9/2025 - 4/10/2025');

      picker.locale = 'bg';
      await elementUpdated(picker);

      expect(input.value.normalize('NFKC')).to.equal(
        '9.04.2025 г. - 10.04.2025 г.'
      );
    });
    it('should set the default placeholder of the single input to the input format (like dd/MM/yyyy - dd/MM/yyyy)', async () => {
      picker.useTwoInputs = false;
      await elementUpdated(picker);

      input = getInput(picker);
      expect(input.placeholder).to.equal(
        `${picker.inputFormat} - ${picker.inputFormat}`
      );

      picker.inputFormat = 'yyyy-MM-dd';
      await elementUpdated(picker);

      expect(input.placeholder).to.equal('yyyy-MM-dd - yyyy-MM-dd');
    });
    it('should set the mask of the single input per the display format (like dd/MM/yyyy - dd/MM/yyyy)', async () => {
      picker.useTwoInputs = false;
      await elementUpdated(picker);
      expect(picker.displayFormat).to.equal('M/d/yyyy');

      picker.value = {
        start: CalendarDay.from(new Date(2025, 3, 9)).native,
        end: CalendarDay.from(new Date(2025, 3, 10)).native,
      };
      await elementUpdated(picker);

      const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
      expect(input.value).to.equal('4/9/2025 - 4/10/2025');

      picker.displayFormat = 'yyyy-MM-dd';
      await elementUpdated(picker);

      expect(input.value).to.equal('2025-04-09 - 2025-04-10');
    });
  });
  describe('Methods', () => {
    it('should clear the input on invoking clear()', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.value = {
        start: CalendarDay.from(new Date(2025, 3, 9)).native,
        end: CalendarDay.from(new Date(2025, 3, 10)).native,
      };
      await elementUpdated(picker);

      expect(input.value).to.equal('4/9/2025 - 4/10/2025');

      picker.clear();
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      expect(picker.value).to.deep.equal(null);
      expect(input.value).to.equal('');
    });
    it('should select a date range on invoking select', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      expect(picker.value).to.deep.equal({ start: null, end: null });
      const start = CalendarDay.from(new Date(2025, 3, 9)).native;
      const end = CalendarDay.from(new Date(2025, 3, 10)).native;
      picker.select({
        start,
        end,
      });
      await elementUpdated(picker);

      expect(picker.value).to.deep.equal({
        start,
        end,
      });
      expect(input.value).to.equal('4/9/2025 - 4/10/2025');
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
        checkSelectedRange(
          picker,
          { start: today.native, end: today.native },
          false
        );

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
        checkSelectedRange(
          picker,
          {
            start: today.native,
            end: tomorrow.native,
          },
          false
        );

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
        checkSelectedRange(
          picker,
          {
            start: today.native,
            end: tomorrow.native,
          },
          false
        );

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
        checkSelectedRange(
          picker,
          {
            start: today.native,
            end: tomorrow.native,
          },
          false
        );

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
        checkSelectedRange(
          picker,
          { start: date1.native, end: date2.native },
          false
        );

        const cancelBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]'
        ) as HTMLButtonElement;
        cancelBtn?.click();
        await elementUpdated(picker);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
        checkSelectedRange(
          picker,
          {
            start: today.native,
            end: tomorrow.native,
          },
          false
        );
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
        checkSelectedRange(
          picker,
          { start: date1.native, end: date2.native },
          false
        );

        const cancelBtn = picker.shadowRoot!.querySelector(
          'igc-button[slot="footer"]'
        ) as HTMLButtonElement;
        cancelBtn?.click();
        await elementUpdated(picker);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);

        input = getInput(picker);
        calendar = picker.renderRoot.querySelector(
          IgcCalendarComponent.tagName
        )!;

        expect(input.value).to.equal('');
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
        checkSelectedRange(
          picker,
          { start: date1.native, end: date2.native },
          false
        );

        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);
        await elementUpdated(input);
        expect(eventSpy).not.to.be.calledWith('igcChange');
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);

        checkSelectedRange(
          picker,
          {
            start: today.native,
            end: tomorrow.native,
          },
          false
        );
      });
    });

    describe('Interactions with the inputs and the open and clear buttons', () => {
      it('should not open the picker when clicking the input in dropdown mode', async () => {
        const input = picker.renderRoot.querySelector(
          IgcDateRangeInputComponent.tagName
        )!;
        simulateClick(input);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
      });

      it('should open the picker when clicking the input in dialog mode', async () => {
        picker.mode = 'dialog';
        await elementUpdated(picker);

        const rangeInput = picker.renderRoot.querySelector(
          IgcDateRangeInputComponent.tagName
        )!;
        const input = rangeInput.renderRoot.querySelector('input')!;
        input.focus();
        simulateClick(input);
        await elementUpdated(picker);
        expect(picker.open).to.be.true;
      });

      it('should clear the inputs on clicking the clear icon', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.useTwoInputs = false;
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        await elementUpdated(input);

        simulateClick(getIcon(picker, clearIcon));
        await elementUpdated(picker);

        input.blur();
        await elementUpdated(input);

        expect(isFocused(input)).to.be.false;
        expect(eventSpy).to.be.calledWith('igcChange', {
          detail: { start: null, end: null },
        });
        expect(picker.open).to.be.false;
        expect(picker.value).to.deep.equal({ start: null, end: null });
        expect(input.value).to.equal('');
      });
      it('should support date-range typing for single input', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.useTwoInputs = false;

        await elementUpdated(picker);

        const expectedStart = CalendarDay.today.set({
          year: 2025,
          month: 3,
          date: 22,
        });

        const expectedEnd = expectedStart.add('day', 1);
        input = getInput(picker);
        input.focus();
        input.setSelectionRange(0, 1);
        await elementUpdated(picker);

        let value = '04/22/2025 - 04/23/2025';
        simulateInput(input as unknown as HTMLInputElement, {
          value,
          inputType: 'insertText',
        });
        input.setSelectionRange(value.length - 1, value.length);
        await elementUpdated(picker);

        expect(eventSpy.lastCall).calledWith('igcInput', {
          detail: { start: expectedStart.native, end: expectedEnd.native },
        });

        eventSpy.resetHistory();
        picker.clear();
        await elementUpdated(picker);

        input.focus();
        input.setSelectionRange(0, 1);
        await elementUpdated(picker);

        value = '04/22/202504/23/2025'; //not typing the separator characters
        simulateInput(input as unknown as HTMLInputElement, {
          value,
          inputType: 'insertText',
        });

        input.setSelectionRange(value.length - 1, value.length);
        await elementUpdated(picker);

        expect(eventSpy.lastCall).calledWith('igcInput', {
          detail: { start: expectedStart.native, end: expectedEnd.native },
        });

        eventSpy.resetHistory();
        input.blur();
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange', {
          detail: { start: expectedStart.native, end: expectedEnd.native },
        });
      });

      it('should in/decrement the different date parts with arrow up/down', async () => {
        const expectedStart = CalendarDay.today.set({
          year: 2025,
          month: 3,
          date: 22,
        });

        const expectedEnd = expectedStart.add('day', 1);
        const value = { start: expectedStart.native, end: expectedEnd.native };
        picker.useTwoInputs = false;
        picker.value = value;
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        input.setSelectionRange(2, 2);

        expect(isFocused(input)).to.be.true;
        //Move selection to the end of 'day' part.
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(rangeInput);

        expect(input.selectionStart).to.equal(5);
        expect(input.selectionEnd).to.equal(5);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);

        expect(input.value).to.equal('04/23/2025 - 04/23/2025');

        //Move selection to the end of 'year' part.
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(rangeInput);

        expect(input.selectionStart).to.equal(10);
        expect(input.selectionEnd).to.equal(10);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);

        expect(input.value).to.equal('04/23/2026 - 04/23/2025');

        //Move selection to the end of 'month' part of the end date.
        // skips the separator parts when navigating (right direction)
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(rangeInput);

        expect(input.selectionStart).to.equal(15);
        expect(input.selectionEnd).to.equal(15);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);

        expect(input.value).to.equal('04/23/2026 - 05/23/2025');

        // skips the separator parts when navigating (left direction)
        input.setSelectionRange(13, 13); // set selection to the start of the month part of the end date

        simulateKeyboard(input, [ctrlKey, arrowLeft]);
        await elementUpdated(rangeInput);

        expect(input.selectionStart).to.equal(6);
        expect(input.selectionEnd).to.equal(6);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);

        expect(input.value).to.equal('04/23/2027 - 05/23/2025');
      });

      it('should set the range to the current date (start-end) if no value and arrow up/down pressed', async () => {
        picker.useTwoInputs = false;
        picker.value = null;
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        input.setSelectionRange(0, 1);

        expect(isFocused(input)).to.be.true;

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);
        checkSelectedRange(
          picker,

          { start: today.native, end: today.native },

          false
        );
      });

      it('should delete the value on pressing enter (single input)', async () => {
        picker.useTwoInputs = false;
        picker.value = null;
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        input.setSelectionRange(0, input.value.length);

        expect(isFocused(input)).to.be.true;

        simulateInput(input as unknown as HTMLInputElement, {
          inputType: 'deleteContentBackward',
        });
        await elementUpdated(picker);

        input.blur();
        await elementUpdated(rangeInput);
        await elementUpdated(picker);

        expect(input.value).to.equal('');
        expect(picker.value).to.deep.equal(null);
      });

      it('should fill in missing date values (single input)', async () => {
        const expectedStart = CalendarDay.today.set({
          year: 2025,
          month: 3,
          date: 22,
        });

        const expectedEnd = expectedStart.add('day', 1);
        picker.useTwoInputs = false;
        picker.value = { start: expectedStart.native, end: expectedEnd.native };

        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();

        // select start date
        input.setSelectionRange(0, 10);
        expect(isFocused(input)).to.be.true;

        // delete the year value
        simulateKeyboard(input, 'Backspace');
        simulateInput(input as unknown as HTMLInputElement, {
          inputType: 'deleteContentBackward',
        });
        await elementUpdated(picker);

        input.blur();

        await elementUpdated(picker);
        expect(input.value).to.equal('01/01/2000 - 04/23/2025');
      });

      it('should toggle the calendar with keyboard combinations and keep focus', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        input = getInput(picker);
        input.focus();

        expect(isFocused(input)).to.be.true;

        simulateKeyboard(input, [altKey, arrowDown]);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
        expect(isFocused(input)).to.be.false;
        expect(eventSpy.firstCall).calledWith('igcOpening');
        expect(eventSpy.lastCall).calledWith('igcOpened');
        eventSpy.resetHistory();

        simulateKeyboard(input, [altKey, arrowUp]);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(isFocused(input)).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcClosing');
        expect(eventSpy.lastCall).calledWith('igcClosed');
        eventSpy.resetHistory();

        simulateKeyboard(input, [altKey, arrowDown]);
        await elementUpdated(picker);
        eventSpy.resetHistory();

        simulateKeyboard(picker, escapeKey);
        await elementUpdated(picker);
        await elementUpdated(input);

        expect(picker.open).to.be.false;
        expect(isFocused(input)).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcClosing');
        expect(eventSpy.lastCall).calledWith('igcClosed');
      });
    });

    describe('Readonly state', () => {
      const testValue = { start: today.native, end: tomorrow.native };
      beforeEach(async () => {
        picker.readOnly = true;
        picker.value = testValue;
        await elementUpdated(picker);
      });
      it('should not clear the input(s) via the clear icon when readOnly is true', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        simulateClick(getIcon(picker, clearIcon));
        await elementUpdated(picker);

        expect(picker.value).to.deep.equal(testValue);
        expect(eventSpy).not.called;
        checkSelectedRange(picker, testValue, false);
      });

      it('should not open the calendar on clicking the input - dropdown mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const igcInput = picker.renderRoot.querySelector(
          IgcDateRangeInputComponent.tagName
        )!;
        const nativeInput = igcInput.renderRoot.querySelector('input')!;
        simulateClick(nativeInput);
        await elementUpdated(picker);

        expect(picker.open).to.be.false;
        expect(eventSpy).not.called;
      });
      it('should not open the calendar on clicking the input - dialog mode', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.mode = 'dialog';
        await elementUpdated(picker);
        const igcInput = picker.renderRoot.querySelector(
          IgcDateRangeInputComponent.tagName
        )!;
        const nativeInput = igcInput.renderRoot.querySelector('input')!;

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
          slot: 'calendar-icon',
          tagName: 'span',
          content: '^',
          prerequisite: async () => await picker.hide(),
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
