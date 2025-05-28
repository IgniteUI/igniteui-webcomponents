import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type Sinon from 'sinon';
import { spy } from 'sinon';
import type IgcButtonComponent from '../button/button.js';
import IgcCalendarComponent from '../calendar/calendar.js';
import { CalendarDay } from '../calendar/model.js';
import { DateRangeType } from '../calendar/types.js';
import IgcChipComponent from '../chip/chip.js';
import {
  altKey,
  arrowDown,
  arrowUp,
  escapeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import type { IgcDateRangePickerResourceStrings } from '../common/i18n/date-range-picker.resources.js';
import {
  checkDatesEqual,
  simulateClick,
  simulateKeyboard,
} from '../common/utils.spec.js';
import IgcDialogComponent from '../dialog/dialog.js';
import IgcPopoverComponent from '../popover/popover.js';
import IgcDateRangePickerComponent, {
  type DateRangeValue,
  type CustomDateRange,
} from './date-range-picker.js';
import {
  checkSelectedRange,
  getIcon,
  selectDates,
} from './date-range-picker.utils.spec.js';
import IgcPredefinedRangesAreaComponent from './predefined-ranges-area.js';

describe('Date range picker - common tests for single and two inputs mode', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

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

  describe('Rendering and initialization', () => {
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
      expect(picker.value).to.deep.equal({ start: null, end: null });

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
  });

  describe('Properties', () => {
    it('should set the visibleMonths property correctly', async () => {
      expect(picker.visibleMonths).to.equal(2);

      picker.visibleMonths = 1;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(1);

      // in case value other than 1 or 2 the value defaults to 2
      picker.visibleMonths = 11;
      await elementUpdated(picker);
      expect(picker.visibleMonths).to.equal(2);

      // test with NaN or undefined
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

      it('should expose the default strings for localization', async () => {
        picker.useTwoInputs = true;
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

      it('should set the resource strings of the predefined-ranges-area component', async () => {
        const tests: {
          key: keyof IgcDateRangePickerResourceStrings;
          value: string;
        }[] = [
          { key: 'last7Days', value: 'Last 7 days - localized' },
          { key: 'currentMonth', value: 'Current month - localized' },
          { key: 'last30Days', value: 'Last 30 days - localized' },
          { key: 'yearToDate', value: 'Year to date - localized' },
        ];
        for (const test of tests) {
          picker.resourceStrings[test.key] = test.value;
        }
        picker.usePredefinedRanges = true;
        await elementUpdated(picker);

        const predefinedArea = picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        );

        for (const test of tests) {
          expect(predefinedArea?.resourceStrings[test.key]).to.equal(
            test.value
          );
        }

        const chipElements = predefinedArea?.shadowRoot!.querySelectorAll(
          'igc-chip'
        ) as NodeListOf<IgcChipComponent>;
        for (const test of tests) {
          expect(chipElements[tests.indexOf(test)].innerText.trim()).to.equal(
            test.value
          );
        }
      });

      it('should set the resource strings of the predefined ranges area by passing a new resource strings object', async () => {
        const tests: {
          key: keyof IgcDateRangePickerResourceStrings;
          value: string;
        }[] = [
          { key: 'last7Days', value: 'Last 7 days - localized' },
          { key: 'currentMonth', value: 'Current month - localized' },
          { key: 'last30Days', value: 'Last 30 days - localized' },
          { key: 'yearToDate', value: 'Year to date - localized' },
        ];
        const testResourceStrings = {
          ...picker.resourceStrings,
          last7Days: 'Last 7 days - localized',
          currentMonth: 'Current month - localized',
          last30Days: 'Last 30 days - localized',
          yearToDate: 'Year to date - localized',
        };
        picker.resourceStrings = testResourceStrings;
        await elementUpdated(picker);

        const predefinedArea = picker.renderRoot.querySelector(
          IgcPredefinedRangesAreaComponent.tagName
        );
        for (const test of tests) {
          expect(predefinedArea?.resourceStrings[test.key]).to.equal(
            test.value
          );
        }

        const chipElements = predefinedArea?.shadowRoot!.querySelectorAll(
          'igc-chip'
        ) as NodeListOf<IgcChipComponent>;
        for (const test of tests) {
          expect(chipElements[tests.indexOf(test)].innerText.trim()).to.equal(
            test.value
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
          await elementUpdated(picker);

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
      describe('Readonly state', () => {
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
        );
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
        return getPredefinedArea()?.renderRoot.querySelectorAll(
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

          expect(eventSpy).calledWith('igcChange');
          expect(eventSpy).calledWith('igcClosing');
          expect(eventSpy).calledWith('igcClosed');

          expect(getDialog()?.open).to.be.false;
          chipSpy.resetHistory();
          eventSpy.resetHistory();
        }
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
});
