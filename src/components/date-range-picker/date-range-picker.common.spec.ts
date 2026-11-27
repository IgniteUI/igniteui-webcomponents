import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { registerI18n } from 'igniteui-i18n-core';
import { ResourceStringsBG } from 'igniteui-i18n-resources';
import type Sinon from 'sinon';
import { spy } from 'sinon';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { CalendarDay } from '#internals/date/model.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import type { IgcDateRangePickerResourceStrings } from '#internals/i18n/EN/date-range-picker.resources.js';
import {
  getCalendarDOM,
  getDOMDate,
  getRenderedMonths,
} from '#internals/testing/calendar.spec.js';
import { runDisabledPopupTests } from '#internals/testing/disabled-popup.spec.js';
import {
  checkDatesEqual,
  finishAnimationsFor,
  isFocused,
} from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { isUserChange } from '#internals/user-change.js';
import { formatString } from '#internals/utils/strings.js';
import { configureTheme } from '#theming/config.js';
import type IgcButtonComponent from '../button/button.js';
import IgcCalendarComponent, { showDate } from '../calendar/calendar.js';
import { DateRangeType } from '../calendar/types.js';
import IgcChipComponent from '../chip/chip.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcDateRangeInputComponent from './date-range-input.js';
import IgcDateRangePickerComponent, {
  type CustomDateRange,
  type DateRangePickerResourceStringsType,
  type DateRangeValue,
} from './date-range-picker.js';
import {
  checkSelectedRange,
  getEditorRange,
  getEditors,
  getIcon,
  getInput,
  selectDates,
} from './date-range-picker.utils.spec.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Date range picker - common tests for single and two inputs mode', () => {
  before(() =>
    defineComponents(IgcDateRangePickerComponent, IgcDateRangeInputComponent)
  );

  let picker: IgcDateRangePickerComponent;
  let calendar: IgcCalendarComponent;

  const toggleIcon = 'today';
  const clearIcon = 'input_clear';
  const today = CalendarDay.today;
  const tomorrow = today.add('day', 1);

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
    );
    calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;
  });

  /** Cancel is the first footer button and Done the last. */
  const clickFooterButton = (selector: '' | ':last-of-type') => () =>
    simulateClick(
      picker.renderRoot.querySelector<HTMLElement>(
        `igc-button[slot="footer"]${selector}`
      )!
    );

  const clickOutsideDialog = () => {
    const dialog = picker.renderRoot.querySelector(IgcDialogComponent.tagName)!;
    const { x, y } = dialog.getBoundingClientRect();
    simulateClick(dialog.renderRoot.querySelector('dialog')!, {
      clientX: x + 1,
      clientY: y - 1,
    });
  };

  describe('Rendering and initialization', () => {
    it('accepts a value and bounds set before the first render', async () => {
      const today = CalendarDay.today;

      for (const useTwoInputs of [false, true]) {
        const element = document.createElement(
          IgcDateRangePickerComponent.tagName
        ) as IgcDateRangePickerComponent;

        // Validation runs on each set, before any editor exists.
        expect(() =>
          Object.assign(element, {
            useTwoInputs,
            value: { start: today.native, end: today.add('day', 1).native },
            max: today.add('day', -1).native,
            min: today.add('day', -5).native,
          })
        ).not.to.throw();

        document.body.append(element);
        await elementUpdated(element);

        expect(element.validity.rangeOverflow).to.be.true;
        element.remove();
      }
    });

    it('should be successfully initialized in open state in dropdown mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker open></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dropdown');
      await picker.show();

      const popover = picker.renderRoot.querySelector(
        IgcPopoverComponent.tagName
      );
      expect(popover).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.have.tagName('igc-focus-trap');
    });

    it('should be successfully initialized in open state in dialog mode', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          open
          mode="dialog"
          use-two-inputs
        ></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.mode).to.equal('dialog');
      await picker.show();

      const dialog = picker.renderRoot.querySelector(
        IgcDialogComponent.tagName
      );
      expect(dialog).not.to.be.undefined;
      expect(calendar).not.to.be.undefined;
      expect(calendar.parentElement).to.equal(dialog);
    });
    it('should render the clear icon as soon as there is a start or end date defined', async () => {
      expect(picker.open).to.equal(false);
      expect(picker.value).to.be.null;

      let clear = getIcon(picker, clearIcon);
      expect(clear).to.be.null;

      picker.value = { start: today.native, end: null };
      await elementUpdated(picker);

      expect(picker.value).to.deep.equal({
        start: today.native,
        end: null,
      });
      clear = getIcon(picker, clearIcon);
      expect(clear).not.to.be.null;

      picker.value = { start: null, end: tomorrow.native };
      await elementUpdated(picker);

      expect(picker.value).to.deep.equal({
        start: null,
        end: tomorrow.native,
      });
      clear = getIcon(picker, clearIcon);
      expect(clear).not.to.be.null;
    });

    it('exposes the ranges part of the predefined ranges area', async () => {
      const style = document.createElement('style');
      style.textContent =
        'igc-date-range-picker::part(ranges) { --part-probe: exposed; }';
      document.head.append(style);

      try {
        picker.usePredefinedRanges = true;
        await elementUpdated(picker);

        const ranges = picker.renderRoot
          .querySelector(IgcPredefinedRangesAreaComponent.tagName)!
          .renderRoot.querySelector('[part~="ranges"]')!;
        expect(
          getComputedStyle(ranges).getPropertyValue('--part-probe').trim()
        ).to.equal('exposed');
      } finally {
        style.remove();
      }
    });

    it('renders outlined and contained dialog buttons in the indigo theme', async () => {
      const variants = () =>
        Array.from(
          picker.renderRoot.querySelectorAll<IgcButtonComponent>(
            'igc-button[slot="footer"]'
          ),
          (button) => button.variant
        );

      picker.mode = 'dialog';
      await elementUpdated(picker);

      expect(variants()).to.eql(['flat', 'flat']);

      try {
        configureTheme('indigo');
        await elementUpdated(picker);
        picker.requestUpdate();
        await elementUpdated(picker);

        expect(variants()).to.eql(['outlined', 'contained']);
      } finally {
        configureTheme('bootstrap');
      }
    });
  });

  describe('Common properties', () => {
    it('should set the visibleMonths property correctly', async () => {
      expect(picker.visibleMonths).to.equal(2);

      picker.visibleMonths = 1;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(1);

      // in case value other than 1 or 2 the value defaults to 2
      picker.visibleMonths = 11;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(2);

      picker.visibleMonths = Number.NaN;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(2);

      picker.visibleMonths = undefined as any;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(2);
    });

    it('should set the visibleMonths property via attribute', async () => {
      expect(picker.visibleMonths).to.equal(2);

      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker visible-months="1"></igc-date-range-picker>`
      );

      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(1);

      picker.setAttribute('visible-months', '11');
      await elementUpdated(picker);

      expect(picker.visibleMonths).to.equal(2);

      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker visible-months="2"></igc-date-range-picker>`
      );
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(2);
    });

    it('should keep the calendar selection and input values on switching to two inputs and back', async () => {
      const expectedValue = { start: today.native, end: tomorrow.native };
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          .value=${expectedValue}
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
      await waitUntil(() => !picker.open);
      expect(picker.open).to.equal(false);
    });

    it('should keep the picker open when keepOpenOnSelect is enabled and a selection is made in the calendar picker', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.keepOpenOnSelect = true;
      await elementUpdated(picker);
      await picker.show();
      await selectDates(today, tomorrow, calendar);
      expect(eventSpy).calledWith('igcChange');
      checkSelectedRange(
        picker,
        { start: today.native, end: tomorrow.native },
        false
      );
      expect(picker.open).to.equal(true);

      await picker.hide();
      picker.mode = 'dialog';
      await elementUpdated(picker);
      expect(picker.open).to.equal(false);

      await picker.show();
      await selectDates(today.add('day', 2), tomorrow.add('day', 2), calendar);
      checkSelectedRange(
        picker,
        {
          start: today.add('day', 2).native,
          end: tomorrow.add('day', 2).native,
        },
        false
      );
      expect(picker.open).to.equal(true);
    });

    it('should not change keepOpenOnSelect when the mode changes', async () => {
      picker.mode = 'dialog';
      await elementUpdated(picker);
      expect(picker.keepOpenOnSelect).to.be.false;

      await picker.show();
      await selectDates(today, tomorrow, calendar);
      expect(picker.open).to.be.true;

      await picker.hide();
      picker.mode = 'dropdown';
      await elementUpdated(picker);

      await picker.show();
      await selectDates(today.add('day', 2), tomorrow.add('day', 2), calendar);
      await elementUpdated(picker);
      expect(picker.open).to.be.false;
    });

    it('should set properties of the calendar correctly', async () => {
      const props = {
        activeDate: new Date(2025, 3, 9),
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

      expect(picker.value).to.be.null;
      expect(picker.weekStart).to.equal('sunday');
      expect(picker.hideOutsideDays).to.equal(false);
      expect(picker.hideHeader).to.equal(false);
      expect(picker.showWeekNumbers).to.equal(false);
      expect(picker.headerOrientation).to.equal('horizontal');
      expect(picker.orientation).to.equal('horizontal');
      expect(calendar.disabledDates).to.be.undefined;
      expect(calendar.specialDates).to.be.undefined;
      checkDatesEqual(calendar.activeDate, today.native);

      Object.assign(picker, props);
      await elementUpdated(picker);

      for (const [prop, value] of Object.entries(props)) {
        expect((calendar as any)[prop]).to.eql(value);
      }
    });
    describe('Localization', () => {
      beforeEach(async () => {
        picker = await fixture<IgcDateRangePickerComponent>(
          html`<igc-date-range-picker></igc-date-range-picker>`
        );
        picker.usePredefinedRanges = true;
      });

      it('forwards its calendar strings to the calendar', async () => {
        picker.resourceStrings = { calendar_previous_month: 'Back' };
        await elementUpdated(picker);

        const pickerCalendar = picker.renderRoot.querySelector(
          IgcCalendarComponent.tagName
        )!;
        expect(pickerCalendar.resourceStrings.calendar_previous_month).to.equal(
          'Back'
        );
      });

      it('should default inputFormat to whatever Intl.DateTimeFormat returns for the current locale', async () => {
        const defaultFormat = 'MM/dd/yyyy';
        expect(picker.locale).to.equal('en-US');
        expect(picker.inputFormat).to.equal(defaultFormat);

        picker.locale = 'fr';
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
      });

      it('should use the value of locale format for displayFormat, if it is not defined', async () => {
        expect(picker.locale).to.equal('en-US');
        expect(picker.getAttribute('display-format')).to.be.null;
        expect(picker.displayFormat).to.equal('M/d/yyyy');

        picker.locale = 'fr';
        await elementUpdated(picker);
        expect(picker.inputFormat).to.equal('dd/MM/yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);

        picker.setAttribute('input-format', 'dd-MM-yyyy');
        await elementUpdated(picker);

        expect(picker.inputFormat).to.equal('dd-MM-yyyy');
        expect(picker.displayFormat).to.equal(picker.inputFormat);
      });

      it('should expose the default strings for localization', async () => {
        picker.useTwoInputs = true;
        picker.resourceStrings = {
          done: 'Done - localized',
          cancel: 'Cancel - localized',
          separator: 'Separator - localized',
        };
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

      it('should set the resource strings of the predefined-ranges-area component', async () => {
        const testObject: IgcDateRangePickerResourceStrings = {
          last7Days: 'Last 7 days - localized',
          currentMonth: 'Current month - localized',
          last30Days: 'Last 30 days - localized',
          yearToDate: 'Year to date - localized',
        };
        const testKeys = Object.getOwnPropertyNames(testObject).map(
          (key) => key as keyof IgcDateRangePickerResourceStrings
        );

        picker.resourceStrings = testObject;
        picker.usePredefinedRanges = true;
        await elementUpdated(picker);

        const predefinedArea = picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        )!;

        for (const key of testKeys) {
          expect(
            predefinedArea?.resourceStrings[
              key as keyof IgcDateRangePickerResourceStrings
            ]
          ).to.equal(testObject[key]);
        }

        const chipElements = predefinedArea.renderRoot.querySelectorAll(
          'igc-chip'
        ) as NodeListOf<IgcChipComponent>;
        for (const key of testKeys) {
          expect(chipElements[testKeys.indexOf(key)].innerText.trim()).to.equal(
            testObject[key]
          );
        }
      });

      it('should set the resource strings of the predefined ranges area by passing a new resource strings object the old way', async () => {
        const testObject: IgcDateRangePickerResourceStrings = {
          last7Days: 'Last 7 days - localized',
          currentMonth: 'Current month - localized',
          last30Days: 'Last 30 days - localized',
          yearToDate: 'Year to date - localized',
        };
        const testKeys = Object.getOwnPropertyNames(testObject).map(
          (key) => key as keyof IgcDateRangePickerResourceStrings
        );

        // A spread of picker.resourceStrings fails for old resources, because it returns mixed resources.
        const testResourceStrings = testObject;
        picker.resourceStrings = testResourceStrings;
        await elementUpdated(picker);

        const predefinedArea = picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        )!;
        for (const key of testKeys) {
          expect(predefinedArea?.resourceStrings[key]).to.equal(
            testObject[key]
          );
        }

        const chipElements = predefinedArea.renderRoot.querySelectorAll(
          'igc-chip'
        ) as NodeListOf<IgcChipComponent>;
        for (const key of testKeys) {
          expect(chipElements[testKeys.indexOf(key)].innerText.trim()).to.equal(
            testObject[key]
          );
        }
      });

      it('should set the resource strings of the predefined ranges area by passing a new resource strings object the new way mixed', async () => {
        const testObject: DateRangePickerResourceStringsType = {
          date_range_picker_last7Days: 'Last 7 days - localized',
          date_range_picker_currentMonth: 'Current month - localized',
          date_range_picker_last30Days: 'Last 30 days - localized',
          date_range_picker_yearToDate: 'Year to date - localized',
        };
        const testKeys = Object.getOwnPropertyNames(testObject).map(
          (key) => key as keyof DateRangePickerResourceStringsType
        );
        const testResourceStrings = {
          ...picker.resourceStrings,
          ...testObject,
        };
        picker.resourceStrings = testResourceStrings;
        await elementUpdated(picker);

        const predefinedArea = picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        )!;
        for (const key of testKeys) {
          expect(predefinedArea?.resourceStrings[key]).to.equal(
            testObject[key]
          );
        }

        const chipElements = predefinedArea.renderRoot.querySelectorAll(
          'igc-chip'
        ) as NodeListOf<IgcChipComponent>;
        for (const key of testKeys) {
          expect(chipElements[testKeys.indexOf(key)].innerText.trim()).to.equal(
            testObject[key]
          );
        }
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
    });
    describe('Interactions', () => {
      describe('Selection via the calendar', () => {
        it('should not emit igcChange when value is unchanged and done is clicked (dialog)', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          picker.value = { start: today.native, end: tomorrow.native };
          picker.mode = 'dialog';
          await elementUpdated(picker);

          picker.open = true;
          await elementUpdated(picker);

          expect(eventSpy).not.to.be.calledWith('igcChange');
          const dialog = picker.renderRoot.querySelector(
            IgcDialogComponent.tagName
          );
          expect(dialog?.hasAttribute('open')).to.equal(true);

          const doneBtn = picker.shadowRoot!.querySelector(
            'igc-button[slot="footer"]:last-of-type'
          ) as HTMLButtonElement;
          doneBtn?.click();
          await elementUpdated(picker);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('should not emit igcChange for a value set from code while the dialog is open (dialog)', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          picker.mode = 'dialog';
          await picker.show();

          picker.value = { start: today.native, end: tomorrow.native };
          await elementUpdated(picker);

          picker.select({ start: tomorrow.native, end: tomorrow.native });
          await elementUpdated(picker);

          const doneBtn = picker.renderRoot.querySelector<HTMLElement>(
            'igc-button[slot="footer"]:last-of-type'
          )!;
          simulateClick(doneBtn);
          await elementUpdated(picker);

          expect(eventSpy).not.calledWith('igcChange');
          expect(picker.value).to.deep.equal({
            start: tomorrow.native,
            end: tomorrow.native,
          });
        });

        /** Opens the dialog over a committed range and selects a draft range. */
        const selectDraftInDialog = async () => {
          const value = { start: today.native, end: tomorrow.native };
          picker.value = value;
          picker.mode = 'dialog';
          await picker.show();
          await elementUpdated(picker);

          const eventSpy = spy(picker, 'emitEvent');
          await selectDates(
            today.set({ date: 10 }),
            today.set({ date: 14 }),
            picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!
          );

          return { value, eventSpy };
        };

        it('restores the range on Cancel after a canceled close on an outside click (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();
          picker.addEventListener(
            'igcClosing',
            (event) => event.preventDefault(),
            { once: true }
          );

          const dialog = picker.renderRoot.querySelector(
            IgcDialogComponent.tagName
          )!;
          const { x, y } = dialog.getBoundingClientRect();
          simulateClick(dialog.renderRoot.querySelector('dialog')!, {
            clientX: x + 1,
            clientY: y - 1,
          });
          await elementUpdated(picker);
          expect(picker.open).to.be.true;

          simulateClick(
            picker.renderRoot.querySelector<HTMLElement>(
              'igc-button[slot="footer"]'
            )!
          );
          await elementUpdated(picker);

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        const cancelButton = () =>
          picker.renderRoot.querySelector<HTMLElement>(
            'igc-button[slot="footer"]'
          )!;
        const doneButton = () =>
          picker.renderRoot.querySelector<HTMLElement>(
            'igc-button[slot="footer"]:last-of-type'
          )!;
        const cancelNextClose = () =>
          picker.addEventListener(
            'igcClosing',
            (event) => event.preventDefault(),
            { once: true }
          );

        it('commits nothing on Done when `igcClosing` is canceled (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();
          const draft = picker.value;
          cancelNextClose();

          simulateClick(doneButton());
          await elementUpdated(picker);

          expect(picker.open).to.be.true;
          expect(picker.value).to.eql(draft);
          expect(eventSpy).not.calledWith('igcChange');

          simulateClick(cancelButton());
          await elementUpdated(picker);

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('keeps the draft on Cancel when `igcClosing` is canceled (dialog)', async () => {
          const { eventSpy } = await selectDraftInDialog();
          const draft = picker.value;
          cancelNextClose();

          simulateClick(cancelButton());
          await elementUpdated(picker);

          expect(picker.open).to.be.true;
          expect(picker.value).to.eql(draft);

          simulateClick(doneButton());
          await elementUpdated(picker);

          expect(eventSpy).calledWith('igcChange', { detail: draft });
        });

        it('emits `igcChange` after `igcClosing` on Done (dialog)', async () => {
          const { eventSpy } = await selectDraftInDialog();
          eventSpy.resetHistory();

          simulateClick(doneButton());
          await waitUntil(() => eventSpy.calledWith('igcClosed'));

          expect(eventSpy.args.map(([name]) => name)).to.eql([
            'igcClosing',
            'igcChange',
            'igcClosed',
          ]);
        });

        it('keeps the range of Escape when the dialog opens again during the exit (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();

          simulateKeyboard(picker, escapeKey);
          picker.open = false;
          await elementUpdated(picker);
          picker.open = true;
          await elementUpdated(picker);

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('keeps the range of Done on Cancel when the dialog shows again during the exit (dialog)', async () => {
          const { eventSpy } = await selectDraftInDialog();
          const draft = picker.value;

          simulateClick(doneButton());
          await picker.show();
          expect(picker.open).to.be.true;

          simulateClick(cancelButton());
          await waitUntil(() => !picker.open);
          picker.blur();
          await elementUpdated(picker);

          expect(picker.value).to.eql(draft);
          expect(
            eventSpy.withArgs('igcChange').args.map(([, init]) => init?.detail)
          ).to.eql([draft]);
        });

        it('restores the range from before the draft on Cancel after `hide()` and an open (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();

          await picker.hide();
          await picker.show();
          simulateClick(cancelButton());
          await waitUntil(() => !picker.open);

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('reports the draft on Done after `hide()` and an open (dialog)', async () => {
          const { eventSpy } = await selectDraftInDialog();
          const draft = picker.value;

          await picker.hide();
          await picker.show();
          simulateClick(doneButton());
          await waitUntil(() => !picker.open);

          expect(
            eventSpy.withArgs('igcChange').args.map(([, init]) => init?.detail)
          ).to.eql([draft]);
        });

        it('restores the range from before the draft when disabled (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();

          picker.disabled = true;
          await elementUpdated(picker);

          expect(picker.open).to.be.false;
          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('restores the range from before the draft when disabled after `hide()` (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();

          await picker.hide();
          picker.disabled = true;
          await elementUpdated(picker);

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('ignores Done, Cancel and Escape during the exit of `hide()` (dialog)', async () => {
          const { eventSpy } = await selectDraftInDialog();
          const draft = picker.value;

          const closed = picker.hide();
          for (const button of picker.renderRoot.querySelectorAll<HTMLElement>(
            'igc-button[slot="footer"]'
          )) {
            simulateClick(button);
          }
          simulateKeyboard(picker, escapeKey);

          expect(await closed).to.be.true;
          expect(picker.value).to.eql(draft);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('ignores Done during the exit after Escape (dialog)', async () => {
          const { value, eventSpy } = await selectDraftInDialog();

          simulateKeyboard(picker, escapeKey);
          simulateClick(
            picker.renderRoot.querySelector<HTMLElement>(
              'igc-button[slot="footer"]:last-of-type'
            )!
          );
          finishAnimationsFor(
            picker.renderRoot.querySelector(IgcDialogComponent.tagName)!
              .shadowRoot!
          );
          await waitUntil(() => eventSpy.calledWith('igcClosed'));

          expect(picker.value).to.eql(value);
          expect(eventSpy).not.calledWith('igcChange');
        });

        it('clears the value when the range start is activated again in the calendar', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          await picker.show();

          await selectDates(today, null, calendar);
          expect(eventSpy).calledWith('igcChange', {
            detail: { start: today.native, end: today.native },
          });

          await selectDates(today, null, calendar);
          await elementUpdated(picker);

          expect(eventSpy.lastCall).calledWith('igcChange', {
            detail: null,
          });
          expect(picker.value).to.be.null;
          expect(picker.open).to.be.true;
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

          picker.mode = 'dialog';
          await elementUpdated(picker);

          await picker.show();

          simulateKeyboard(picker, escapeKey);
          await elementUpdated(picker);
          await waitUntil(() => eventSpy.calledWith('igcClosed'));

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
          await waitUntil(() => eventSpy.calledWith('igcOpened'));

          const dialog = picker.renderRoot.querySelector(
            IgcDialogComponent.tagName
          );
          expect(picker.open).to.be.true;
          expect(dialog?.open).to.be.true;
          expect(eventSpy).calledWith('igcOpening');
          expect(eventSpy).calledWith('igcOpened');
          eventSpy.resetHistory();

          simulateKeyboard(picker, [altKey, arrowUp]);
          await elementUpdated(picker);
          await waitUntil(() => eventSpy.calledWith('igcClosed'));

          expect(picker.open).to.be.false;
          expect(eventSpy).calledWith('igcClosing');
          expect(eventSpy).calledWith('igcClosed');
        });

        describe('Interactions with the show icon', () => {
          it('should open the picker on calendar show icon click in dropdown mode', async () => {
            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            expect(picker.open).to.be.true;
          });
          it('should open the picker on calendar show icon click in dialog mode', async () => {
            picker.mode = 'dialog';
            await elementUpdated(picker);

            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            expect(picker.open).to.be.true;
          });
        });
      });
      describe('Clear and blur', () => {
        const value = { start: today.native, end: tomorrow.native };

        /** Clears a range set from code with the clear icon, with focus in the first editor. */
        const clearWithIcon = async (useTwoInputs: boolean) => {
          picker.useTwoInputs = useTwoInputs;
          picker.value = value;
          await elementUpdated(picker);

          picker.renderRoot
            .querySelector<HTMLElement>(
              useTwoInputs
                ? IgcDateTimeInputComponent.tagName
                : IgcDateRangeInputComponent.tagName
            )!
            .focus();
          simulateClick(getIcon(picker, clearIcon));
          await elementUpdated(picker);
        };

        const toDialog = () => {
          picker.mode = 'dialog';
        };

        const cases: {
          name: string;
          useTwoInputs: boolean;
          setup: () => void;
          close?: () => void;
        }[] = [
          ...[false, true].flatMap((useTwoInputs) => {
            const layout = useTwoInputs ? 'two inputs' : 'single input';
            return [
              {
                name: `in dialog mode (${layout})`,
                useTwoInputs,
                setup: toDialog,
              },
              {
                name: `in non-editable dropdown mode (${layout})`,
                useTwoInputs,
                setup: () => {
                  picker.nonEditable = true;
                },
              },
            ];
          }),
          {
            name: 'after an open and Cancel (dialog)',
            useTwoInputs: false,
            setup: toDialog,
            close: clickFooterButton(''),
          },
          {
            name: 'after an open and Done (dialog)',
            useTwoInputs: false,
            setup: toDialog,
            close: clickFooterButton(':last-of-type'),
          },
          {
            name: 'after an open and an outside click (dialog)',
            useTwoInputs: false,
            setup: toDialog,
            close: clickOutsideDialog,
          },
        ];

        for (const { name, useTwoInputs, setup, close } of cases) {
          it(`reports the clear one time on blur ${name}`, async () => {
            const eventSpy = spy(picker, 'emitEvent');
            setup();
            await clearWithIcon(useTwoInputs);

            if (close) {
              await picker.show();
              close();
              await waitUntil(() => !picker.open);
            }

            picker.blur();
            await elementUpdated(picker);

            expect(
              eventSpy
                .withArgs('igcChange')
                .args.map(([, init]) => init?.detail)
            ).to.eql([null]);
            expect(picker.value).to.be.null;
          });
        }
      });

      describe('Readonly state', () => {
        it('should not modify value through selection when readOnly is true', async () => {
          const eventSpy = spy(picker, 'emitEvent');
          picker.readOnly = true;
          await elementUpdated(picker);
          expect(picker.value).to.be.null;

          await picker.show();

          calendar = picker.renderRoot.querySelector(
            IgcCalendarComponent.tagName
          )!;
          await selectDates(today, tomorrow, calendar);
          expect(picker.value).to.be.null;
          expect(calendar.values).to.deep.equal([]);
          expect(eventSpy).not.to.be.called;
        });
        describe('Dropdown mode', () => {
          beforeEach(async () => {
            picker.readOnly = true;
            picker.value = { start: today.native, end: tomorrow.native };
            await elementUpdated(picker);
          });

          it('should not show the picker on calendar icon click', async () => {
            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
          });

          it('should not show the picker on keyboard shortcut', async () => {
            simulateKeyboard(picker, [altKey, arrowDown]);
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
          });

          it('should not clear the value by clicking on the toggle icon', async () => {
            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            checkSelectedRange(
              picker,
              { start: today.native, end: tomorrow.native },
              false
            );
          });
        });
        describe('Dialog mode', () => {
          beforeEach(async () => {
            picker.readOnly = true;
            picker.mode = 'dialog';
            picker.value = { start: today.native, end: tomorrow.native };
            await elementUpdated(picker);
          });

          it('should not show the picker on calendar icon click', async () => {
            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
          });

          it('should not show the picker on keyboard shortcut', async () => {
            simulateKeyboard(picker, [altKey, arrowDown]);
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
          });

          it('should not clear the value by clicking on the toggle icon', async () => {
            simulateClick(getIcon(picker, toggleIcon));
            await elementUpdated(picker);

            checkSelectedRange(
              picker,
              { start: today.native, end: tomorrow.native },
              false
            );
          });
        });
      });
    });
    describe('Predefined ranges', () => {
      let eventSpy: Sinon.SinonSpy;
      const previousThreeDaysStart = CalendarDay.today.add('day', -3).native;
      const nextThreeDaysEnd = CalendarDay.today.add('day', 3).native;

      const customRanges: CustomDateRange[] = [
        {
          label: 'Previous Three Days',
          dateRange: {
            start: previousThreeDaysStart,
            end: today.native,
          },
        },
        {
          label: 'Next Three Days',
          dateRange: {
            start: today.native,
            end: nextThreeDaysEnd,
          },
        },
      ];

      beforeEach(async () => {
        eventSpy = spy(picker, 'emitEvent');
      });

      afterEach(() => {
        eventSpy.resetHistory();
      });

      function getEventArgs() {
        return eventSpy.firstCall.lastArg.detail as DateRangeValue;
      }

      function getPredefinedArea() {
        return picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        )!;
      }

      function getPopover() {
        return picker.renderRoot.querySelector(IgcPopoverComponent.tagName);
      }

      function getDialog() {
        return picker.renderRoot.querySelector(IgcDialogComponent.tagName);
      }

      function getDialogDoneButton() {
        return picker.renderRoot.querySelector(
          'igc-button[slot="footer"]:last-of-type'
        ) as IgcButtonComponent;
      }

      function getRangeChips() {
        return getPredefinedArea().renderRoot.querySelectorAll(
          IgcChipComponent.tagName
        )!;
      }

      it('should not render the predefined ranges in the DOM when usePredefinedRanges is false and there are no custom ranges added', async () => {
        await picker.show();
        expect(getPredefinedArea()).to.be.null;
      });

      it('should emit igcChange when predefined date is selected and should close the picker - dropdown mode', async () => {
        const popover = getPopover();

        picker.usePredefinedRanges = true;
        picker.customRanges = customRanges;
        await picker.show();

        for (const chip of getRangeChips()) {
          await picker.show();
          simulateClick(chip);
          await elementUpdated(chip);

          expect(eventSpy).calledWith('igcChange');
          const range = getEventArgs();

          expect(picker.activeDate).to.eql(range.start);
          checkSelectedRange(
            picker,
            { start: range.start, end: range.end },
            false
          );
          expect(popover?.open).to.be.false;
          eventSpy.resetHistory();
        }
      });

      it('keeps the picker open after a range chip when keepOpenOnSelect is set - dropdown mode', async () => {
        picker.usePredefinedRanges = true;
        picker.customRanges = customRanges;
        picker.keepOpenOnSelect = true;
        await picker.show();

        simulateClick(getRangeChips()[0]);
        await elementUpdated(picker);

        expect(picker.open).to.be.true;
        expect(getPopover()?.open).to.be.true;
        expect(eventSpy.getCalls().map(({ args }) => args[0])).to.eql([
          'igcChange',
        ]);
      });

      it('should emit igcChange on committing the new selection through predefined ranges - dialog mode', async () => {
        picker.mode = 'dialog';
        await elementUpdated(picker);

        picker.usePredefinedRanges = true;
        picker.customRanges = customRanges;

        picker.open = true;
        await elementUpdated(picker);

        const chipSpy = spy(getPredefinedArea()!, '_handleRangeSelect' as any);

        for (const chip of getRangeChips()) {
          await picker.show();
          simulateClick(chip);
          await elementUpdated(picker);

          const range = chipSpy.firstCall.firstArg as DateRangeValue;

          expect(picker.activeDate).to.eql(range.start);
          checkSelectedRange(
            picker,
            {
              start: range.start,
              end: range.end,
            },
            false
          );

          expect(getDialog()?.open).to.be.true;
          simulateClick(getDialogDoneButton());
          await elementUpdated(picker);
          await waitUntil(() => eventSpy.calledWith('igcClosed'));

          if (eventSpy.args.length > 2) {
            expect(eventSpy).calledWith('igcChange');
          }
          expect(eventSpy).calledWith('igcClosing');
          expect(eventSpy).calledWith('igcClosed');

          expect(getDialog()?.open).to.be.false;
          chipSpy.resetHistory();
          eventSpy.resetHistory();
        }
      });

      it('ignores a predefined range during the exit of the dialog', async () => {
        picker.mode = 'dialog';
        picker.usePredefinedRanges = true;
        await elementUpdated(picker);

        picker.open = true;
        await elementUpdated(picker);

        simulateClick(getDialogDoneButton());
        const value = picker.value;
        simulateClick(getRangeChips()[0]);
        await elementUpdated(picker);

        expect(picker.value).to.eql(value);
        expect(eventSpy).not.calledWith('igcChange');
      });

      it('should render only custom chips, when usePredefinedRanges is false and emit igcChange when custom date is selected', async () => {
        const popover = getPopover();

        picker.usePredefinedRanges = false;
        picker.customRanges = customRanges;
        await picker.show();

        for (const chip of getRangeChips()) {
          await picker.show();
          simulateClick(chip);
          await elementUpdated(picker);

          expect(eventSpy).calledWith('igcChange');
          const range = getEventArgs();
          expect(picker.activeDate).to.eql(range.start);

          checkSelectedRange(
            picker,
            {
              start: range.start,
              end: range.end,
            },
            false
          );
          expect(popover?.open).to.be.false;
          eventSpy.resetHistory();
        }
      });
    });
  });
  describe('Value rules', () => {
    const april10 = new Date(2025, 3, 10);
    const may20 = new Date(2025, 4, 20);
    const june1 = new Date(2025, 5, 1);
    const june10 = new Date(2025, 5, 10);

    async function pick(date: Date, view: number) {
      const views = getCalendarDOM(calendar).views.allDays;
      simulateClick(getDOMDate(CalendarDay.from(date), views[view]));
      await elementUpdated(picker);
      await elementUpdated(calendar);
    }

    it('is null without a value', () => {
      expect(picker.value).to.be.null;
      expect(picker.defaultValue).to.be.null;
    });

    it('stores an empty range as null', () => {
      picker.value = { start: june1, end: june10 };
      picker.value = { start: null, end: null };

      expect(picker.value).to.be.null;
    });

    it('swaps reversed ends set from code, as an attribute and as the default', () => {
      const ordered = { start: june1, end: june10 };

      picker.value = { start: june10, end: june1 };
      expect(picker.value).to.eql(ordered);

      picker.setAttribute(
        'value',
        JSON.stringify({ start: '2025-06-10', end: '2025-06-01' })
      );
      expect(picker.value).to.eql(ordered);

      picker.defaultValue = { start: june10, end: june1 };
      expect(picker.defaultValue).to.eql(ordered);
    });

    it('keeps the time of the ends set as an attribute', () => {
      picker.setAttribute(
        'value',
        JSON.stringify({ start: '2025-06-01T09:30', end: '2025-06-10T17:45' })
      );

      expect(picker.value).to.eql({
        start: new Date(2025, 5, 1, 9, 30),
        end: new Date(2025, 5, 10, 17, 45),
      });
    });

    it('swaps the reversed range of a custom chip', async () => {
      const eventSpy = spy(picker, 'emitEvent');
      picker.customRanges = [
        { label: 'Reversed', dateRange: { start: june10, end: june1 } },
      ];
      await picker.show();

      const area = picker.renderRoot.querySelector(
        IgcPredefinedRangesAreaComponent.tagName
      )!;
      simulateClick(area.renderRoot.querySelector(IgcChipComponent.tagName)!);
      await elementUpdated(picker);

      expect(picker.value).to.eql({ start: june1, end: june10 });
      expect(eventSpy).calledWith('igcChange', {
        detail: { start: june1, end: june10 },
      });
    });

    it('keeps the months in view when a value in the first month is set while the second month is active', async () => {
      picker.keepOpenOnSelect = true;
      await picker.show();

      const before = getRenderedMonths(calendar);
      const inFirst = CalendarDay.from(
        getCalendarDOM(calendar).views.days.activeDate
      ).set({ date: 10 });
      const inSecond = inFirst.add('month', 1).set({ date: 20 });

      // A pick in the second month makes it the active view.
      await pick(inSecond.native, 1);

      picker.value = { start: inFirst.native, end: inSecond.native };
      await elementUpdated(picker);
      await elementUpdated(calendar);

      checkDatesEqual(calendar.activeDate, inFirst.native);
      expect(getRenderedMonths(calendar)).to.eql(before);
    });

    it('keeps the months in view after a pick in the second month with `activeDate` set', async () => {
      picker.keepOpenOnSelect = true;
      picker.activeDate = april10;
      await picker.show();

      await pick(april10, 0);
      await pick(may20, 1);

      expect(picker.value).to.eql({ start: april10, end: may20 });
      expect(getRenderedMonths(calendar)).to.eql([4, 5]);

      // A new active date still moves the calendar.
      const august1 = new Date(2025, 7, 1);
      picker.activeDate = august1;
      await elementUpdated(picker);
      await elementUpdated(calendar);

      checkDatesEqual(calendar.activeDate, august1);
    });

    it('opens in the first month without a value', async () => {
      await picker.show();
      const next = CalendarDay.from(
        getCalendarDOM(calendar).views.days.activeDate
      ).add('month', 1);

      // Makes the second month the active view.
      showDate(calendar, next.native);
      await elementUpdated(calendar);
      await picker.hide();

      picker.focus();
      simulateKeyboard(picker, [altKey, arrowDown]);
      await elementUpdated(picker);
      await elementUpdated(calendar);

      expect(getRenderedMonths(calendar)[0]).to.equal(next.month + 1);
      expect(
        getCalendarDOM(calendar).views.allDays.findIndex((view) => view.active)
      ).to.equal(0);
    });

    it('brings the first defined date of a value set from code into view', async () => {
      await picker.show();

      picker.value = { start: null, end: may20 };
      await elementUpdated(picker);
      await elementUpdated(calendar);

      checkDatesEqual(calendar.activeDate, may20);
      expect(getRenderedMonths(calendar)).to.eql([5, 6]);
    });
  });

  describe('Value state motion', () => {
    const input = () =>
      picker.renderRoot.querySelector(
        `${IgcDateRangeInputComponent.tagName}, ${IgcDateTimeInputComponent.tagName}`
      )!;

    function pickRange(): void {
      const views = getCalendarDOM(calendar).views.allDays;
      const day = CalendarDay.from(views[0].activeDate);
      simulateClick(getDOMDate(day.set({ date: 10 }), views[0]));
      simulateClick(getDOMDate(day.set({ date: 20 }), views[0]));
    }

    it('marks the input as a user change for a range from the calendar', async () => {
      await picker.show();

      pickRange();

      expect(picker.value).to.not.be.null;
      expect(isUserChange(input())).to.be.true;
    });

    it('shows a value that an igcChange handler sets at once', async () => {
      const other = { start: new Date(2025, 5, 1), end: new Date(2025, 5, 10) };
      picker.addEventListener('igcChange', () => {
        picker.value = other;
      });
      await picker.show();

      pickRange();

      expect(picker.value).to.eql(other);
      expect(isUserChange(input())).to.be.false;
    });
  });

  describe('Locale week start', () => {
    it('derives the calendar week start from the locale when `week-start` is not set', async () => {
      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker locale="bg"></igc-date-range-picker>`
      );
      calendar = picker.renderRoot.querySelector(IgcCalendarComponent.tagName)!;

      expect(picker.weekStart).to.equal('monday');
      expect(calendar.weekStart).to.equal('monday');

      picker.weekStart = 'friday';
      await elementUpdated(picker);

      expect(calendar.weekStart).to.equal('friday');

      picker.weekStart = undefined;
      await elementUpdated(picker);

      expect(calendar.weekStart).to.equal('monday');
    });
  });

  describe('Validation messages', () => {
    const BG = ResourceStringsBG;

    before(() => registerI18n(BG, 'bg'));

    it('formats the dates as the picker displays them', async () => {
      const start = new Date(2026, 9, 1);
      const end = new Date(2026, 9, 5);
      const date = new Intl.DateTimeFormat('bg', { dateStyle: 'long' });

      picker = await fixture<IgcDateRangePickerComponent>(
        html`<igc-date-range-picker
          locale="bg"
          display-format="long"
          .value=${{ start, end }}
        ></igc-date-range-picker>`
      );
      picker.disabledDates = [
        { type: DateRangeType.Specific, dateRange: [start] },
      ];
      await elementUpdated(picker);

      const range = `${date.format(start)} ${BG.date_range_picker_date_separator} ${date.format(end)}`;
      expect(picker.validationMessage).to.equal(
        formatString(BG.disabled_date_validation_error!, range)
      );

      const min = new Date(2026, 9, 3);
      picker.disabledDates = [];
      picker.min = min;
      await elementUpdated(picker);

      expect(picker.validationMessage).to.equal(
        formatString(BG.min_validation_error!, date.format(min))
      );
    });
  });

  describe('Each layout', () => {
    for (const useTwoInputs of [false, true]) {
      describe(useTwoInputs ? 'Two inputs' : 'Single input', () => {
        const value = { start: today.native, end: tomorrow.native };
        const startEditor = () => getEditors(picker)[0];
        const startInput = () => getInput(picker);

        const isPopupOpen = (tag: 'igc-popover' | 'igc-dialog') =>
          picker.renderRoot.querySelector(tag)!.hasAttribute('open');

        beforeEach(async () => {
          picker.useTwoInputs = useTwoInputs;
          await elementUpdated(picker);
        });

        describe('Rendering and initialization', () => {
          it('is defined', async () => {
            expect(picker).is.not.undefined;
          });

          describe('Accessibility', () => {
            beforeEach(async () => {
              picker.label = 'Date range';
              picker.labelStart = 'Start';
              picker.labelEnd = 'End';
              await elementUpdated(picker);
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
          });

          it('should not render title slot elements in dropdown mode', async () => {
            picker = await fixture<IgcDateRangePickerComponent>(
              html`<igc-date-range-picker
                mode="dropdown"
                ?use-two-inputs=${useTwoInputs}
              >
                <p slot="title">Custom title</p>
              </igc-date-range-picker>`
            );
            await elementUpdated(picker);

            expect(picker.renderRoot.querySelector('slot[name="title"]')).to.be
              .null;
            expect(picker.useTwoInputs).to.equal(useTwoInputs);
          });

          it('should render title slot elements in dialog mode', async () => {
            picker = await fixture<IgcDateRangePickerComponent>(
              html`<igc-date-range-picker
                mode="dialog"
                ?use-two-inputs=${useTwoInputs}
              >
                <p slot="title">Custom title</p>
              </igc-date-range-picker>`
            );
            await elementUpdated(picker);

            expect(picker.renderRoot.querySelector('slot[name="title"]')).to.not
              .be.null;
          });
        });

        describe('Properties', () => {
          it('should set value through attribute correctly in case the date values are valid ISO 8601 strings', async () => {
            picker.setAttribute('value', JSON.stringify(value));
            await elementUpdated(picker);

            checkSelectedRange(picker, value, useTwoInputs);
          });

          it('should keep the calendar selection and input values on changing the mode', async () => {
            picker = await fixture<IgcDateRangePickerComponent>(
              html`<igc-date-range-picker
                ?use-two-inputs=${useTwoInputs}
                .value=${value}
              ></igc-date-range-picker>`
            );

            checkSelectedRange(picker, value, useTwoInputs);

            picker.mode = 'dialog';
            await elementUpdated(picker);

            checkSelectedRange(picker, value, useTwoInputs);
          });

          it('should modify value only through calendar selection and not input when nonEditable is true', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            picker.nonEditable = true;
            await elementUpdated(picker);

            startEditor().focus();
            simulateKeyboard(startInput(), arrowDown);
            await elementUpdated(picker);

            expect(isFocused(startInput())).to.be.true;
            expect(startInput().value).to.equal('');
            expect(getEditorRange(picker)).to.be.null;
            expect(picker.value).to.be.null;
            expect(calendar.values).to.deep.equal([]);
            expect(eventSpy).not.to.be.called;

            await picker.show();
            await selectDates(today, tomorrow, calendar);
            expect(eventSpy).calledWith('igcChange');

            startInput().blur();
            await elementUpdated(picker);

            checkSelectedRange(picker, value, useTwoInputs);
          });
        });

        describe('Methods', () => {
          it('should clear the input on invoking clear()', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            picker.value = value;
            await elementUpdated(picker);

            checkSelectedRange(picker, value, useTwoInputs);

            picker.clear();
            await elementUpdated(picker);

            expect(eventSpy).not.called;
            expect(picker.value).to.be.null;
            expect(getEditorRange(picker)).to.be.null;
            expect(startInput().value).to.equal('');
          });

          it('should select a date range on invoking select', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            expect(picker.value).to.be.null;

            picker.select(value);
            await elementUpdated(picker);

            expect(picker.value).to.deep.equal(value);
            checkSelectedRange(picker, value, useTwoInputs);
            expect(eventSpy).not.called;
          });
        });

        describe('Selection via the calendar', () => {
          const date1 = new CalendarDay({
            year: today.year,
            month: today.month,
            date: 10,
          });
          const date2 = date1.add('day', 4);
          const picked = { start: date1.native, end: date2.native };

          /** Dialog mode renders a new calendar. */
          const toDialog = async () => {
            picker.mode = 'dialog';
            await elementUpdated(picker);
            calendar = picker.renderRoot.querySelector(
              IgcCalendarComponent.tagName
            )!;
          };

          /** Picks `picked` in the open dialog, which reports nothing yet. */
          const pickInDialog = async (
            eventSpy: Sinon.SinonSpy,
            initial: DateRangeValue | null
          ) => {
            await toDialog();
            picker.value = initial;
            await elementUpdated(picker);

            picker.open = true;
            await elementUpdated(picker);

            await selectDates(date1, date2, calendar);
            expect(eventSpy).not.to.be.calledWith('igcChange');
            expect(isPopupOpen('igc-dialog')).to.be.true;
            checkSelectedRange(picker, picked, useTwoInputs);
          };

          it('should select a single date in dropdown mode and emit igcChange', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            picker.open = true;
            await elementUpdated(picker);
            await selectDates(today, null, calendar);

            expect(eventSpy).calledWith('igcChange');
            checkSelectedRange(
              picker,
              { start: today.native, end: today.native },
              useTwoInputs
            );
            // A single date does not close the calendar.
            expect(isPopupOpen('igc-popover')).to.be.true;
          });

          it('should select a range of dates in dropdown mode and emit igcChange', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            picker.open = true;
            await elementUpdated(picker);
            await selectDates(today, tomorrow, calendar);

            expect(eventSpy).calledWith('igcChange');
            checkSelectedRange(picker, value, useTwoInputs);
            // The second click closes the calendar.
            expect(isPopupOpen('igc-popover')).to.be.false;
          });

          it('should select a range of dates in dialog mode and emit igcChange when done is clicked', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            await pickInDialog(eventSpy, null);

            clickFooterButton(':last-of-type')();
            await waitUntil(() => !picker.open);
            await elementUpdated(picker);

            expect(eventSpy).calledWith('igcChange');
            checkSelectedRange(picker, picked, useTwoInputs);
            expect(isPopupOpen('igc-dialog')).to.be.false;
          });

          it('should select a range of dates in dialog mode and emit igcChange when clicked outside of dialog', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            await pickInDialog(eventSpy, null);

            clickOutsideDialog();
            await waitUntil(() => eventSpy.calledWith('igcClosed'));
            await elementUpdated(picker);

            expect(eventSpy).calledWith('igcChange');
            checkSelectedRange(picker, picked, useTwoInputs);
            expect(isPopupOpen('igc-dialog')).to.be.false;
          });

          it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            await pickInDialog(eventSpy, value);

            clickFooterButton('')();
            await waitUntil(() => !picker.open);
            await elementUpdated(picker);

            expect(eventSpy).not.to.be.calledWith('igcChange');
            expect(isPopupOpen('igc-dialog')).to.be.false;
            checkSelectedRange(picker, value, useTwoInputs);
          });

          it('should revert to no value when cancel is clicked and initial value is null', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            await pickInDialog(eventSpy, null);

            clickFooterButton('')();
            await waitUntil(() => !picker.open);
            await elementUpdated(picker);

            expect(eventSpy).not.to.be.calledWith('igcChange');
            expect(isPopupOpen('igc-dialog')).to.be.false;
            expect(getEditorRange(picker)).to.be.null;
            expect(startInput().value).to.equal('');
            expect(calendar.values).to.deep.equal([]);
          });

          it('should not emit igcChange when escape is pressed and the value should be the initial value', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            await pickInDialog(eventSpy, value);

            simulateKeyboard(picker, escapeKey);
            await waitUntil(() => !picker.open);
            await elementUpdated(picker);

            expect(eventSpy).not.to.be.calledWith('igcChange');
            expect(isPopupOpen('igc-dialog')).to.be.false;

            // The focus returns to the input, which then shows the input format.
            startInput().blur();
            await elementUpdated(picker);

            checkSelectedRange(picker, value, useTwoInputs);
          });
        });

        describe('Interactions with the inputs and the open and clear buttons', () => {
          it('leaves the input and change events of slotted content alone', async () => {
            const slotted = document.createElement('span');
            slotted.slot = useTwoInputs ? 'suffix-start' : 'suffix';
            picker.append(slotted);
            picker.value = value;
            await elementUpdated(picker);

            const eventSpy = spy(picker, 'emitEvent');
            const reached: string[] = [];
            const record = ({ type }: Event) => reached.push(type);
            picker.addEventListener('igcInput', record);
            picker.addEventListener('igcChange', record);

            for (const type of ['igcInput', 'igcChange']) {
              slotted.dispatchEvent(
                new CustomEvent(type, {
                  bubbles: true,
                  composed: true,
                  detail: 'text',
                })
              );
            }
            await elementUpdated(picker);

            expect(reached).to.eql(['igcInput', 'igcChange']);
            expect(eventSpy).not.called;
            expect(picker.value).to.eql(value);
          });

          it('should not open the picker when clicking the input in dropdown mode', async () => {
            simulateClick(startEditor());
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
          });

          it('should open the picker when clicking the input in dialog mode', async () => {
            picker.mode = 'dialog';
            await elementUpdated(picker);

            simulateClick(startInput());
            await elementUpdated(picker);

            expect(picker.open).to.be.true;
          });

          for (const renderFirst of [false, true]) {
            it(`should clear the inputs on clicking the clear icon${renderFirst ? ', with a render before the blur' : ''}`, async () => {
              const eventSpy = spy(picker, 'emitEvent');
              picker.value = value;
              await elementUpdated(picker);

              startEditor().focus();
              await elementUpdated(startEditor());

              simulateClick(getIcon(picker, clearIcon));
              if (renderFirst) {
                await elementUpdated(picker);
              }

              startInput().blur();
              await elementUpdated(picker);

              expect(isFocused(startInput())).to.be.false;
              expect(eventSpy).to.be.calledWith('igcChange', { detail: null });
              expect(picker.open).to.be.false;
              expect(picker.value).to.be.null;
              expect(getEditorRange(picker)).to.be.null;
              expect(startInput().value).to.equal('');
            });
          }

          it('drops an edit in an editor that a layout change removes', async () => {
            picker.value = value;
            await elementUpdated(picker);

            const input = startInput();
            startEditor().focus();
            input.setSelectionRange(0, 0);
            simulateKeyboard(input, arrowUp);
            await elementUpdated(picker);

            const eventSpy = spy(picker, 'emitEvent');
            picker.useTwoInputs = !useTwoInputs;
            // The editor commits on blur, before the render removes it.
            input.blur();
            await elementUpdated(picker);

            expect(eventSpy).not.calledWith('igcChange');
            expect(picker.value).to.eql(value);
            checkSelectedRange(picker, value, !useTwoInputs);
          });

          it('should toggle the calendar with keyboard combinations and keep focus', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            startEditor().focus();

            expect(isFocused(startInput())).to.be.true;

            simulateKeyboard(startInput(), [altKey, arrowDown]);
            await elementUpdated(picker);

            expect(picker.open).to.be.true;
            expect(isFocused(startInput())).to.be.false;
            expect(eventSpy.firstCall).calledWith('igcOpening');
            expect(eventSpy.lastCall).calledWith('igcOpened');
            eventSpy.resetHistory();

            simulateKeyboard(startInput(), [altKey, arrowUp]);
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
            expect(isFocused(startInput())).to.be.true;
            expect(eventSpy.firstCall).calledWith('igcClosing');
            expect(eventSpy.lastCall).calledWith('igcClosed');

            simulateKeyboard(startInput(), [altKey, arrowDown]);
            await elementUpdated(picker);
            eventSpy.resetHistory();

            simulateKeyboard(startInput(), escapeKey);
            await elementUpdated(picker);
            await elementUpdated(startEditor());

            expect(picker.open).to.be.false;
            expect(isFocused(startInput())).to.be.true;
            expect(eventSpy.firstCall).calledWith('igcClosing');
            expect(eventSpy.lastCall).calledWith('igcClosed');
          });
        });

        describe('Readonly state', () => {
          beforeEach(async () => {
            picker.readOnly = true;
            picker.value = value;
            await elementUpdated(picker);
          });

          it('should not clear the inputs via the clear icon when readOnly is true', async () => {
            const eventSpy = spy(picker, 'emitEvent');

            simulateClick(getIcon(picker, clearIcon));
            await elementUpdated(picker);

            expect(picker.value).to.deep.equal(value);
            expect(eventSpy).not.called;
            checkSelectedRange(picker, value, useTwoInputs);
          });

          it('should not open the calendar on clicking the input - dropdown mode', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            simulateClick(startInput());
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
            expect(eventSpy).not.called;
          });

          it('should not open the calendar on clicking the input - dialog mode', async () => {
            const eventSpy = spy(picker, 'emitEvent');
            picker.mode = 'dialog';
            await elementUpdated(picker);

            simulateClick(startInput());
            await elementUpdated(picker);

            expect(picker.open).to.be.false;
            expect(eventSpy).not.called;
          });
        });
      });
    }
  });
});

// Outside the describe above, whose `beforeEach` builds an unused picker.
runDisabledPopupTests(IgcDateRangePickerComponent);
