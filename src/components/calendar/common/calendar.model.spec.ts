import { expect } from '@open-wc/testing';

import {
  Calendar,
  type ICalendarDate,
  TimeDeltaInterval,
  WEEKDAYS,
  isLeap,
  monthRange,
  weekDay,
} from './calendar.model.js';

describe('Calendar model', () => {
  const calendarModel = new Calendar();
  const startDate = new Date(2021, 0, 1, 12, 0, 0);
  let dates: ICalendarDate[];

  describe('', () => {
    beforeEach(async () => {
      dates = calendarModel.monthdates(2021, 8);
      expect(calendarModel.firstWeekDay).to.equal(WEEKDAYS.SUNDAY);
      expect(calendarModel.weekdays()).deep.equal([0, 1, 2, 3, 4, 5, 6]);
    });

    it('2021 September with first day set to Sunday', () => {
      expect(dates[0].date.toDateString()).to.equal(
        new Date(2021, 7, 29).toDateString()
      );

      expect(dates[dates.length - 1].date.toDateString()).to.equal(
        new Date(2021, 9, 2).toDateString()
      );

      expect(dates.length).to.equal(35);
    });

    it('2021 September with first day set to Sunday and extra week', () => {
      dates = calendarModel.monthdates(2021, 8, true);
      expect(dates.length).to.equal(42);

      expect(dates[0].date.toDateString()).to.equal(
        new Date(2021, 7, 29).toDateString()
      );

      expect(dates[dates.length - 1].date.toDateString()).to.equal(
        new Date(2021, 9, 9).toDateString()
      );
    });

    it('2021 September with first day set to Friday', () => {
      calendarModel.firstWeekDay = WEEKDAYS.FRIDAY;
      expect(calendarModel.firstWeekDay).to.equal(WEEKDAYS.FRIDAY);
      expect(calendarModel.weekdays()).deep.equal([5, 6, 0, 1, 2, 3, 4]);

      dates = calendarModel.monthdates(2021, 8);
      expect(dates[0].date.toDateString()).to.equal(
        new Date(2021, 7, 27).toDateString()
      );

      expect(dates[dates.length - 1].date.toDateString()).to.equal(
        new Date(2021, 8, 30).toDateString()
      );
      expect(dates.length).to.equal(35);
      calendarModel.firstWeekDay = WEEKDAYS.SUNDAY;
    });

    it('Leap year utility function', () => {
      expect(isLeap(2021)).to.be.false;
      expect(isLeap(2024)).to.be.true;
    });

    it('monthRange utility function', () => {
      expect(() => monthRange(2021, -1)).to.throw('Invalid month specified');
      expect(() => monthRange(2021, 12)).to.throw('Invalid month specified');
      expect(monthRange(2021, 8)).to.deep.equal([weekDay(2021, 8, 1), 30]);
      expect(monthRange(2024, 1)).to.deep.equal([weekDay(2024, 1, 1), 29]); // Leap year
    });

    it('Year timedelta', () => {
      let newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Year,
        1
      );
      expect(newDate.getFullYear()).to.equal(2022);
      newDate = calendarModel.timedelta(startDate, TimeDeltaInterval.Year, -1);
      expect(newDate.getFullYear()).to.equal(2020);
    });

    it('Quarter timedelta', () => {
      let newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Quarter,
        1
      );
      expect(newDate.getMonth()).to.equal(3);
      newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Quarter,
        -1
      );
      expect(newDate.getFullYear()).to.equal(2020);
      expect(newDate.getMonth()).to.equal(9);
    });

    it('Month timedelta', () => {
      let newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Month,
        1
      );
      expect(newDate.getMonth()).to.equal(1);
      newDate = calendarModel.timedelta(startDate, TimeDeltaInterval.Month, -1);
      expect(newDate.getFullYear()).to.equal(2020);
      expect(newDate.getMonth()).to.equal(11);
    });

    it('Week timedelta', () => {
      let newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Week,
        1
      );
      expect(newDate.getDate()).to.equal(8);
      newDate = calendarModel.timedelta(startDate, TimeDeltaInterval.Week, -1);
      expect(newDate.getFullYear()).to.equal(2020);
      expect(newDate.getDate()).to.equal(25);
    });

    it('Day timedelta', () => {
      let newDate = calendarModel.timedelta(
        startDate,
        TimeDeltaInterval.Day,
        3
      );
      expect(newDate.getDate()).to.equal(4);
      expect(
        calendarModel
          .timedelta(startDate, TimeDeltaInterval.Day, 7)
          .toDateString()
      ).to.equal(
        calendarModel
          .timedelta(startDate, TimeDeltaInterval.Week, 1)
          .toDateString()
      );
      newDate = calendarModel.timedelta(startDate, TimeDeltaInterval.Day, -3);
      expect(newDate.getFullYear()).to.equal(2020);
      expect(newDate.getDate()).to.equal(29);
    });

    it('Hour timedelta', () => {
      verifyTimeDeltaForHourUnits(TimeDeltaInterval.Hour, 1);
    });

    it('Minute timedelta', () => {
      verifyTimeDeltaForHourUnits(TimeDeltaInterval.Minute, 60);
    });

    it('Seconds timedelta', () => {
      verifyTimeDeltaForHourUnits(TimeDeltaInterval.Second, 3600);
    });
  });

  const verifyTimeDeltaForHourUnits = (
    timeDeltaInterval: TimeDeltaInterval,
    units: number
  ) => {
    let newDate = calendarModel.timedelta(startDate, timeDeltaInterval, units);
    expect(newDate.getHours()).to.equal(13);
    newDate = calendarModel.timedelta(startDate, timeDeltaInterval, 24 * units);
    expect(newDate.getDate()).to.equal(2);
    expect(newDate.getHours()).to.equal(12);
    newDate = calendarModel.timedelta(startDate, timeDeltaInterval, -units);
    expect(newDate.getHours()).to.equal(11);
    expect(newDate.getDate()).to.equal(1);
    expect(newDate.getFullYear()).to.equal(2021);
  };
});
