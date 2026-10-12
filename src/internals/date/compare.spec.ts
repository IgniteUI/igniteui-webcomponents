import { expect } from '@open-wc/testing';
import { isDateExceedingMax, isDateLessThanMin } from './compare.js';

describe('Date comparison', () => {
  const morning = new Date(2024, 4, 10, 8, 30);
  const evening = new Date(2024, 4, 10, 20, 15);
  const nextMorning = new Date(2024, 4, 11, 8, 0);

  it('compares the date and the time by default', () => {
    expect(isDateExceedingMax(evening, morning)).to.be.true;
    expect(isDateExceedingMax(morning, evening)).to.be.false;
    expect(isDateLessThanMin(morning, evening)).to.be.true;
    expect(isDateLessThanMin(evening, morning)).to.be.false;
  });

  it('ignores the time portion when `includeTime` is false', () => {
    expect(isDateExceedingMax(evening, morning, false)).to.be.false;
    expect(isDateLessThanMin(morning, evening, false)).to.be.false;
    expect(isDateExceedingMax(nextMorning, evening, false)).to.be.true;
  });

  it('ignores the date portion when `includeDate` is false', () => {
    expect(isDateExceedingMax(evening, nextMorning, true, false)).to.be.true;
    expect(isDateLessThanMin(nextMorning, evening, true, false)).to.be.true;
    expect(isDateLessThanMin(morning, nextMorning, true, false)).to.be.false;
  });

  it('does not change the given dates', () => {
    const value = new Date(evening);
    const boundary = new Date(nextMorning);

    isDateExceedingMax(value, boundary, false, false);

    expect(value).to.eql(evening);
    expect(boundary).to.eql(nextMorning);
  });
});
