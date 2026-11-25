import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { arrowDown, arrowUp } from '#internals/controllers/key-bindings.js';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  runAriaProjectionTests,
  runExternalLabelAssociationTests,
} from '#internals/testing/form-testbed.spec.js';
import { checkDatesEqual, isFocused } from '#internals/testing/helpers.spec.js';
import {
  simulateBackspaceOver,
  simulateBlur,
  simulateClick,
  simulateInput,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { ValidityHelpers } from '#internals/testing/validity-helpers.spec.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import IgcDateRangePickerComponent from './date-range-picker.js';
import {
  checkSelectedRange,
  getIcon,
  selectDates,
  typeAt,
} from './date-range-picker.utils.spec.js';

describe('Date range picker - two inputs', () => {
  before(() =>
    defineComponents(IgcDateRangePickerComponent, IgcDateRangeInputComponent)
  );

  runExternalLabelAssociationTests({
    tagName: IgcDateRangePickerComponent.tagName,
    hostAttributes: 'use-two-inputs',
    getNativeInput: (host) =>
      (host as IgcDateRangePickerComponent).renderRoot
        .querySelector<IgcDateTimeInputComponent>(
          IgcDateTimeInputComponent.tagName
        )!
        .renderRoot.querySelector('input')!,
  });

  it('describes both native inputs by the host `aria-describedby`', async () => {
    const container = await fixture<HTMLElement>(html`
      <div>
        <span id="range-hint">Pick the dates of your stay</span>
        <igc-date-range-picker
          use-two-inputs
          aria-describedby="range-hint"
        ></igc-date-range-picker>
      </div>
    `);
    const picker = container.querySelector('igc-date-range-picker')!;
    const hint = container.querySelector('#range-hint');
    await elementUpdated(picker);

    for (const editor of picker.renderRoot.querySelectorAll(
      'igc-date-time-input'
    )) {
      await elementUpdated(editor);
      expect(
        editor.renderRoot
          .querySelector('input')!
          .ariaDescribedByElements?.at(-1)
      ).to.equal(hint);
    }
  });

  it('exposes `required` as `aria-required` on both native inputs', async () => {
    const picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker
        use-two-inputs
        required
      ></igc-date-range-picker>`
    );
    const editors = picker.renderRoot.querySelectorAll('igc-date-time-input');
    await elementUpdated(picker);

    expect(editors).to.have.length(2);
    for (const editor of editors) {
      await elementUpdated(editor);
      expect(
        editor.renderRoot.querySelector('input')!.getAttribute('aria-required')
      ).to.equal('true');
    }
  });

  // The start editor.
  runAriaProjectionTests({
    tagName: IgcDateRangePickerComponent.tagName,
    hostAttributes: 'use-two-inputs',
    getNativeInput: (host) =>
      (host as IgcDateRangePickerComponent).renderRoot
        .querySelector<IgcDateTimeInputComponent>(
          IgcDateTimeInputComponent.tagName
        )!
        .renderRoot.querySelector('input')!,
    expected: { hasPopup: 'dialog' },
    getDescription: (host) => [
      (host as IgcDateRangePickerComponent).renderRoot.querySelector(
        '#helper-text'
      )!,
    ],
  });

  // The end editor receives the popup semantics as well, labels excluded.
  runAriaProjectionTests({
    tagName: IgcDateRangePickerComponent.tagName,
    hostAttributes: 'use-two-inputs',
    getNativeInput: (host) =>
      Array.from(
        (
          host as IgcDateRangePickerComponent
        ).renderRoot.querySelectorAll<IgcDateTimeInputComponent>(
          IgcDateTimeInputComponent.tagName
        )
      )[1]!.renderRoot.querySelector('input')!,
    expected: { hasPopup: 'dialog' },
  });

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
    it('should be successfully initialized with value', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value=${expectedValue}
          use-two-inputs
        ></igc-date-range-picker>`
      );

      checkSelectedRange(picker, expectedValue);
    });
  });
  describe('Properties', () => {
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

  describe('Validity of the editors', () => {
    it('reports the picker validity also while the picker is pristine', async () => {
      picker.required = true;
      await elementUpdated(picker);

      expect(picker.checkValidity()).to.be.false;

      for (const editor of dateTimeInputs) {
        expect(editor.checkValidity()).to.be.false;
        expect(editor.reportValidity()).to.be.false;
      }
    });

    it('shows no invalid state on an editor before the picker', async () => {
      // A blur of the start editor alone, as when the focus moves to the end editor.
      picker.min = today.native;
      picker.value = {
        start: today.add('day', -1).native,
        end: tomorrow.native,
      };
      await elementUpdated(picker);

      const [start] = dateTimeInputs;
      simulateBlur(start.renderRoot.querySelector('input')!);
      await elementUpdated(start);

      ValidityHelpers.hasInvalidStyles(picker).to.be.false;
      ValidityHelpers.hasInvalidStyles(start).to.be.false;
    });

    it('shows the invalid state of the picker on both editors at once', () => {
      picker.invalid = true;

      for (const editor of dateTimeInputs) {
        ValidityHelpers.hasInvalidStyles(editor).to.be.true;
      }

      picker.invalid = false;

      for (const editor of dateTimeInputs) {
        ValidityHelpers.hasInvalidStyles(editor).to.be.false;
      }
    });

    it('delegates the editor validity to the picker once it is not pristine', async () => {
      picker.required = true;
      picker.value = { start: null, end: null };
      await elementUpdated(picker);

      for (const editor of dateTimeInputs) {
        expect(editor.checkValidity()).to.be.false;
        expect(editor.reportValidity()).to.be.false;
      }

      picker.value = { start: today.native, end: tomorrow.native };
      await elementUpdated(picker);

      for (const editor of dateTimeInputs) {
        expect(editor.checkValidity()).to.be.true;
        expect(editor.reportValidity()).to.be.true;
      }
    });
  });

  describe('Interactions', () => {
    describe('Selection via the calendar', () => {
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

        // adjust for the case when today and aMonthAgo are in different years
        if (today.year !== aMonthAgo.year) {
          dateTimeInputs[1].value = aMonthAgo.native;
          await elementUpdated(picker);
        }

        dateTimeInputs[1].blur();
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange');
        checkSelectedRange(picker, {
          start: aMonthAgo.native,
          end: today.native,
        });
      });
    });

    describe('Interactions with the inputs and the open and clear buttons', () => {
      it('keeps the time of both ends when an editor commits', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.inputFormat = 'MM/dd/yyyy HH:mm';
        picker.value = {
          start: new Date(2025, 5, 1, 9, 30),
          end: new Date(2025, 5, 5, 17, 45),
        };
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        // The day part of MM/dd/yyyy HH:mm
        dateTimeInputs[0].setSelectionRange(3, 3);
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        dateTimeInputs[0].blur();
        await elementUpdated(picker);

        const expected = {
          start: new Date(2025, 5, 2, 9, 30),
          end: new Date(2025, 5, 5, 17, 45),
        };
        expect(picker.value).to.eql(expected);
        expect(eventSpy).calledWith('igcChange', { detail: expected });
      });

      it('should emit or not igcInput according to nonEditable property', async () => {
        const expectedValue = today.native;
        const eventSpy = spy(picker, 'emitEvent');

        dateTimeInputs[0].focus();
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledOnceWith('igcInput');
        eventSpy.resetHistory();

        // Spinning is an uncommitted edit, so only the draft has the date. See #1346.
        expect(dateTimeInputs[0].value).to.be.null;
        expect(dateTimeInputs[0]._uncommittedValue).to.not.be.null;
        checkDatesEqual(dateTimeInputs[0]._uncommittedValue!, expectedValue);

        dateTimeInputs[0].blur();
        await elementUpdated(picker);
        checkDatesEqual(dateTimeInputs[0].value!, expectedValue);
        eventSpy.resetHistory();

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

      it('reports a clear one time, when the focus leaves the picker', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        simulateClick(getIcon(picker, clearIcon));
        await elementUpdated(picker);

        // The focus moves to the end input and stays in the picker.
        dateTimeInputs[1].focus();
        await elementUpdated(picker);
        expect(eventSpy).not.calledWith('igcChange');

        dateTimeInputs[1].blur();
        await elementUpdated(picker);

        expect(eventSpy.withArgs('igcChange')).calledOnceWith('igcChange', {
          detail: null,
        });
      });

      it('emits igcChange on blur after the clear icon and a render', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.value = { start: today.native, end: tomorrow.native };
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        simulateClick(getIcon(picker, clearIcon));
        // The render writes the cleared value back into the inputs.
        await elementUpdated(picker);

        dateTimeInputs[0].blur();
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange', {
          detail: null,
        });
        expect(picker.value).to.be.null;
      });

      it('should emit igcInput and igcChange on input value change', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const now = new CalendarDay({ year: 2026, month: 3, date: 1 });
        const aMonthAgo = now.add('month', -1);

        dateTimeInputs[0].value = now.native;
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        dateTimeInputs[0].setSelectionRange(0, 1); // make sure caret is on the month part (MM/dd/yyyy)
        simulateKeyboard(dateTimeInputs[0], arrowDown);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput', {
          detail: { start: aMonthAgo.native, end: null },
        });
        eventSpy.resetHistory();

        dateTimeInputs[0].blur();
        expect(eventSpy).calledWith('igcChange', {
          detail: { start: aMonthAgo.native, end: null },
        });
      });

      it('should set the calendar active date to the altered date of the range while typing', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        const now = new CalendarDay({ year: 2026, month: 3, date: 1 });
        const aMonthAgo = now.add('month', -1);

        picker.value = null;
        picker.open = true;
        await elementUpdated(picker);

        dateTimeInputs[0].focus();
        expect(isFocused(dateTimeInputs[0])).to.be.true;

        simulateInput(dateTimeInputs[0].renderRoot.querySelector('input')!, {
          value: '04/01/2026',
          inputType: 'insertText',
        });
        await elementUpdated(picker);

        dateTimeInputs[0].setSelectionRange(0, 1); // make sure caret is on the month part (MM/dd/yyyy)
        simulateKeyboard(dateTimeInputs[0], arrowDown);
        simulateKeyboard(dateTimeInputs[0], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        expect(eventSpy).not.calledWith('igcChange');
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[0]._uncommittedValue!, now.native);
        // typing a single date does not select a range in the calendar
        checkSelectedRange(
          picker,
          { start: now.native, end: null },
          true,
          true
        );
        checkDatesEqual(calendar.activeDate, now.native);

        dateTimeInputs[1].focus();
        expect(isFocused(dateTimeInputs[1])).to.be.true;

        // emit igcChange on losing focus of the edited input
        expect(eventSpy).calledWith('igcChange', {
          detail: { start: now.native, end: null },
        });
        eventSpy.resetHistory();

        dateTimeInputs[1].value = now.native;
        await elementUpdated(picker);

        dateTimeInputs[1].setSelectionRange(0, 1);
        simulateKeyboard(dateTimeInputs[1], arrowDown);
        simulateKeyboard(dateTimeInputs[1], arrowUp);
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcInput');
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[1]._uncommittedValue!, now.native);
        // typing the end date as well results in a selected range of a single date
        checkSelectedRange(
          picker,
          { start: now.native, end: now.native },
          true,
          true
        );
        checkDatesEqual(calendar.activeDate, now.native);

        simulateKeyboard(dateTimeInputs[1], arrowDown);
        await elementUpdated(picker);

        // the draft swaps the reversed ends, the editors keep the typed order
        expect(eventSpy).calledWith('igcInput', {
          detail: { start: aMonthAgo.native, end: now.native },
        });
        eventSpy.resetHistory();
        checkDatesEqual(dateTimeInputs[0]._uncommittedValue!, now.native);
        checkDatesEqual(dateTimeInputs[1]._uncommittedValue!, aMonthAgo.native);
        // changing the end date while typing alters the selected range
        // the active date is set to the typed date, in this case the end one
        expect(calendar.values).lengthOf(2);
        checkDatesEqual(calendar.values[0], aMonthAgo.native);
        checkDatesEqual(calendar.values[1], now.native);
        checkDatesEqual(calendar.activeDate, aMonthAgo.native);

        // on losing focus of the end input, the dates are swapped since end is earlier than start
        dateTimeInputs[0].focus();
        expect(isFocused(dateTimeInputs[0])).to.be.true;
        await elementUpdated(picker);

        expect(eventSpy).calledWith('igcChange', {
          detail: { start: aMonthAgo.native, end: now.native },
        });
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
        checkSelectedRange(
          picker,
          { start: expectedDate, end: null },
          true,
          true
        );
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
        checkSelectedRange(
          picker,
          { start: expectedDate, end: expectedDate2 },
          true,
          true
        );
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

      it('keeps the selected end while the typed date is incomplete, and drops it while blank', async () => {
        const start = new Date(2025, 0, 10);
        const end = new Date(2025, 2, 20);
        const june10 = new Date(2025, 5, 10);
        picker.inputFormat = 'MM/dd/yyyy';
        picker.value = { start, end };
        picker.open = true;
        await elementUpdated(picker);

        const input = dateTimeInputs[0].renderRoot.querySelector('input')!;
        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);

        // June 10 is after the end, so the calendar swaps the ends.
        typeAt(input, '6', 1);
        await elementUpdated(picker);
        expect(calendar.values).to.eql([end, june10]);

        // The year of the start.
        await simulateBackspaceOver(dateTimeInputs[0], 6, 10);
        await elementUpdated(picker);

        expect(input.value).to.equal('06/10/____');
        expect(calendar.values).to.eql([end, june10]);

        await simulateBackspaceOver(dateTimeInputs[0], 0, 10);
        await elementUpdated(picker);

        expect(calendar.values).to.eql([end]);
        expect(picker.value).to.eql({ start, end });
      });

      it('keeps the edit of an end that keeps its date when code sets a new range', async () => {
        const start = new Date(2025, 0, 10);
        const end = new Date(2025, 2, 20);
        const april1 = new Date(2025, 3, 1);
        const june10 = new Date(2025, 5, 10);
        picker.inputFormat = 'MM/dd/yyyy';
        picker.value = { start, end };
        picker.open = true;
        await elementUpdated(picker);

        const input = dateTimeInputs[0].renderRoot.querySelector('input')!;
        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);

        typeAt(input, '6', 1);
        await elementUpdated(picker);
        expect(calendar.values).to.eql([end, june10]);

        picker.value = { start: new Date(start.getTime()), end: april1 };
        await elementUpdated(picker);

        expect(input.value).to.equal('06/10/2025');
        expect(calendar.values).to.eql([april1, june10]);
      });

      it('selects the value when the focus moves to the other input', async () => {
        const start = new Date(2025, 0, 1);
        const end = new Date(2025, 2, 20);
        picker.inputFormat = 'MM/dd/yyyy';
        picker.value = { start, end };
        picker.open = true;
        await elementUpdated(picker);

        const input = dateTimeInputs[0].renderRoot.querySelector('input')!;
        dateTimeInputs[0].focus();
        await elementUpdated(dateTimeInputs[0]);

        typeAt(input, '6', 1);
        await elementUpdated(picker);

        // Only the year stays, so the commit fills the month and the day: January 1, the same start.
        await simulateBackspaceOver(dateTimeInputs[0], 0, 5);
        await elementUpdated(picker);
        expect(calendar.values).to.eql([end, new Date(2025, 5, 1)]);

        const eventSpy = spy(picker, 'emitEvent');
        dateTimeInputs[1].focus();
        await elementUpdated(picker);

        expect(eventSpy).not.calledWith('igcChange');
        expect(picker.value).to.eql({ start, end });
        expect(calendar.values).to.eql([start, end]);
      });
    });
    describe('Readonly state', () => {
      beforeEach(async () => {
        picker.readOnly = true;
        await elementUpdated(picker);
      });
      it('should not modify value through selection or typing when readOnly is true', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        expect(picker.value).to.be.null;

        await picker.show();
        await selectDates(today, tomorrow, calendar);

        expect(picker.value).to.be.null;
        expect(calendar.values).to.deep.equal([]);
        expect(eventSpy).not.to.be.called;

        await picker.hide();

        dateTimeInputs[0].focus();
        simulateKeyboard(dateTimeInputs[0], 'ArrowDown');
        await elementUpdated(picker);
        expect(isFocused(dateTimeInputs[0])).to.be.true;
        expect(dateTimeInputs[0].value).to.equal(null);
        expect(picker.value).to.be.null;
        expect(calendar.values).to.deep.equal([]);
        expect(eventSpy).not.to.be.called;
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

  runFocusBeforeRenderTests(
    html`<igc-date-range-picker use-two-inputs></igc-date-range-picker>`
  );
});
