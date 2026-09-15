import { expect } from '@open-wc/testing';
import { DataRequestTracker } from './data-request.js';

describe('DataRequestTracker', () => {
  let tracker: DataRequestTracker;

  beforeEach(() => {
    tracker = new DataRequestTracker();
  });

  it('requests nothing far from the end or without items', () => {
    expect(tracker.next({ startIndex: 0, endIndex: 10 }, 100, 2)).to.be.null;
    expect(tracker.next({ startIndex: 0, endIndex: -1 }, 0, 2)).to.be.null;
  });

  it('requests from the end of the loaded items, more for a larger over-scan', () => {
    expect(tracker.next({ startIndex: 90, endIndex: 95 }, 100, 2)).to.eql({
      startIndex: 100,
      count: 20,
    });

    const other = new DataRequestTracker();
    expect(other.next({ startIndex: 90, endIndex: 95 }, 100, 10)).to.eql({
      startIndex: 100,
      count: 40,
    });
  });

  it('holds one request until the data changes, and none for the same total', () => {
    const range = { startIndex: 90, endIndex: 99 };

    expect(tracker.next(range, 100, 2)).not.to.be.null;
    expect(tracker.next(range, 100, 2)).to.be.null;

    // A `data` change that appended nothing: the source is exhausted.
    tracker.reset();
    expect(tracker.next(range, 100, 2)).to.be.null;

    tracker.reset();
    expect(tracker.next({ startIndex: 110, endIndex: 119 }, 120, 2)).to.eql({
      startIndex: 120,
      count: 20,
    });
  });
});
