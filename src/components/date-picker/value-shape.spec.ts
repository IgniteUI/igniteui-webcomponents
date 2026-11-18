import { expect } from '@open-wc/testing';
import { dateShape } from './value-shape.js';

const june1 = new Date(2025, 5, 1, 10, 30);
const june5 = new Date(2025, 5, 5);

describe('Picker value shapes', () => {
  describe('Date value shape', () => {
    it('selects one date in the calendar', () => {
      expect(dateShape.selection).to.equal('single');
    });

    it('keeps the value as it is', () => {
      expect(dateShape.normalize(june1)).to.equal(june1);
      expect(dateShape.normalize(null)).to.be.null;
    });

    it('gives the value as the first date', () => {
      expect(dateShape.first(june1)).to.equal(june1);
      expect(dateShape.first(null)).to.be.null;
    });

    it('gives the calendar the value, or no dates', () => {
      expect(dateShape.toCalendar(june1)).to.eql([june1]);
      expect(dateShape.toCalendar(null)).to.eql([]);
    });

    it('takes the first date of a calendar selection', () => {
      expect(dateShape.fromCalendar([june5])).to.equal(june5);
      expect(dateShape.fromCalendar([])).to.be.null;
    });

    it('closes on each pick', () => {
      expect(dateShape.closesOnPick([june5])).to.be.true;
    });

    it('is complete with a date', () => {
      expect(dateShape.isComplete(june1)).to.be.true;
      expect(dateShape.isComplete(null)).to.be.false;
    });

    it('formats the date', () => {
      expect(
        dateShape.format(june1, (date) => `${date.getDate()}`, '-')
      ).to.equal('1');
    });

    it('converts a string value through the transformers', () => {
      expect(dateShape.transformers.setValue!('2025-06-05' as never)).to.eql(
        june5
      );
      expect(dateShape.transformers.setDefaultValue!(null)).to.be.null;
    });
  });
});
