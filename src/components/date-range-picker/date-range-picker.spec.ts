import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import IgcCalendarComponent from '../calendar/calendar.js';
import { getCalendarDOM, getDOMDate } from '../calendar/helpers.spec.js';
import { CalendarDay } from '../calendar/model.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick } from '../common/utils.spec.js';
import IgcDateTimeInputComponent from '../date-time-input/date-time-input.js';
import { DateTimeUtil } from '../date-time-input/date-util.js';
import IgcInputComponent from '../input/input.js';
import IgcDateRangePickerComponent from './date-range-picker.js';

describe('Date range picker', () => {
  before(() => defineComponents(IgcDateRangePickerComponent));

  let picker: IgcDateRangePickerComponent;
  let _dateTimeInput: IgcDateTimeInputComponent;
  let calendar: IgcCalendarComponent;

  const today = CalendarDay.from(new Date());
  const tomorrow = today.add('day', 1);

  beforeEach(async () => {
    picker = await fixture<IgcDateRangePickerComponent>(
      html`<igc-date-range-picker></igc-date-range-picker>`
    );
    _dateTimeInput = picker.renderRoot.querySelector(
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
      const expectedValue = [today.native, tomorrow.native];
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
    it('should keep the calendar selection and input values on changing the mode', async () => {
      const expectedValue = [today.native, tomorrow.native];
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
      const expectedValue = [today.native, tomorrow.native];
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
  });
  describe('Interactions', () => {
    describe('Selection via the calendar', () => {
      it('should select a single date in dropdown mode and emit igcChange', async () => {
        const eventSpy = spy(picker, 'emitEvent');
        picker.open = true;
        await elementUpdated(picker);

        await selectDates(today, null, calendar);

        expect(eventSpy).calledWith('igcChange');
        expect(picker.value?.length).to.equal(2);
        expect(picker.value?.[0]).to.deep.equal(today.native);
        expect(picker.value?.[1]).to.deep.equal(today.native);

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
        expect(picker.value?.length).to.equal(2);
        expect(picker.value?.[0]).to.deep.equal(today.native);
        expect(picker.value?.[1]).to.deep.equal(tomorrow.native);

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
        expect(picker.value?.length).to.equal(2);
        expect(picker.value?.[0]).to.deep.equal(today.native);
        expect(picker.value?.[1]).to.deep.equal(tomorrow.native);

        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
      });

      it('should not emit igcChange when cancel is clicked and the value should be the initial value', async () => {
        const eventSpy = spy(picker, 'emitEvent');

        picker.mode = 'dialog';
        const date1 = today.add('day', -2);
        const date2 = today.add('day', 2);
        picker.value = [date1.native, date2.native];
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
        expect(picker.value?.length).to.equal(2);
        expect(picker.value?.[0]).to.deep.equal(date1.native);
        expect(picker.value?.[1]).to.deep.equal(date2.native);
        dialog = picker.renderRoot.querySelector('igc-dialog');
        expect(dialog?.hasAttribute('open')).to.equal(false);
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
  expectedValue: (Date | null)[],
  singleInput = false
) => {
  const calendar = picker.renderRoot.querySelector(
    IgcCalendarComponent.tagName
  )!;

  expect(picker.value).not.to.be.null;
  expect(picker.value).to.deep.equal(expectedValue);

  if (singleInput) {
    const input = picker.renderRoot.querySelector(IgcInputComponent.tagName)!;
    const start = DateTimeUtil.formatDate(
      expectedValue[0]!,
      picker.locale,
      picker.displayFormat || picker.inputFormat
    );
    const end = DateTimeUtil.formatDate(
      expectedValue[1]!,
      picker.locale,
      picker.displayFormat || picker.inputFormat
    );
    expect(input.value).to.equal(`${start} - ${end}`);
  } else {
    const inputs = picker.renderRoot.querySelectorAll(
      IgcDateTimeInputComponent.tagName
    );
    expect(inputs[0].value).to.deep.equal(expectedValue[0]);
    expect(inputs[1].value).to.deep.equal(expectedValue[1]);
  }
  expect(calendar.values).to.deep.equal(expectedValue);
};
