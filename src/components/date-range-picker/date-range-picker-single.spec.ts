import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import sinon, { spy } from 'sinon';
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
    input = rangeInput.renderRoot.querySelector('input')!;

    calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;
  });

  afterEach(() => {
    sinon.restore();
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

      input.blur();
      await elementUpdated(input);

      checkSelectedRange(picker, picker.value, false);
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
      const rangeInput = picker.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;
      const input = rangeInput.renderRoot.querySelector('input')!;
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

      const rangeInput = picker.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;
      const input = rangeInput.renderRoot.querySelector('input')!;
      expect(input.value).to.equal('4/9/2025 - 4/10/2025');

      picker.displayFormat = 'yyyy-MM-dd';
      await elementUpdated(picker);

      expect(input.value).to.equal('2025-04-09 - 2025-04-10');
    });

    it('should use inputFormat for display when displayFormat is not set', async () => {
      picker.useTwoInputs = false;
      picker.inputFormat = 'yyyy-MM-dd';
      await elementUpdated(picker);

      input = getInput(picker);
      expect(input.placeholder).to.equal('yyyy-MM-dd - yyyy-MM-dd');

      picker.value = {
        start: CalendarDay.from(new Date(2025, 3, 9)).native,
        end: CalendarDay.from(new Date(2025, 3, 10)).native,
      };
      await elementUpdated(picker);

      expect(input.value).to.equal('2025-04-09 - 2025-04-10');

      input.focus();
      await elementUpdated(input);
      expect(input.value).to.equal('2025-04-09 - 2025-04-10');

      input.blur();
      await elementUpdated(input);

      expect(input.value).to.equal('2025-04-09 - 2025-04-10');
    });

    it('should apply inputFormat to empty mask and display value when set initially', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          display-format="yyyy-MM-dd hh:mm tt"
        ></igc-date-range-picker>`
      );
      picker.useTwoInputs = false;
      await elementUpdated(picker);

      const rangeInput = picker.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;
      input = rangeInput.renderRoot.querySelector('input')!;

      // Placeholder uses inputFormat (the default locale format)
      expect(input.placeholder).to.equal('MM/dd/yyyy - MM/dd/yyyy');

      input.focus();
      await elementUpdated(input);

      // When focused, the mask uses inputFormat, not displayFormat
      expect(input.value).to.contain('__/__/____');

      picker.value = {
        start: new Date(2025, 3, 9, 14, 30, 0),
        end: new Date(2025, 3, 10, 9, 15, 0),
      };
      await elementUpdated(picker);

      // When focused with a value, still uses inputFormat for editing
      expect(input.value).to.equal('04/09/2025 - 04/10/2025');

      input.blur();
      await elementUpdated(input);

      // When blurred (not focused), uses displayFormat for display
      expect(input.value).to.equal('2025-04-09 02:30 PM - 2025-04-10 09:15 AM');
    });

    it('should initialize default mask based on locale when no inputFormat is set', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker></igc-date-range-picker>`
      );
      picker.useTwoInputs = false;
      await elementUpdated(picker);

      const rangeInput = picker.renderRoot.querySelector(
        IgcDateRangeInputComponent.tagName
      )!;
      input = rangeInput.renderRoot.querySelector('input')!;

      expect(input.placeholder).to.equal('MM/dd/yyyy - MM/dd/yyyy');

      picker.locale = 'de';
      await elementUpdated(picker);

      expect(input.placeholder).to.equal('dd.MM.yyyy - dd.MM.yyyy');
    });

    it('should target the last end position date part when the input receives focus by default', async () => {
      picker.useTwoInputs = false;
      await elementUpdated(picker);

      input = getInput(picker);
      input.focus();
      await elementUpdated(input);

      // Press arrow up without selecting a specific part
      // Should increment the last end position part (year)
      const initialDate = new Date(2025, 0, 15); // Jan 15, 2025
      picker.value = { start: initialDate, end: initialDate };
      await elementUpdated(picker);

      expect(input.value).to.equal('01/15/2025 - 01/15/2025');

      // Blur and refocus to reset cursor
      input.blur();
      await elementUpdated(input);
      input.focus();
      await elementUpdated(input);

      // Arrow up should increment the year (last date part)
      simulateKeyboard(input, arrowUp);
      await elementUpdated(input);

      expect(input.value).to.equal('01/15/2025 - 01/15/2026');
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

    it('should stepUp/stepDown when input is not focused', async () => {
      picker.useTwoInputs = false;
      picker.value = {
        start: new Date(2025, 0, 15), // Jan 15, 2025
        end: new Date(2025, 0, 16), // Jan 16, 2025
      };
      await elementUpdated(picker);

      input = getInput(picker);
      expect(isFocused(input)).to.be.false;
      expect(input.value).to.equal('1/15/2025 - 1/16/2025');

      // stepUp should increment the default date part (first start position part - Month)
      rangeInput.stepUp();
      await elementUpdated(rangeInput);

      expect(rangeInput.value?.start?.getMonth()).to.equal(1);
      expect(rangeInput.value?.start?.getDate()).to.equal(15);
      expect(input.value).to.equal('2/15/2025 - 1/16/2025');

      // stepDown should decrement the default date part (Month)
      rangeInput.stepDown();
      await elementUpdated(rangeInput);

      expect(rangeInput.value?.start?.getMonth()).to.equal(0);
      expect(rangeInput.value?.start?.getDate()).to.equal(15);
      expect(input.value).to.equal('1/15/2025 - 1/16/2025');
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

        input.blur();
        await elementUpdated(input);

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
        await elementUpdated(input);

        input.setSelectionRange(2, 2);
        await elementUpdated(input);
        await elementUpdated(picker);

        expect(isFocused(input)).to.be.true;
        //Move selection to the end of 'day' part.
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(rangeInput);
        await elementUpdated(input);

        expect(input.selectionStart).to.equal(5);
        expect(input.selectionEnd).to.equal(5);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);
        await elementUpdated(input);

        expect(input.value).to.equal('04/23/2025 - 04/23/2025');

        //Move selection to the end of 'year' part.
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(picker);
        await elementUpdated(input);

        expect(input.selectionStart).to.equal(10);
        expect(input.selectionEnd).to.equal(10);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);
        await elementUpdated(input);
        expect(input.value).to.equal('04/23/2026 - 04/23/2025');

        //Move selection to the end of 'month' part of the end date.
        // skips the separator parts when navigating (right direction)
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(input);

        expect(input.selectionStart).to.equal(15);
        expect(input.selectionEnd).to.equal(15);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);

        expect(input.value).to.equal('04/23/2026 - 05/23/2025');

        // skips the separator parts when navigating (left direction)
        input.setSelectionRange(13, 13); // set selection to the start of the month part of the end date

        simulateKeyboard(input, [ctrlKey, arrowLeft]);
        await elementUpdated(rangeInput);
        await elementUpdated(input);

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
        input.blur();
        await elementUpdated(input);

        checkSelectedRange(
          picker,
          { start: today.native, end: today.native },
          false
        );
      });

      it('should set the range to current date with Ctrl+; keyboard combination', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.useTwoInputs = false;
        picker.value = {
          start: new Date(2025, 0, 1),
          end: new Date(2025, 0, 2),
        };
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        await elementUpdated(input);

        expect(input.value).to.equal('01/01/2025 - 01/02/2025');

        simulateKeyboard(input, [ctrlKey, ';']);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: today.native, end: today.native },
        });

        input.blur();
        await elementUpdated(input);

        checkSelectedRange(
          picker,
          { start: today.native, end: today.native },
          false
        );
      });

      it('should spin AM/PM with arrow keys', async () => {
        const startDate = new Date(2025, 3, 14, 9, 30, 0); // 9:30 AM
        const endDate = new Date(2025, 3, 15, 10, 45, 0); // 10:45 AM

        picker.useTwoInputs = false;
        picker.inputFormat = 'MM/dd/yyyy hh:mm tt';
        picker.value = { start: startDate, end: endDate };
        await elementUpdated(picker);

        input = getInput(picker);
        input.focus();
        await elementUpdated(input);

        // hh format uses leading zeros for hours (09, 10), tt is AM/PM
        expect(input.value).to.contain('09:30 AM');
        expect(input.value).to.contain('10:45 AM');

        const amIndex = input.value.indexOf('AM');
        input.focus();
        input.setSelectionRange(amIndex, amIndex);
        await elementUpdated(picker);
        await elementUpdated(input);

        simulateKeyboard(input, arrowUp);
        await elementUpdated(picker);
        await elementUpdated(input);

        expect(input.value).to.contain('09:30 PM');
        expect(input.value).to.contain('10:45 AM');
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
        await elementUpdated(input);
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
        expect(input.value).to.equal('1/1/2000 - 4/23/2025');
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
