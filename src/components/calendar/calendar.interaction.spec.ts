import { elementUpdated, expect } from '@open-wc/testing';
import { spy } from 'sinon';

import { IgcCalendarComponent, defineComponents } from '../../index.js';
import { createCalendarElement } from './calendar-rendering.spec.js';
import {
  Calendar,
  type DateRangeDescriptor,
  DateRangeType,
  type ICalendarDate,
  isDateInRanges,
} from './common/calendar.model.js';
import type IgcDaysViewComponent from './days-view/days-view.js';

describe('Calendar Interaction', () => {
  before(() => {
    defineComponents(IgcCalendarComponent);
  });

  const calendarModel = new Calendar();
  let calendar: IgcCalendarComponent;
  let dates: any;
  let weekDays: any;
  let daysView: IgcDaysViewComponent;
  let calendarDates: ICalendarDate[];

  describe('', () => {
    beforeEach(async () => {
      calendar = await createCalendarElement();
      calendar.value = new Date(2021, 8, 29, 12, 0, 0);
      calendar.activeDate = new Date(2021, 8, 29, 12, 0, 0);
      await elementUpdated(calendar);

      daysView = calendar.shadowRoot?.querySelector(
        'igc-days-view'
      ) as IgcDaysViewComponent;
      const weeks = daysView?.shadowRoot?.querySelectorAll('div');
      weekDays = weeks?.item(5);
      dates = weekDays?.querySelectorAll('span');

      calendarDates = calendarModel.monthdates(2021, 8);
    });

    it('Calendar selection - single', async () => {
      const currentDate = calendar.value;
      const prevDay = new Date(2021, 8, 28);

      const eventSpy = spy(calendar, 'emitEvent');
      dates?.item(4).querySelector('span')?.click();
      await elementUpdated(calendar);

      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: prevDay });
      expect(isSelected(currentDate as Date)).to.be.false;
      expect(isSelected(prevDay)).to.be.true;
      expect((calendar.value as Date).toDateString()).to.equal(
        prevDay.toDateString()
      );
    });

    it('Set value attribute', async () => {
      const value = new Date(2022, 0, 19).toISOString();
      calendar.setAttribute('value', value);
      await elementUpdated(calendar);

      expect(calendar.value?.toISOString()).to.equal(value);
    });

    it('Set values attribute', async () => {
      const date1 = new Date(2022, 0, 19).toISOString();
      const date2 = new Date(2022, 0, 22).toISOString();
      calendar.selection = 'multiple';
      calendar.setAttribute('values', `${date1}, ${date2}`);
      await elementUpdated(calendar);

      expect(calendar.values).not.to.be.undefined;
      expect(calendar.values?.length).to.equal(2);
      expect(calendar.values![0].toISOString()).to.equal(date1);
      expect(calendar.values![1].toISOString()).to.equal(date2);
    });

    it('Calendar selection - outside of the current month - 1', async () => {
      const expectedDate = new Date(2021, 9, 2);

      dates?.item(12).querySelector('span').click();
      await elementUpdated(calendar);

      expect(isSelected(expectedDate)).to.be.true;
    });

    it('Calendar selection - multiple', async () => {
      calendar.selection = 'multiple';
      await elementUpdated(calendar);

      calendar.values = [];
      await elementUpdated(calendar);

      expect(calendar.values.length).to.equal(0);

      weekDays?.querySelectorAll('span').forEach((d: HTMLSpanElement) => {
        d.click();
      });
      const selectedDates = [...calendar.values];

      expect(calendar.values.length).to.equal(7);

      for (const date of calendar.values) {
        expect(isSelected(date)).to.be.true;
      }

      dates = weekDays?.querySelectorAll('span');
      dates?.item(dates.length - 1).click();
      await elementUpdated(calendar);

      expect(calendar.values.length).to.equal(6);
      expect(isSelected(selectedDates[selectedDates.length - 1])).to.be.false;
    });

    it('Calendar toggle and cancel range selection', async () => {
      calendar.selection = 'range';
      await elementUpdated(calendar);

      // Toggle range selection...
      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);

      expect(calendar.values?.length).to.equal(1);
      expect(isSelected(calendar.values![0])).to.be.true;

      // ...and cancel it
      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);

      expect(calendar.values?.length).to.equal(0);
    });

    it('Calendar toggle and complete range selection', async () => {
      calendar.selection = 'range';
      await elementUpdated(calendar);

      const firstDay = new Date(2021, 8, 26);
      const lastDay = new Date(2021, 9, 2);

      // Toggle range selection...
      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);

      // ...and complete it
      dates?.item(dates.length - 1).click();
      await elementUpdated(calendar);

      expect(calendar.values?.length).to.equal(7);
      expect(calendar.values![0].toDateString()).to.equal(
        firstDay.toDateString()
      );
      expect(
        calendar.values![calendar.values!.length - 1].toDateString()
      ).to.equal(lastDay.toDateString());

      for (const date of calendar.values!) {
        expect(isSelected(date)).to.be.true;
      }
    });

    it('should emit igcActiveDateChange event when active date is selected', async () => {
      const eventSpy = spy(daysView, 'emitEvent');

      dates?.item(4).querySelector('span')?.click();
      await elementUpdated(daysView);
      expect(eventSpy).calledWith('igcActiveDateChange');

      const evDetails = eventSpy.args[1][1]?.detail as ICalendarDate;
      expect(evDetails.date.toISOString()).to.equals(
        new Date(2021, 8, 28).toISOString()
      );
      const selectedDate = evDetails.date;
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      const currentDate = calendar.activeDate;
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      expect(evDetails.isCurrentMonth).to.equal(
        selectedYear === currentYear && selectedMonth === currentMonth,
        `Wrong current month! Selected: ${selectedMonth} - Current: ${currentMonth}`
      );
      expect(evDetails.isNextMonth).to.equal(
        selectedYear > currentYear ||
          (selectedYear === currentYear && selectedMonth % 12 > currentMonth),
        'Wrong isNextMonth!'
      );
      expect(evDetails.isPrevMonth).to.equal(
        selectedYear < currentYear ||
          (selectedYear === currentYear && selectedMonth % 12 < currentMonth),
        'Wrong isPrevMonth!'
      );
    });

    it('should emit igcRangePreviewDateChange event', async () => {
      const eventSpy = spy(daysView, 'emitEvent');

      calendar.selection = 'range';
      await elementUpdated(calendar);

      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);
      dates?.item(dates.length - 1).focus();
      await elementUpdated(calendar);

      expect(eventSpy).calledWithExactly('igcRangePreviewDateChange', {
        detail: new Date(2021, 9, 2),
      });
    });

    it('Verify date is disabled for DateRangeType - Before', async () => {
      const beforeDate = new Date(2021, 8, 29);
      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Before,
          dateRange: [beforeDate],
        },
      ];

      calendar.disabledDates = disabledDates;
      await elementUpdated(calendar);

      // Get before dates
      const inRangeDates = calendarDates.filter(
        (d) => d.date.getTime() < beforeDate.getTime()
      );

      // Validate if dates before are disabled
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, disabledDates)).to.be.true;
      });
    });

    it('Verify date is disabled for DateRangeType - After', async () => {
      const afterDate = new Date(2021, 8, 27);
      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.After,
          dateRange: [afterDate],
        },
      ];

      calendar.disabledDates = disabledDates;
      await elementUpdated(calendar);

      // Get after dates
      const inRangeDates = calendarDates.filter(
        (d) => d.date.getTime() > afterDate.getTime()
      );

      const enableDate = dates.item(0).querySelector('span');
      enableDate.click();
      await elementUpdated(calendar);
      const enableDateValue = calendar.value;

      const disabledDatesEl = weekDays.querySelectorAll(
        'span[part="date disabled single"]'
      );

      const disableDate = disabledDatesEl.item(0);

      disableDate.querySelector('span').click();
      await elementUpdated(calendar);

      expect(calendar.value).to.equals(enableDateValue);

      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, disabledDates)).to.be.true;
      });
    });

    it('Verify date is disabled for DateRangeType - Between', async () => {
      const minDate = new Date(2021, 8, 20);
      const maxDate = new Date(2021, 8, 30);

      const disabledDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      calendar.disabledDates = disabledDates;
      await elementUpdated(calendar);

      // Get between dates
      const inRangeDates = calendarDates.filter(
        (d) =>
          d.date.getTime() >= minDate.getTime() &&
          d.date.getTime() <= maxDate.getTime()
      );

      // Validate if dates between are disabled
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, disabledDates)).to.be.true;
      });
    });

    it('Verify date is disabled for DateRangeType - Specific', async () => {
      const maxDate = new Date(2021, 8, 23);
      const minDate = new Date(2021, 8, 7);

      const specialDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Specific,
          dateRange: [minDate, maxDate],
        },
      ];

      calendar.specialDates = specialDates;
      await elementUpdated(calendar);

      // Get before dates
      const inRangeDates = calendarDates.filter(
        (d) =>
          d.date.getTime() === maxDate.getTime() ||
          d.date.getTime() === minDate.getTime()
      );

      // Validate if specific dates are disabled
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, specialDates)).to.be.true;
      });
    });

    it('Verify date is disabled for DateRangeType - Weekdays', async () => {
      const weekdays: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Weekdays,
          dateRange: [],
        },
      ];

      calendar.disabledDates = weekdays;
      await elementUpdated(calendar);

      // Get only weekdays
      const inRangeDates = calendarDates.filter(
        (d) => d.date.getDay() !== 0 && d.date.getDay() !== 6
      );

      // Validate if weekdays are disabled
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, weekdays)).to.be.true;
      });
    });

    it('Verify date is disabled for DateRangeType - Weekends', async () => {
      const weekends: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Weekends,
          dateRange: [],
        },
      ];

      calendar.disabledDates = weekends;
      await elementUpdated(calendar);

      // Get only weekends
      const inRangeDates = calendarDates.filter(
        (d) => d.date.getDay() === 0 || d.date.getDay() === 6
      );

      // Validate if weekends are disabled
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, weekends)).to.be.true;
      });
    });

    it('Verify date is disabled when Between DateRangeType is used with the same date items', async () => {
      const date = new Date(2021, 8, 24);
      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [date, date],
        },
      ];

      calendar.disabledDates = disableDates;
      await elementUpdated(calendar);

      verifyDisableDates(date, date, disableDates);
    });

    it('Should not select disabled dates when having "range" selection', async () => {
      calendar.selection = 'range';
      await elementUpdated(calendar);

      const minDate = new Date(2021, 8, 29);
      const maxDate = new Date(2021, 9, 1);

      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      calendarDates = calendarModel.monthdates(2021, 8, true);

      calendar.disabledDates = disableDates;
      await elementUpdated(calendar);
      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);
      dates?.item(dates.length - 1).click();
      await elementUpdated(calendar);
      const calValues = calendar.values as Date[];

      const selectedDates = calendarDates.filter(
        (d) =>
          (d.date.getTime() >= new Date(2021, 8, 26).getTime() &&
            d.date.getTime() <= new Date(2021, 8, 28).getTime()) ||
          d.date.getTime() === new Date(2021, 9, 2).getTime()
      );

      expect(selectedDates.map((d) => d.date)).to.have.deep.members(calValues);

      const notSelectedDates = calendarDates.filter(
        (d) =>
          d.date.getTime() >= new Date(2021, 8, 29).getTime() &&
          d.date.getTime() <= new Date(2021, 9, 1).getTime()
      );

      expect(notSelectedDates.map((d) => d.date)).to.not.have.deep.members(
        calValues
      );
    });

    it('Should disable dates when using "Between" date descriptor with max date declared first', async () => {
      const maxDate = new Date(2021, 8, 29);
      const minDate = new Date(2021, 8, 23);

      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [maxDate, minDate],
        },
      ];

      calendar.disabledDates = disableDates;
      await elementUpdated(calendar);

      const betweenMin =
        maxDate.getTime() > minDate.getTime() ? minDate : maxDate;
      const betweenMax =
        maxDate.getTime() > minDate.getTime() ? maxDate : minDate;

      verifyDisableDates(betweenMin, betweenMax, disableDates);
    });

    it('Should disable dates when using overlapping "Between" ranges', async () => {
      const firstBetweenMin = new Date(2021, 8, 10);
      const firstBetweenMax = new Date(2021, 8, 15);
      const secondBetweenMin = new Date(2021, 8, 12);
      const secondBetweenMax = new Date(2021, 8, 22);

      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [firstBetweenMin, firstBetweenMax],
        },
        {
          type: DateRangeType.Between,
          dateRange: [secondBetweenMin, secondBetweenMax],
        },
      ];

      calendar.disabledDates = disableDates;
      await elementUpdated(calendar);

      verifyDisableDates(firstBetweenMin, secondBetweenMax, disableDates);
    });

    it('Should disable dates between two years', async () => {
      const minDate = new Date(2021, 8, 10);
      const maxDate = new Date(2022, 8, 31);

      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Between,
          dateRange: [minDate, maxDate],
        },
      ];

      calendarDates = calendarModel.monthdates(2022, 8);

      calendar.disabledDates = disableDates;
      await elementUpdated(calendar);

      verifyDisableDates(minDate, maxDate, disableDates);
    });

    it('Should disable dates when using multiple ranges', async () => {
      const disableDates: DateRangeDescriptor[] = [
        {
          type: DateRangeType.Before,
          dateRange: [new Date(2021, 8, 1)],
        },
        {
          type: DateRangeType.After,
          dateRange: [new Date(2021, 8, 29)],
        },
        {
          type: DateRangeType.Weekends,
          dateRange: [],
        },
        {
          type: DateRangeType.Between,
          dateRange: [new Date(2021, 8, 1), new Date(2021, 8, 16)],
        },
        {
          type: DateRangeType.Between,
          dateRange: [new Date(2021, 8, 5), new Date(2021, 8, 28)],
        },
      ];

      const enableDateTime = new Date(2021, 8, 29);

      const inRangeDates = calendarDates.filter(
        (d) => d.date.getTime() !== enableDateTime.getTime()
      );

      expect(inRangeDates.length).to.not.equal(0);
      inRangeDates.forEach((date) => {
        expect(isDateInRanges(date.date, disableDates)).to.be.true;
      });
    });

    it('Should not create range when selection is set to multiple', async () => {
      calendar.selection = 'range';
      await elementUpdated(calendar);

      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);
      dates?.item(dates.length - 1).focus();
      await elementUpdated(calendar);

      expect(daysView.rangePreviewDate?.toDateString()).to.deep.equal(
        new Date(2021, 9, 2).toDateString()
      );

      calendar.selection = 'multiple';
      await elementUpdated(calendar);

      dates?.item(0).querySelector('span')?.click();
      await elementUpdated(calendar);
      dates?.item(dates.length - 1).focus();
      await elementUpdated(calendar);
      expect(daysView.rangePreviewDate).to.be.null;
    });

    it('Should change days view when selecting an outside day - multiple', async () => {
      changeDaysViewWhenOutsideDateSelected('multiple');
    });

    it('Should change days view when selecting an outside day - range', async () => {
      changeDaysViewWhenOutsideDateSelected('range');
    });
  });

  const isSelected = (date: Date) => {
    let selectedDates: Date | Date[];
    const dates = calendar.values as Date[];

    if (calendar.selection === 'single') {
      selectedDates = calendar.value as Date;
      return selectedDates.getTime() === date?.getTime();
    } else if (calendar.selection === 'multiple') {
      selectedDates = dates;
      const currentDate = selectedDates.find(
        (element) => element.getTime() === date.getTime()
      );
      return !!currentDate;
    } else if (calendar.selection === 'range' && dates.length === 1) {
      selectedDates = dates;
      return selectedDates[0].getTime() === date.getTime();
    }

    return isDateInRanges(date, [
      {
        type: DateRangeType.Between,
        dateRange: [dates[0], dates[dates.length - 1]],
      },
    ]);
  };

  const verifyDisableDates = (
    minDate: Date,
    maxDate: Date,
    disableDates: DateRangeDescriptor[]
  ) => {
    const inRangeDates = calendarDates.filter(
      (d) =>
        d.date.getTime() >= minDate.getTime() &&
        d.date.getTime() <= maxDate.getTime()
    );

    expect(inRangeDates.length).to.not.equal(0);

    inRangeDates.forEach((date) => {
      expect(isDateInRanges(date.date, disableDates)).to.be.true;
    });
  };

  const changeDaysViewWhenOutsideDateSelected = async (
    slection: 'single' | 'multiple' | 'range'
  ) => {
    const currentDayViewDate = dates?.item(5).cloneNode(true);
    calendar.selection = slection;
    await elementUpdated(calendar);

    currentDayViewDate?.querySelector('span')?.click();
    await elementUpdated(calendar);
    dates?.item(dates.length - 1).click();
    await elementUpdated(calendar);

    const chagedDateViewDate = dates?.item(5).cloneNode(true);

    expect(currentDayViewDate).to.not.equal(chagedDateViewDate);
  };
});
