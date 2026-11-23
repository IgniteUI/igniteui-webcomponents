import { expect } from '@open-wc/testing';
import { dateShape } from './value-shape.js';

const june1 = new Date(2025, 5, 1, 10, 30);
const june5 = new Date(2025, 5, 5);

describe('Picker value shapes', () => {
  describe('Date value shape', () => {
    it('selects one date in the calendar', () => {
      expect(dateShape.selection).to.equal('single');
    });

    it('gives the calendar the value as its single value', () => {
      expect(dateShape.toCalendar(june1)).to.eql({ value: june1, values: [] });
      expect(dateShape.toCalendar(null)).to.eql({ value: null, values: [] });
    });

    it('takes the first date of a calendar selection', () => {
      expect(dateShape.fromCalendar([june5])).to.equal(june5);
      expect(dateShape.fromCalendar([])).to.be.null;
    });

    it('closes on each pick', () => {
      expect(dateShape.closesOnPick([june5])).to.be.true;
    });
  });
});
