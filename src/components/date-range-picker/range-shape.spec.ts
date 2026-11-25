import { expect } from '@open-wc/testing';
import type { DateRangeValue } from '../types.js';
import {
  isCompleteDateRange,
  normalizeRange,
  rangeShape,
  rangeTransformers,
} from './range-shape.js';

const june1 = new Date(2025, 5, 1);
const june5 = new Date(2025, 5, 5);
const june5Morning = new Date(2025, 5, 5, 9, 0);
const june5Evening = new Date(2025, 5, 5, 18, 0);

describe('Picker value shapes', () => {
  describe('Range value shape', () => {
    it('selects a range in the calendar', () => {
      expect(rangeShape.selection).to.equal('range');
    });

    describe('normalize', () => {
      it('gives null for an empty range', () => {
        expect(normalizeRange(null)).to.be.null;
        expect(normalizeRange({ start: null, end: null })).to.be.null;
        expect(normalizeRange({} as DateRangeValue)).to.be.null;
      });

      it('returns a range in order as it is', () => {
        const range = { start: june1, end: june5 };
        const partial = { start: null, end: june5 };

        expect(normalizeRange(range)).to.equal(range);
        expect(normalizeRange(partial)).to.equal(partial);
      });

      it('swaps reversed ends', () => {
        expect(normalizeRange({ start: june5, end: june1 })).to.eql({
          start: june1,
          end: june5,
        });
      });

      it('swaps reversed ends on the same day by time', () => {
        expect(
          normalizeRange({ start: june5Evening, end: june5Morning })
        ).to.eql({ start: june5Morning, end: june5Evening });
      });

      it('fills a missing end with null', () => {
        expect(
          normalizeRange({ start: june1 } as unknown as DateRangeValue)
        ).to.eql({ start: june1, end: null });
      });
    });

    describe('transformers', () => {
      it('normalize a value and a default value', () => {
        const { setValue, setDefaultValue } = rangeTransformers;
        const reversed = { start: june5, end: june1 };
        const ordered = { start: june1, end: june5 };

        expect(setValue!(reversed)).to.eql(ordered);
        expect(setDefaultValue!(reversed)).to.eql(ordered);
        expect(setValue!({ start: null, end: null })).to.be.null;
        expect(setDefaultValue!({ start: null, end: null })).to.be.null;
      });

      it('parse and normalize an attribute value', () => {
        const { setValue } = rangeTransformers;

        expect(
          setValue!('{"start":"2025-06-05","end":"2025-06-01"}' as never)
        ).to.eql({ start: june1, end: june5 });
        expect(setValue!('{}' as never)).to.be.null;
      });

      it('compare ranges by their dates', () => {
        const { isSameValue } = rangeTransformers;

        expect(
          isSameValue!(
            { start: june1, end: june5 },
            { start: new Date(june1), end: new Date(june5) }
          )
        ).to.be.true;
        expect(isSameValue!({ start: june1, end: june5 }, null)).to.be.false;
      });
    });

    describe('toCalendar', () => {
      it('gives both ends of a range', () => {
        expect(
          rangeShape.toCalendar({ start: june1, end: june5 }).values
        ).to.eql([june1, june5]);
      });

      it('gives the ends of a reversed range in order', () => {
        expect(
          rangeShape.toCalendar({ start: june5, end: june1 }).values
        ).to.eql([june1, june5]);
      });

      it('gives one date for a range in one day', () => {
        expect(
          rangeShape.toCalendar({ start: june5Morning, end: june5Evening })
        ).to.eql({ value: null, values: [june5Morning] });
      });

      it('gives the defined end of a partial range', () => {
        expect(
          rangeShape.toCalendar({ start: june1, end: null }).values
        ).to.eql([june1]);
        expect(
          rangeShape.toCalendar({ start: null, end: june5 }).values
        ).to.eql([june5]);
      });

      it('gives no dates for an empty range', () => {
        expect(rangeShape.toCalendar(null).values).to.eql([]);
      });
    });

    describe('fromCalendar', () => {
      it('takes the first and the last date of the selection', () => {
        const june3 = new Date(2025, 5, 3);

        expect(rangeShape.fromCalendar([june1, june3, june5])).to.eql({
          start: june1,
          end: june5,
        });
      });

      it('gives a range in one day for the first pick', () => {
        expect(rangeShape.fromCalendar([june5])).to.eql({
          start: june5,
          end: june5,
        });
      });

      it('gives null for a cleared selection', () => {
        expect(rangeShape.fromCalendar([])).to.be.null;
      });
    });

    it('is complete with both ends', () => {
      expect(isCompleteDateRange({ start: june1, end: june5 })).to.be.true;
      expect(isCompleteDateRange({ start: june1, end: null })).to.be.false;
      expect(isCompleteDateRange({ start: null, end: june5 })).to.be.false;
      expect(isCompleteDateRange(null)).to.be.false;
    });
  });
});
