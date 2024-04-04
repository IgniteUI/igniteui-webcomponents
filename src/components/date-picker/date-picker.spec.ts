import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import IgcDatepickerComponent from './date-picker.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import {
  DateRangeDescriptor,
  DateRangeType,
} from '../calendar/common/calendar.model.js';
import IgcDaysViewComponent from '../calendar/days-view/days-view.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  simulateClick,
  simulateKeyboard,
} from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';

describe('Date picker', () => {
  before(() => defineComponents(IgcDatepickerComponent));

  let picker: IgcDatepickerComponent;
  let dateTimeInput: IgcDateTimeInputComponent;
  let calendar: IgcCalendarComponent;

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

    it('should render slotted elements - prefix, suffix, clear-icon, calendar-icon(-open), helper-text, title, actions', async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker>
          <span slot="prefix">$</span>
          <span slot="suffix">~</span>
          <p slot="helper-text">For example, select your birthday</p>
          <p slot="title">Custom title</p>
          <span slot="calendar-icon-open">v</span>
          <span slot="calendar-icon">^</span>
          <span slot="clear-icon">X</span>
          <button slot="actions">Custom action</button>
        </igc-datepicker>`
      );
      await elementUpdated(picker);

      dateTimeInput = picker.shadowRoot!.querySelector(
        IgcDateTimeInputComponent.tagName
      ) as IgcDateTimeInputComponent;

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
          prerequisite: () => (picker.mode = 'dialog'),
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
          prerequisite: () => picker.show(),
          parent: picker,
        },
        {
          slot: 'clear-icon',
          tagName: 'span',
          content: 'X',
          prerequisite: () => (picker.value = new Date()),
          parent: picker,
        },
        {
          slot: 'actions',
          tagName: 'button',
          content: 'Custom action',
          prerequisite: () => picker.show(),
          parent: picker,
        },
      ];

      for (let i = 0; i < slotTests.length; i++) {
        slotTests[i].prerequisite?.();
        await elementUpdated(picker);

        const slot = slotTests[i].parent.shadowRoot!.querySelector(
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
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker mode="dropdown">
          <p slot="title">Custom title</p>
        </igc-datepicker>`
      );
      await elementUpdated(picker);

      const slot = picker.shadowRoot!.querySelector(
        `slot[name="title"]`
      ) as HTMLSlotElement;
      expect(slot).to.be.null;
    });

    it('should be successfully initialized with value', async () => {
      const expectedValue = new Date(2024, 1, 29);
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker .value="${expectedValue}"></igc-datepicker>`
      );
      dateTimeInput = picker.shadowRoot!.querySelector(
        IgcDateTimeInputComponent.tagName
      ) as IgcDateTimeInputComponent;

      expect(picker.value).not.to.be.null;
      checkDatesEqual(picker.value!, expectedValue);
      expect(dateTimeInput.value).not.to.be.null;
      checkDatesEqual(dateTimeInput.value!, expectedValue);
    });

    it('should be successfully initialized in open state in dropdown mode', async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker open></igc-datepicker>`
      );
      calendar = picker.shadowRoot!.querySelector(
        IgcCalendarComponent.tagName
      ) as IgcCalendarComponent;

      expect(picker.mode).to.equal('dropdown');
      picker.show();
      await elementUpdated(picker);

      const popover = picker.shadowRoot?.querySelector('igc-popover');
      expect(popover).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.have.tagName('igc-focus-trap');
    });

    it('should be successfully initialized in open state in dialog mode', async () => {
      picker = await fixture<IgcDatepickerComponent>(
        html`<igc-datepicker open mode="dialog"></igc-datepicker>`
      );
      calendar = picker.shadowRoot!.querySelector(
        IgcCalendarComponent.tagName
      ) as IgcCalendarComponent;

      expect(picker.mode).to.equal('dialog');
      picker.show();
      await elementUpdated(picker);

      const dialog = picker.shadowRoot?.querySelector('igc-dialog');
      expect(dialog).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.equal(dialog);
    });
  });

  describe('Attributes and properties', () => {
    const currentDate = new Date(new Date().setHours(0, 0, 0));
    const tomorrowDate = new Date(
      new Date().setDate(currentDate.getDate() + 1)
    );

    it('should set the value trough attribute correctly', async () => {
      expect(picker.value).to.be.null;
      const expectedValue = new Date(2024, 2, 1);
      picker.setAttribute('value', expectedValue.toDateString());
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

      picker.show();
      await elementUpdated(picker);

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

      picker.show();
      await elementUpdated(picker);

      simulateClick(document.body);
      await elementUpdated(picker);

      expect(picker.open).to.equal(true);
    });

    it('should modify value only through calendar selection and not input when nonEditable is true', async () => {
      picker.value = tomorrowDate;
      await elementUpdated(picker);

      picker.nonEditable = true;
      await elementUpdated(picker);

      picker.show();
      await elementUpdated(picker);

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
      picker.value = tomorrowDate;
      await elementUpdated(picker);

      picker.readOnly = true;
      await elementUpdated(picker);

      picker.show();
      await elementUpdated(picker);

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
        expect((calendar as any)[prop]).to.equal(value);
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

    describe('Active date', () => {
      const tomorrowDate = new Date(
        new Date().setDate(currentDate.getDate() + 1)
      );
      const after10DaysDate = new Date(
        new Date().setDate(currentDate.getDate() + 10)
      );
      const after20DaysDate = new Date(
        new Date().setDate(currentDate.getDate() + 20)
      );

      it('should initialize activeDate with current date, when not set', async () => {
        checkDatesEqual(picker.activeDate, currentDate);
        expect(picker.value).to.be.null;
        checkDatesEqual(calendar.activeDate, currentDate);
        expect(calendar.value).to.be.undefined;
      });

      it('should initialize activeDate = value when it is not set, but value is', async () => {
        const valueDate = after10DaysDate;
        picker = await fixture<IgcDatepickerComponent>(
          html`<igc-datepicker .value=${valueDate} />`
        );
        await elementUpdated(picker);

        checkDatesEqual(picker.value as Date, valueDate);

        calendar = picker.shadowRoot!.querySelector(
          IgcCalendarComponent.tagName
        ) as IgcCalendarComponent;

        checkDatesEqual(picker.activeDate, after10DaysDate);
        checkDatesEqual(calendar.activeDate, after10DaysDate);
        checkDatesEqual(calendar.value as Date, after10DaysDate);
      });

      it('should set activeDate correctly', async () => {
        picker.activeDate = tomorrowDate;

        await elementUpdated(picker);
        checkDatesEqual(calendar.activeDate, tomorrowDate);

        // value is null
        expect(picker.value).to.be.null;

        // setting the value does not affect the activeDate, when it is explicitly set
        picker.value = after20DaysDate;
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

      picker.show();
      await elementUpdated(picker);

      simulateKeyboard(picker, escapeKey);
      await elementUpdated(picker);

      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).calledWith('igcClosed');
      eventSpy.resetHistory();

      // dialog mode
      picker.mode = 'dialog';
      await elementUpdated(picker);
      picker.show();
      await elementUpdated(picker);

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

      const dialog = picker.shadowRoot!.querySelector('igc-dialog');
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
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcDatepickerComponent>(
      html`<igc-datepicker name="datePicker"></igc-datepicker>`
    );

    beforeEach(async () => {
      await spec.setup(IgcDatepickerComponent.tagName);
    });

    it('should be form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('should not participate in form submission if the value is empty/invalid', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('should participate in form submission if there is a value and the value adheres to the validation constraints', async () => {
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value.toISOString()
      );
    });

    it('should reset to its default value state on form reset', async () => {
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);

      spec.reset();
      expect(spec.element.value).to.be.null;
    });

    it('should reflect disabled ancestor state (fieldset/form)', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('should enforce required constraint', async () => {
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('should enforce min value constraint', async () => {
      spec.element.min = new Date(2025, 0, 1);
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2022, 0, 1);
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2025, 0, 2);
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('should enforce max value constraint', async () => {
      spec.element.max = new Date(2020, 0, 1);
      spec.element.value = new Date(Date.now());
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = new Date(2020, 0, 1);
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('should invalidate the component if a disabled date is typed in the input', async () => {
      const minDate = new Date(2024, 1, 1);
      const maxDate = new Date(2024, 1, 28);

      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      spec.element.disabledDates = disabledDates;
      await elementUpdated(spec.element);

      spec.element.value = new Date(2024, 1, 26);
      await elementUpdated(spec.element);

      expect(spec.element.invalid).to.be.true;
      spec.submitFails();
    });

    it('should enforce custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
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
  simulateClick(currentDaySpan?.children[0]);
};

const checkDatesEqual = (a: Date, b: Date) =>
  expect(new Date(a.setHours(0, 0, 0, 0)).toISOString()).to.equal(
    new Date(b.setHours(0, 0, 0, 0)).toISOString()
  );
