import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon, { spy } from 'sinon';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
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
  simulateCancelableKeydown,
  simulateInput,
  simulateKeyboard,
  simulateScroll,
} from '#internals/testing/simulate.spec.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import { DatePart } from '../date-time-input/date-part.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import { DateRangePosition } from './date-range-mask-parser.js';
import IgcDateRangePickerComponent from './date-range-picker.js';
import {
  checkSelectedRange,
  getInput,
  typeAt,
} from './date-range-picker.utils.spec.js';

describe('Date range picker - single input', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  it('exposes `required` as `aria-required` on the native input', async () => {
    const picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker required></igc-date-range-picker>`
    );
    const editor = picker.renderRoot.querySelector('igc-date-range-input')!;
    await elementUpdated(editor);

    expect(
      editor.renderRoot.querySelector('input')!.getAttribute('aria-required')
    ).to.equal('true');
  });

  runExternalLabelAssociationTests({
    tagName: IgcDateRangePickerComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcDateRangePickerComponent).renderRoot
        .querySelector<IgcDateRangeInputComponent>(
          IgcDateRangeInputComponent.tagName
        )!
        .renderRoot.querySelector('input')!,
  });

  runAriaProjectionTests({
    tagName: IgcDateRangePickerComponent.tagName,
    getNativeInput: (host) =>
      (host as IgcDateRangePickerComponent).renderRoot
        .querySelector<IgcDateRangeInputComponent>(
          IgcDateRangeInputComponent.tagName
        )!
        .renderRoot.querySelector('input')!,
    expected: { hasPopup: 'dialog' },
    getDescription: (host) => [
      (host as IgcDateRangePickerComponent).renderRoot.querySelector(
        '#helper-text'
      )!,
    ],
  });

  let picker: IgcDateRangePickerComponent;
  let rangeInput: IgcDateRangeInputComponent;
  let input: HTMLInputElement;
  let calendar: IgcCalendarComponent;

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
  describe('Single input properties', () => {
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

  describe('Single input localization', () => {
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
  describe('Scroll strategy', () => {
    // Inherited from the picker base class - one end-to-end smoke test.
    it('`close` behavior', async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div style="height: 1200px">
          <igc-date-range-picker
            scroll-strategy="close"
          ></igc-date-range-picker>
        </div>
      `);
      picker = container.querySelector(IgcDateRangePickerComponent.tagName)!;
      const eventSpy = spy(picker, 'emitEvent');

      await picker.show();
      await simulateScroll(container, { top: 200 });

      expect(picker.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.lastCall).calledWith('igcClosed');
    });
  });

  describe('Single input methods', () => {
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

      // The default part is the day of the start date
      rangeInput.stepUp();
      await elementUpdated(rangeInput);

      expect(rangeInput.value?.start?.getMonth()).to.equal(0);
      expect(rangeInput.value?.start?.getDate()).to.equal(16);
      expect(input.value).to.equal('1/16/2025 - 1/16/2025');

      rangeInput.stepDown();
      await elementUpdated(rangeInput);

      expect(rangeInput.value?.start?.getMonth()).to.equal(0);
      expect(rangeInput.value?.start?.getDate()).to.equal(15);
      expect(input.value).to.equal('1/15/2025 - 1/16/2025');
    });

    it('a spin of an empty end takes today without a step', async () => {
      const start = new Date(2025, 0, 15);
      rangeInput.value = { start, end: null };
      await elementUpdated(rangeInput);

      rangeInput.stepUp({
        part: DatePart.Date,
        position: DateRangePosition.End,
      });
      await elementUpdated(rangeInput);

      expect(rangeInput.value).to.deep.equal({ start, end: today.native });
    });

    it('should update the value on stepUp/stepDown while the input is focused', async () => {
      picker.value = {
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 16),
      };
      await elementUpdated(picker);

      rangeInput.focus();
      rangeInput.setSelectionRange(0, 0);
      rangeInput.stepUp();
      expect(rangeInput.value?.start?.getMonth()).to.equal(1);

      rangeInput.stepDown();
      expect(rangeInput.value?.start?.getMonth()).to.equal(0);

      // An empty input starts from today, also committed at once.
      rangeInput.clear();
      rangeInput.stepUp();
      expect(rangeInput.value?.start).to.exist;
    });

    it('should not report a value set from code while the input is focused', async () => {
      const eventSpy = spy(picker, 'emitEvent');

      rangeInput.focus();
      picker.value = {
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 16),
      };
      await elementUpdated(picker);

      rangeInput.blur();
      await elementUpdated(picker);

      expect(eventSpy).not.calledWith('igcChange');
    });

    it('steps a date part that the input format does not have, as the date-time input does', async () => {
      const value = {
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 16),
      };
      picker.value = value;
      await elementUpdated(picker);

      rangeInput.stepUp({
        part: DatePart.Hours,
        position: DateRangePosition.Start,
      });
      await elementUpdated(rangeInput);

      expect(rangeInput.value).to.deep.equal({
        start: new Date(2025, 0, 15, 1),
        end: value.end,
      });
      expect(input.value).to.equal('1/15/2025 - 1/16/2025');
    });

    it('keeps the start year selected when a spin narrows it', async () => {
      picker.value = {
        start: new Date(10_000, 0, 15),
        end: new Date(10_001, 0, 16),
      };
      await elementUpdated(picker);

      input.focus();
      await elementUpdated(rangeInput);
      rangeInput.setSelectionRange(6, 11);
      await elementUpdated(rangeInput);

      simulateKeyboard(input, arrowDown);
      await elementUpdated(rangeInput);

      expect(input.value).to.equal('01/15/9999 - 01/16/10001');
      expect([input.selectionStart, input.selectionEnd]).to.eql([6, 10]);
    });

    it('does not step anything while the cursor is in the separator', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      const inputEventSpy = spy(rangeInput, 'emitEvent');
      picker.value = {
        start: new Date(2025, 0, 15),
        end: new Date(2025, 0, 16),
      };
      await elementUpdated(picker);

      input.focus();
      await elementUpdated(rangeInput);
      input.setSelectionRange(11, 11);

      simulateKeyboard(input, arrowUp);
      await elementUpdated(rangeInput);

      expect(input.value).to.equal('01/15/2025 - 01/16/2025');
      expect(eventSpy).not.calledWith('igcChange');
      expect(inputEventSpy).not.calledWith('igcInput');
      expect(rangeInput._uncommittedValue).to.deep.equal(picker.value);
    });
  });
  describe('Single input interactions', () => {
    describe('Interactions with the inputs and the open and clear buttons', () => {
      it('cancels Escape only while open', async () => {
        expect(simulateCancelableKeydown(picker, escapeKey)).to.be.false;

        await picker.show();
        expect(simulateCancelableKeydown(picker, escapeKey)).to.be.true;
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
        picker.value = {
          start: new Date(2025, 3, 22),
          end: new Date(2025, 3, 23),
        };
        await elementUpdated(picker);

        input.focus();
        await elementUpdated(rangeInput);

        // The caret picks the part and the end of the range.
        input.setSelectionRange(4, 4);
        simulateKeyboard(input, arrowUp);
        await elementUpdated(rangeInput);

        expect(input.value).to.equal('04/23/2025 - 04/23/2025');

        input.setSelectionRange(14, 14);
        simulateKeyboard(input, arrowDown);
        await elementUpdated(rangeInput);

        expect(input.value).to.equal('04/23/2025 - 03/23/2025');
      });

      it('moves to the edges of the date parts with Ctrl + arrow keys', async () => {
        picker.value = {
          start: new Date(2025, 3, 22),
          end: new Date(2025, 3, 23),
        };
        await elementUpdated(picker);

        input.focus();
        await elementUpdated(rangeInput);

        const navigate = async (from: number, key: string) => {
          input.setSelectionRange(from, from);
          simulateKeyboard(input, [ctrlKey, key]);
          await elementUpdated(rangeInput);
          return [input.selectionStart, input.selectionEnd];
        };

        // Inside a part: to its end, or back to its start
        expect(await navigate(1, arrowRight)).to.eql([2, 2]);
        expect(await navigate(4, arrowLeft)).to.eql([3, 3]);
        // In the separator: back to the start of the last start date part
        expect(await navigate(11, arrowLeft)).to.eql([6, 6]);
        // At the edges of the input: stays there
        expect(await navigate(0, arrowLeft)).to.eql([0, 0]);
        expect(await navigate(23, arrowRight)).to.eql([23, 23]);
      });

      it('stops at each part edge with Ctrl + arrow keys in a format without separators', async () => {
        picker.inputFormat = 'yyyyMMdd';
        picker.value = {
          start: new Date(2025, 3, 22),
          end: new Date(2025, 3, 23),
        };
        await elementUpdated(picker);

        input.focus();
        await elementUpdated(rangeInput);

        input.setSelectionRange(4, 4);
        simulateKeyboard(input, [ctrlKey, arrowRight]);
        await elementUpdated(rangeInput);

        expect([input.selectionStart, input.selectionEnd]).to.eql([6, 6]);
      });

      describe('Arrow keys on a range with one typed end', () => {
        /** The keydown records the caret, as a real key press does. */
        const typeText = async (text: string, position = 0) => {
          input.focus();
          await elementUpdated(rangeInput);
          typeAt(input, text, position);
          await elementUpdated(rangeInput);
        };

        const spinAt = async (position: number) => {
          input.setSelectionRange(position, position);
          simulateKeyboard(input, arrowUp);
          await elementUpdated(rangeInput);
        };

        it('spins the typed start and keeps the empty end', async () => {
          await typeText('04/22/2025');
          expect(input.value).to.equal('04/22/2025 - __/__/____');

          await spinAt(3);

          expect(input.value).to.equal('04/23/2025 - __/__/____');
        });

        it('keeps the partial text of the other end', async () => {
          await typeText('04/22/2025 - 05');
          expect(input.value).to.equal('04/22/2025 - 05/__/____');

          await spinAt(3);

          expect(input.value).to.equal('04/23/2025 - 05/__/____');
        });

        it('spins the typed end and keeps the empty start', async () => {
          await typeText('05/10/2025', 13);
          expect(input.value).to.equal('__/__/____ - 05/10/2025');

          await spinAt(16);

          expect(input.value).to.equal('__/__/____ - 05/11/2025');
        });

        it('takes today for the targeted end when the other end has text', async () => {
          await typeText('04/22/2025');

          await spinAt(16);

          expect(rangeInput._uncommittedValue).to.deep.equal({
            start: new Date(2025, 3, 22),
            end: today.native,
          });
        });

        it('spins a start that setRangeText committed as an empty range', async () => {
          input.focus();
          await elementUpdated(rangeInput);
          rangeInput.setRangeText('04/22/2025', 0, 10);
          await elementUpdated(rangeInput);
          expect(rangeInput.value).to.be.null;

          await spinAt(3);

          expect(input.value).to.equal('04/23/2025 - __/__/____');
        });

        it('stepUp commits the typed start and keeps the partial text of the other end', async () => {
          await typeText('04/22/2025 - 05');

          input.setSelectionRange(3, 3);
          rangeInput.stepUp();
          await elementUpdated(rangeInput);

          expect(rangeInput.value).to.deep.equal({
            start: new Date(2025, 3, 23),
            end: null,
          });
          expect(input.value).to.equal('04/23/2025 - 05/__/____');
        });
      });

      describe('Calendar view while typing', () => {
        beforeEach(async () => {
          picker.value = {
            start: new Date(2025, 0, 10),
            end: new Date(2025, 2, 20),
          };
          await elementUpdated(picker);

          input.focus();
          await elementUpdated(rangeInput);
        });

        it('brings the typed end into view', async () => {
          typeAt(input, '6', 14);
          await elementUpdated(rangeInput);

          expect(input.value).to.equal('01/10/2025 - 06/20/2025');
          checkDatesEqual(calendar.activeDate, new Date(2025, 5, 20));
        });

        it('brings the spun end into view', async () => {
          input.setSelectionRange(14, 14);
          simulateKeyboard(input, arrowUp, 3);
          await elementUpdated(picker);

          expect(input.value).to.equal('01/10/2025 - 06/20/2025');
          checkDatesEqual(calendar.activeDate, new Date(2025, 5, 20));
        });

        it('selects a complete typed end and keeps it while the end is incomplete', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          const typed = [new Date(2025, 0, 10), new Date(2025, 5, 20)];

          typeAt(input, '6', 14);
          await elementUpdated(picker);
          expect(calendar.values).to.eql(typed);

          // The year of the end.
          await simulateBackspaceOver(rangeInput, 19, 23);
          await elementUpdated(picker);

          expect(input.value).to.equal('01/10/2025 - 06/20/____');
          expect(calendar.values).to.eql(typed);
          expect(eventSpy).calledWith('igcInput', { detail: null });
          expect(picker.value).to.eql({
            start: new Date(2025, 0, 10),
            end: new Date(2025, 2, 20),
          });
        });

        it('keeps a typed start after the end while the start is incomplete', async () => {
          // June 10 is after the end, so the calendar swaps the ends.
          const typed = [new Date(2025, 2, 20), new Date(2025, 5, 10)];

          typeAt(input, '6', 1);
          await elementUpdated(picker);
          expect(input.value).to.equal('06/10/2025 - 03/20/2025');
          expect(calendar.values).to.eql(typed);

          await simulateBackspaceOver(rangeInput, 6, 10);
          await elementUpdated(picker);

          expect(input.value).to.equal('06/10/____ - 03/20/2025');
          expect(calendar.values).to.eql(typed);
        });

        it('drops a blank end from the selection', async () => {
          await simulateBackspaceOver(rangeInput, 13, 23);
          await elementUpdated(picker);

          expect(input.value).to.equal('01/10/2025 - __/__/____');
          expect(calendar.values).to.eql([new Date(2025, 0, 10)]);
        });

        it('brings the start into view while the caret is in the separator', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          calendar.activeDate = new Date(2025, 8, 1);

          typeAt(input, '0', 11);
          await elementUpdated(rangeInput);

          expect(eventSpy).calledWith('igcInput');
          checkDatesEqual(calendar.activeDate, new Date(2025, 0, 10));
        });
      });

      it('ignores the input events of the editor when nonEditable is set', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.nonEditable = true;
        await elementUpdated(picker);

        const event = new CustomEvent('igcInput', {
          cancelable: true,
          detail: '',
        });
        rangeInput.dispatchEvent(event);
        await elementUpdated(picker);

        expect(event.defaultPrevented).to.be.true;
        expect(eventSpy).not.called;
        expect(calendar.values).to.be.empty;
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
        picker.inputFormat = 'MM/dd/yyyy hh:mm tt';
        picker.value = {
          start: new Date(2025, 3, 14, 9, 30),
          end: new Date(2025, 3, 15, 10, 45),
        };
        await elementUpdated(picker);

        input.focus();
        await elementUpdated(rangeInput);

        // The caret in the AM/PM part of the start date spins only the start.
        input.setSelectionRange(17, 17);
        simulateKeyboard(input, arrowUp);
        await elementUpdated(rangeInput);

        expect(input.value).to.equal(
          '04/14/2025 09:30 PM - 04/15/2025 10:45 AM'
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
    });

    describe('Undo / redo', () => {
      it('restores a typed draft in the range input', async () => {
        rangeInput.focus();
        await elementUpdated(picker);

        const initial = input.value;

        rangeInput.setSelectionRange(0, input.value.length);
        simulateInput(input, {
          value: '10/10/2020 - 11/11/2020',
          inputType: 'insertText',
        });
        await elementUpdated(picker);

        expect(input.value).to.equal('10/10/2020 - 11/11/2020');

        simulateKeyboard(input, [ctrlKey, 'z']);
        await elementUpdated(picker);

        expect(input.value).to.equal(initial);
      });
    });
  });
  describe('Single input slots', () => {
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

  runFocusBeforeRenderTests(
    html`<igc-date-range-picker label="Label"></igc-date-range-picker>`
  );
});
