import { expect } from '@open-wc/testing';

import { CalendarDay } from '#internals/date/model.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import {
  type CalendarSelectionOptions,
  type CalendarSelectionState,
  selectDate,
} from './selection.js';
import { type DateRangeDescriptor, DateRangeType } from './types.js';

describe('Calendar selection', () => {
  const day = (date: number) => new CalendarDay({ year: 2025, month: 2, date });

  const empty: CalendarSelectionState = { value: null, values: [] };

  function options(
    selection: CalendarSelectionOptions['selection'],
    disabledDates: DateRangeDescriptor[] = []
  ): CalendarSelectionOptions {
    return { selection, disabledDates };
  }

  describe('Single', () => {
    it('selects a date', () => {
      const next = selectDate(empty, day(10), options('single'))!;

      expect(next).to.not.be.null;
      expect(next.value!.equalTo(day(10))).to.be.true;
    });

    it('does not change when the selected date is activated again', () => {
      const state = { value: day(10), values: [] };

      expect(selectDate(state, day(10), options('single'))).to.be.null;
      expect(selectDate(state, day(11), options('single'))).to.not.be.null;
    });

    it('leaves the dates of the other selection modes alone', () => {
      const state = { value: null, values: [day(1), day(2)] };
      const next = selectDate(state, day(10), options('single'))!;

      expect(next.values).to.eql(state.values);
    });
  });

  describe('Multiple', () => {
    it('adds a date, keeping the dates sorted', () => {
      let state = selectDate(empty, day(10), options('multiple'))!;
      state = selectDate(state, day(4), options('multiple'))!;
      state = selectDate(state, day(7), options('multiple'))!;

      expect(state.values.map((each) => each.date)).to.eql([4, 7, 10]);
    });

    it('removes an already selected date', () => {
      const state = { value: null, values: [day(4), day(7), day(10)] };
      const next = selectDate(state, day(7), options('multiple'))!;

      expect(next.values.map((each) => each.date)).to.eql([4, 10]);
    });

    it('does not mutate the dates it was given', () => {
      const values = [day(4), day(7)];
      const state = { value: null, values };

      selectDate(state, day(10), options('multiple'));
      selectDate(state, day(4), options('multiple'));

      expect(state.values).to.equal(values);
      expect(values.map((each) => each.date)).to.eql([4, 7]);
    });
  });

  describe('Range', () => {
    it('starts a range with a single date', () => {
      const next = selectDate(empty, day(10), options('range'))!;

      expect(next.values.map((each) => each.date)).to.eql([10]);
    });

    it('expands a started range into every date it covers', () => {
      const state = { value: null, values: [day(10)] };
      const next = selectDate(state, day(14), options('range'))!;

      expect(next.values).lengthOf(5);
      expect(firstOf(next.values).date).to.equal(10);
      expect(lastOf(next.values).date).to.equal(14);
    });

    it('expands a range selected backwards in order', () => {
      const state = { value: null, values: [day(14)] };
      const next = selectDate(state, day(10), options('range'))!;

      expect(next.values).lengthOf(5);
      expect(firstOf(next.values).date).to.equal(10);
      expect(lastOf(next.values).date).to.equal(14);
    });

    it('clears the range when its start is activated again', () => {
      const state = { value: null, values: [day(10)] };
      const next = selectDate(state, day(10), options('range'))!;

      expect(next.values).to.be.empty;
    });

    it('restarts from a completed range', () => {
      const state = {
        value: null,
        values: [day(10), day(11), day(12)],
      };
      const next = selectDate(state, day(20), options('range'))!;

      expect(next.values.map((each) => each.date)).to.eql([20]);
    });

    it('leaves the disabled dates out of the range', () => {
      const disabled = [
        { type: DateRangeType.Specific, dateRange: [day(12).native] },
      ];
      const state = { value: null, values: [day(10)] };
      const next = selectDate(state, day(14), options('range', disabled))!;

      expect(next.values.map((each) => each.date)).to.eql([10, 11, 13, 14]);
    });
  });

  describe('Disabled dates', () => {
    const disabled = [
      { type: DateRangeType.Specific, dateRange: [day(10).native] },
    ];

    it('never selects one', () => {
      for (const selection of ['single', 'multiple', 'range'] as const) {
        expect(selectDate(empty, day(10), options(selection, disabled))).to.be
          .null;
      }
    });

    it('selects the dates around it', () => {
      for (const selection of ['single', 'multiple', 'range'] as const) {
        expect(selectDate(empty, day(11), options(selection, disabled))).to.not
          .be.null;
      }
    });
  });
});
