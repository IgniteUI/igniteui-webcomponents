import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import IgcCalendarComponent from '../calendar/calendar.js';
import IgcDaysViewComponent from '../calendar/days-view/days-view.js';
import { CalendarDay, toCalendarDay } from '../calendar/model.js';
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
  createFormAssociatedTestBed,
  runValidationContainerTests,
  simulateClick,
  simulateKeyboard,
  simulatePointerDown,
} from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDatePickerComponent from './date-picker.js';

describe('Date picker', () => {
  before(() => defineComponents(IgcDatePickerComponent));

  const pickerShowIcon = 'today';
  const pickerClearIcon = 'input_clear';

  function getIcon(name: string) {
    return picker.renderRoot.querySelector(`[name='${name}']`)!;
  }

  function getLabel() {
    return picker.renderRoot.querySelector('label')!;
  }

  let picker: IgcDatePickerComponent;
  let dateTimeInput: IgcDateTimeInputComponent;
  let calendar: IgcCalendarComponent;

  beforeEach(async () => {
    picker = await fixture<IgcDatePickerComponent>(
      html`<igc-date-picker></igc-date-picker>`
    );
    dateTimeInput = picker.renderRoot.querySelector(
      IgcDateTimeInputComponent.tagName
    )!;

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

    it('should render slotted elements - prefix, suffix, clear-icon, calendar-icon(-open), helper-text, title, header-date actions', async () => {
      picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker>
          <span slot="prefix">$</span>
          <span slot="suffix">~</span>
          <p slot="helper-text">For example, select your birthday</p>
          <p slot="title">Custom title</p>
          <p slot="header-date">Custom header date</p>
          <span slot="calendar-icon-open">v</span>
          <span slot="calendar-icon">^</span>
          <span slot="clear-icon">X</span>
          <button slot="actions">Custom action</button>
        </igc-date-picker>`
      );
      await elementUpdated(picker);

      dateTimeInput = picker.renderRoot.querySelector(
        IgcDateTimeInputComponent.tagName
      )!;

      const slotTests = [
        {
          slot: 'prefix',
          tagName: 'span',
          content: '$',
          parent: dateTimeInput,
          nestedIn: 'prefix',
        },
        {
          slot: 'suffix',
          tagName: 'span',
          content: '~',
          parent: dateTimeInput,
          nestedIn: 'suffix',
        },
        {
          slot: 'title',
          tagName: 'p',
          content: 'Custom title',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
          parent: picker,
        },
        {
          slot: 'header-date',
          tagName: 'p',
          content: 'Custom header date',
          prerequisite: () => {
            picker.mode = 'dialog';
          },
          parent: picker,
        },
        {
          slot: 'helper-text',
          tagName: 'p',
          content: 'For example, select your birthday',
          parent: picker,
        },
        {
          slot: 'calendar-icon',
          tagName: 'span',
          content: '^',
          parent: picker,
        },
        {
          slot: 'calendar-icon-open',
          tagName: 'span',
          content: 'v',
          prerequisite: async () => await picker.show(),
          parent: picker,
        },
        {
          slot: 'clear-icon',
          tagName: 'span',
          content: 'X',
          prerequisite: () => {
            picker.value = new Date();
          },
          parent: picker,
        },
        {
          slot: 'actions',
          tagName: 'button',
          content: 'Custom action',
          prerequisite: async () => await picker.show(),
          parent: picker,
        },
      ];

      for (let i = 0; i < slotTests.length; i++) {
        await slotTests[i].prerequisite?.();
        await elementUpdated(picker);

        const slot = slotTests[i].parent.renderRoot.querySelector(
          `slot[name="${slotTests[i].slot}"]`
        ) as HTMLSlotElement;
        let elements = slot.assignedElements();

        if (slotTests[i].nestedIn) {
          const targetElement = elements.find((el) =>
            el.matches(`slot[name="${slotTests[i].nestedIn}"]`)
          ) as HTMLSlotElement;
          elements = targetElement.assignedElements();
        }

        expect((elements[0] as HTMLElement).innerText).to.equal(
          slotTests[i].content
        );
        expect(elements[0].tagName.toLowerCase()).to.equal(
          slotTests[i].tagName
        );
      }
    });

    it('should not render title slot elements in dropdown mode', async () => {
      picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker mode="dropdown">
          <p slot="title">Custom title</p>
        </igc-date-picker>`
      );
      await elementUpdated(picker);

      const slot = picker.renderRoot.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.be.null;
    });

    it('should be successfully initialized with value', async () => {
      const expectedValue = new Date(2024, 1, 29);
      picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker .value="${expectedValue}"></igc-date-picker>`
      );
      dateTimeInput = picker.renderRoot.querySelector(
        IgcDateTimeInputComponent.tagName
      )!;

      expect(picker.value).not.to.be.null;
      checkDatesEqual(picker.value!, expectedValue);
      expect(dateTimeInput.value).not.to.be.null;
      checkDatesEqual(dateTimeInput.value!, expectedValue);
    });

    it('should be successfully initialized with a string property binding - issue 1467', async () => {
      const value = new CalendarDay({ year: 2000, month: 0, date: 25 });
      picker = await fixture<IgcDatePickerComponent>(html`
        <igc-date-picker .value=${value.native.toISOString()}></igc-date-picker>
      `);

      expect(CalendarDay.from(picker.value!).equalTo(value)).to.be.true;
    });

    it('should not set an invalid date object as a value', async () => {
      picker = await fixture<IgcDatePickerComponent>(html`
        <igc-date-picker value="invalid date"></igc-date-picker>
      `);

      expect(picker.value).to.be.null;
    });

    it('should not set an invalid date object as a value through property binding', async () => {
      picker = await fixture<IgcDatePickerComponent>(html`
        <igc-date-picker .value=${new Date('s')}></igc-date-picker>
      `);

      expect(picker.value).to.be.null;
    });

    it('should be successfully initialized in open state in dropdown mode', async () => {
      picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker open></igc-date-picker>`
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
      picker = await fixture<IgcDatePickerComponent>(
        html`<igc-date-picker open mode="dialog"></igc-date-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dialog');
      await picker.show();

      const dialog = picker.renderRoot.querySelector('igc-dialog');
      expect(dialog).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.equal(dialog);
    });
  });

  describe('Attributes and properties', () => {
    const currentDate = CalendarDay.today;
    const tomorrowDate = currentDate.add('day', 1);

    it('should set the value trough attribute correctly', async () => {
      expect(picker.value).to.be.null;
      const expectedValue = new CalendarDay({ year: 2024, month: 2, date: 1 });
      picker.setAttribute('value', expectedValue.native.toISOString());
      await elementUpdated(picker);

      checkDatesEqual(picker.value!, expectedValue);
    });

    it('should show/hide the picker based on the value of the open attribute', async () => {
      expect(picker.open).to.equal(false);
      picker.open = true;
      const eventSpy = spy(picker, 'emitEvent');
      await elementUpdated(picker);

      expect(picker.open).to.equal(true);
      expect(eventSpy).not.called;

      picker.open = false;
      await elementUpdated(picker);

      expect(picker.open).to.equal(false);
      expect(eventSpy).not.called;
    });

    it('should set prompt char correctly', async () => {
      picker.prompt = '*';
      await elementUpdated(picker);

      expect(dateTimeInput.prompt).to.equal('*');
    });

    it('should not close calendar after selection when keepOpenOnSelect is true', async () => {
      expect(picker.open).to.equal(false);
      picker.keepOpenOnSelect = true;
      await elementUpdated(picker);

      await picker.show();

      const eventSpy = spy(picker, 'emitEvent');

      selectCurrentDate(calendar);
      await elementUpdated(picker);

      expect(eventSpy).calledOnce;

      checkDatesEqual(picker.value as Date, currentDate);
      checkDatesEqual(calendar.value as Date, currentDate);

      expect(picker.open).to.equal(true);
    });

    it('should not close calendar on clicking outside of it when keepOpenOnOutsideClick is true', async () => {
      expect(picker.open).to.equal(false);
      picker.keepOpenOnOutsideClick = true;
      await elementUpdated(picker);

      await picker.show();

      simulateClick(document.body);
      await elementUpdated(picker);

      expect(picker.open).to.equal(true);
    });

    it('should modify value only through calendar selection and not input when nonEditable is true', async () => {
      picker.value = tomorrowDate.native;
      await elementUpdated(picker);

      picker.nonEditable = true;
      await elementUpdated(picker);

      await picker.show();

      const eventSpy = spy(picker, 'emitEvent');

      selectCurrentDate(calendar);
      await elementUpdated(picker);

      expect(eventSpy).calledWith('igcChange');
      checkDatesEqual(picker.value as Date, currentDate);

      eventSpy.resetHistory();
      simulateKeyboard(dateTimeInput, '1');
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      checkDatesEqual(picker.value as Date, currentDate);
    });

    it('should not modify value through selection or typing when readOnly is true', async () => {
      picker.value = tomorrowDate.native;
      await elementUpdated(picker);

      picker.readOnly = true;
      await elementUpdated(picker);

      await picker.show();

      const eventSpy = spy(picker, 'emitEvent');
      const calendarEventSpy = spy(calendar, 'emitEvent');

      selectCurrentDate(calendar);
      await elementUpdated(picker);

      expect(eventSpy).not.calledWith('igcChange');
      expect(calendarEventSpy).calledWith('igcChange');
      checkDatesEqual(picker.value as Date, tomorrowDate);
      checkDatesEqual(calendar.value as Date, tomorrowDate);

      eventSpy.resetHistory();
      simulateKeyboard(dateTimeInput, '1');
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      checkDatesEqual(picker.value as Date, tomorrowDate);
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
      expect(picker.value).to.be.null;
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
        expect((calendar as any)[prop]).to.eql(value);
      }
    });

    it('should set properties of the input correctly', async () => {
      const props = {
        required: true,
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

    it('should render the label correctly (valid for theme !== material)', async () => {
      picker.label = 'Test label';
      await elementUpdated(picker);

      const label = picker.renderRoot.querySelector(
        'label[part="label"]'
      ) as HTMLLabelElement;
      expect(label).not.to.be.undefined;
      expect(label.innerText).to.equal('Test label');
    });

    describe('Active date', () => {
      const tomorrowDate = currentDate.add('day', 1);
      const after10DaysDate = currentDate.add('day', 10);
      const after20DaysDate = currentDate.add('day', 20);

      it('should initialize activeDate with current date, when not set', async () => {
        checkDatesEqual(picker.activeDate, currentDate);
        expect(picker.value).to.be.null;
        checkDatesEqual(calendar.activeDate, currentDate);
        expect(calendar.value).to.be.null;
      });

      it('should initialize activeDate = value when it is not set, but value is', async () => {
        const valueDate = after10DaysDate;
        picker = await fixture<IgcDatePickerComponent>(
          html`<igc-date-picker .value=${valueDate.native}></igc-date-picker>`
        );
        await elementUpdated(picker);

        checkDatesEqual(picker.value as Date, valueDate);

        calendar = picker.renderRoot.querySelector(
          IgcCalendarComponent.tagName
        )!;

        checkDatesEqual(picker.activeDate, after10DaysDate);
        checkDatesEqual(calendar.activeDate, after10DaysDate);
        checkDatesEqual(calendar.value as Date, after10DaysDate);
      });

      it('should set activeDate correctly', async () => {
        picker.activeDate = tomorrowDate.native;

        await elementUpdated(picker);
        checkDatesEqual(calendar.activeDate, tomorrowDate);

        // value is null
        expect(picker.value).to.be.null;

        // setting the value does not affect the activeDate, when it is explicitly set
        picker.value = after20DaysDate.native;
        await elementUpdated(picker);

        checkDatesEqual(calendar.activeDate, tomorrowDate);
      });
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

          expect(dateTimeInput.displayFormat).to.equal(`${format}Date`);
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

    it('should set the underlying igc-input into readonly mode when dialog mode is enabled', async () => {
      expect(dateTimeInput.readOnly).to.be.false;

      picker.mode = 'dialog';
      await elementUpdated(picker);

      expect(dateTimeInput.readOnly).to.be.true;
    });
  });

  describe('Methods', () => {
    let input: HTMLInputElement;

    beforeEach(() => {
      input = dateTimeInput.renderRoot.querySelector(
        'input'
      ) as HTMLInputElement;
    });

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
      picker.value = new Date();
      await elementUpdated(picker);

      expect(dateTimeInput.value).to.equal(picker.value);
      picker.clear();
      await elementUpdated(picker);

      expect(picker.value).to.be.null;
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
      const setRangeTextSpy = spy(dateTimeInput, 'setRangeText');
      picker.value = new Date(2024, 2, 21);
      const expectedValue = new Date(2023, 2, 21);
      await elementUpdated(picker);

      dateTimeInput.focus();
      picker.setRangeText('2023', 6, 10);
      await elementUpdated(picker);

      expect(setRangeTextSpy).to.be.called;

      checkDatesEqual(new Date(input.value), expectedValue);
      checkDatesEqual(picker.value!, expectedValue);
      checkDatesEqual(dateTimeInput.value!, expectedValue);
    });
  });

  describe('Interactions', () => {
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

    it('should emit or not igcInput according to nonEditable property', async () => {
      const expectedValue = new Date();
      const eventSpy = spy(picker, 'emitEvent');

      dateTimeInput.focus();
      simulateKeyboard(dateTimeInput, arrowUp);
      await elementUpdated(picker);

      expect(eventSpy).calledOnceWith('igcInput');
      eventSpy.resetHistory();
      checkDatesEqual(picker.value as Date, expectedValue);

      picker.value = null;
      picker.nonEditable = true;
      await elementUpdated(picker);

      dateTimeInput.focus();
      simulateKeyboard(dateTimeInput, arrowUp);
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      expect(picker.value).to.be.null;

      dateTimeInput.dispatchEvent(
        new CustomEvent('igcInput', { detail: expectedValue })
      );
      await elementUpdated(picker);

      expect(eventSpy).not.called;
      expect(picker.value).to.be.null;
    });

    it('should open the picker on calendar show icon click in dropdown mode', async () => {
      simulateClick(getIcon(pickerShowIcon));
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
    });

    it('should not open the picker when clicking the input in dropdown mode', async () => {
      simulateClick(dateTimeInput);
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

      simulateClick(dateTimeInput.renderRoot.querySelector('input')!);
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
    });

    it('should not open the picker in dropdown mode when clicking the clear icon', async () => {
      picker.value = new Date();
      await elementUpdated(picker);

      simulateClick(getIcon(pickerClearIcon));
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(picker.value).to.be.null;
    });

    it('should not open the picker in dialog mode when clicking the clear icon', async () => {
      picker.mode = 'dialog';
      picker.value = new Date();
      await elementUpdated(picker);

      simulateClick(getIcon(pickerClearIcon));
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
      expect(picker.value).to.be.null;
    });

    it('should not open the picker in dropdown mode when clicking the label', async () => {
      picker.label = 'Label';
      await elementUpdated(picker);

      simulateClick(getLabel());
      await elementUpdated(picker);

      expect(picker.open).to.be.false;
    });

    it('should open the picker in dialog mode when clicking the label', async () => {
      picker.label = 'Label';
      picker.mode = 'dialog';
      await elementUpdated(picker);

      simulateClick(getLabel());
      await elementUpdated(picker);

      expect(picker.open).to.be.true;
    });
  });

  describe('Form integration', () => {
    const today = CalendarDay.today;
    const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(
      html`<igc-date-picker name="datePicker"></igc-date-picker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDatePickerComponent.tagName);
    });

    it('should be form associated', () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('should not participate in form submission if the value is empty/invalid', () => {
      spec.assertSubmitHasValue(null);
    });

    it('should participate in form submission if there is a value and the value adheres to the validation constraints', () => {
      spec.setProperties({ value: today.native });
      spec.assertSubmitHasValue(spec.element.value?.toISOString());
    });

    it('should reset to its default value state on form reset', () => {
      spec.setProperties({ value: today.native });
      spec.reset();

      expect(spec.element.value).to.be.null;
    });

    it('should reset to the new default value after setAttribute() call', () => {
      spec.setAttributes({ value: today.native.toISOString() });
      spec.setProperties({ value: today.add('day', 180).native });
      spec.reset();

      checkDatesEqual(spec.element.value!, today);
      spec.assertSubmitHasValue(today.native.toISOString());
    });

    it('should reflect disabled ancestor state (fieldset/form)', () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('should enforce required constraint', () => {
      spec.setProperties({ required: true });
      spec.assertSubmitFails();

      spec.setProperties({ value: today.native });
      spec.assertSubmitPasses();
    });

    it('should enforce min value constraint', () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1) });
      spec.assertSubmitPasses();

      // Invalid min constraint
      spec.setProperties({ value: new Date(2022, 0, 1) });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2026, 0, 2) });
      spec.assertSubmitPasses();
    });

    it('should enforce max value constraint', () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();

      // Invalid max constraint
      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2020, 0, 1) });
      spec.assertSubmitPasses();
    });

    it('should enforce min value constraint with string property', () => {
      // No value - submit passes
      spec.setProperties({ min: new Date(2026, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      // Invalid min constraint
      spec.setProperties({ value: new Date(2022, 0, 1).toISOString() });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2026, 0, 2).toISOString() });
      spec.assertSubmitPasses();
    });

    it('should enforce max value constraint with string property', () => {
      // No value - submit passes
      spec.setProperties({ max: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();

      // Invalid max constraint
      spec.setProperties({ value: today.native });
      spec.assertSubmitFails();

      // Valid value
      spec.setProperties({ value: new Date(2020, 0, 1).toISOString() });
      spec.assertSubmitPasses();
    });

    it('should invalidate the component if a disabled date is typed in the input', () => {
      const minDate = new Date(2024, 1, 1);
      const maxDate = new Date(2024, 1, 28);

      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      spec.setProperties({ disabledDates, value: new Date(2024, 1, 26) });

      expect(spec.element.invalid).to.be.true;
      spec.assertSubmitFails();
    });

    it('should enforce custom constraint', () => {
      spec.element.setCustomValidity('invalid');
      spec.assertSubmitFails();

      spec.element.setCustomValidity('');
      spec.assertSubmitPasses();
    });

    it('synchronous form validation', () => {
      spec.setProperties({ required: true }, false);

      expect(spec.form.checkValidity()).to.be.false;
      spec.assertSubmitFails();

      spec.reset();

      spec.setProperties({ value: today.native }, false);

      expect(spec.form.checkValidity()).to.be.true;
      spec.assertSubmitPasses();
    });
  });

  describe('defaultValue', () => {
    const today = CalendarDay.today;

    describe('Form integration', () => {
      const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(html`
        <igc-date-picker
          name="datePicker"
          .defaultValue=${today.native}
        ></igc-date-picker>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDatePickerComponent.tagName);
      });

      it('correct initial state', () => {
        spec.assertIsPristine();
        checkDatesEqual(spec.element.value!, today);
      });

      it('is correctly submitted', () => {
        spec.assertSubmitHasValue(today.native.toISOString());
      });

      it('is correctly reset', () => {
        spec.setProperties({ value: today.add('day', 1).native });
        spec.reset();

        checkDatesEqual(spec.element.value!, today);
      });
    });

    describe('Validation', () => {
      const spec = createFormAssociatedTestBed<IgcDatePickerComponent>(html`
        <igc-date-picker
          name="datePicker"
          .defaultValue=${null}
        ></igc-date-picker>
      `);

      beforeEach(async () => {
        await spec.setup(IgcDatePickerComponent.tagName);
      });

      it('fails required validation', () => {
        spec.setProperties({ required: true });
        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes required validation when updating defaultValue', () => {
        spec.setProperties({ required: true, defaultValue: today.native });
        spec.assertIsPristine();

        spec.assertSubmitPasses();
      });

      it('fails min validation', () => {
        spec.setProperties({
          min: today.native,
          defaultValue: today.add('day', -1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes min validation', () => {
        spec.setProperties({ min: today.native, defaultValue: today.native });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.add('day', 1).native,
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes max validation', () => {
        spec.setProperties({
          max: today.native,
          defaultValue: today.native,
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });

      it('fails for range constraints', () => {
        const minDate = new Date(2024, 1, 1);
        const maxDate = new Date(2024, 1, 28);

        const disabledDates: DateRangeDescriptor[] = [
          {
            type: DateRangeType.Between,
            dateRange: [minDate, maxDate],
          },
        ];

        spec.setProperties({
          disabledDates,
          defaultValue: new Date(2024, 1, 28),
        });

        spec.assertIsPristine();
        spec.assertSubmitFails();
      });

      it('passes for range constraints', () => {
        const minDate = new Date(2024, 1, 1);
        const maxDate = new Date(2024, 1, 28);

        const disabledDates: DateRangeDescriptor[] = [
          {
            type: DateRangeType.Between,
            dateRange: [minDate, maxDate],
          },
        ];

        spec.setProperties({
          disabledDates,
          defaultValue: new Date(2024, 1, 29),
        });

        spec.assertIsPristine();
        spec.assertSubmitPasses();
      });
    });
  });

  describe('Initial validation', () => {
    it('should not enter in invalid state when clicking the calendar toggle part', async () => {
      picker = await fixture(
        html`<igc-date-picker required></igc-date-picker>`
      );
      dateTimeInput = picker.renderRoot.querySelector(
        IgcDateTimeInputComponent.tagName
      )!;
      const icon = picker.renderRoot.querySelector(
        `[name='${pickerShowIcon}']`
      )!;

      expect(picker.invalid).to.be.false;
      expect(dateTimeInput.invalid).to.be.false;

      simulatePointerDown(icon);
      await elementUpdated(picker);

      expect(picker.invalid).to.be.false;
      expect(dateTimeInput.invalid).to.be.false;
    });
  });

  describe('Validation message slots', () => {
    it('', () => {
      const now = CalendarDay.today;
      const tomorrow = now.add('day', 1);
      const yesterday = now.add('day', -1);

      const testParameters: ValidationContainerTestsParams<IgcDatePickerComponent>[] =
        [
          { slots: ['valueMissing'], props: { required: true } }, // value-missing slot
          {
            slots: ['rangeOverflow'],
            props: { value: now.native, max: yesterday.native }, // range-overflow slot
          },
          {
            slots: ['rangeUnderflow'],
            props: { value: now.native, min: tomorrow.native }, // range-underflow slot
          },
          {
            slots: ['badInput'],
            props: {
              value: now.native,
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

      runValidationContainerTests(IgcDatePickerComponent, testParameters);
    });
  });
});

const selectCurrentDate = (calendar: IgcCalendarComponent) => {
  const daysView = calendar.renderRoot.querySelector(
    IgcDaysViewComponent.tagName
  )!;

  const currentDaySpan = daysView.renderRoot.querySelector(
    'span[part~="current"]'
  )!;
  simulateClick(currentDaySpan?.children[0]);
};

function checkDatesEqual(a: CalendarDay | Date, b: CalendarDay | Date) {
  expect(toCalendarDay(a).equalTo(toCalendarDay(b))).to.be.true;
}
