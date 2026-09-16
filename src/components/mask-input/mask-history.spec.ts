import { expect } from '@open-wc/testing';

import {
  createMaskHistory,
  type MaskHistory,
  type MaskHistoryState,
} from './mask-history.js';

/** Shorthand for a collapsed-caret state. */
function at(value: string, caret: number): MaskHistoryState {
  return { value, start: caret, end: caret };
}

describe('Mask history', () => {
  let history: MaskHistory;
  let signature: string;

  beforeEach(() => {
    signature = 'mask';
    history = createMaskHistory(() => signature);
  });

  describe('Recording', () => {
    it('starts out empty', () => {
      expect(history.canUndo).to.be.false;
      expect(history.canRedo).to.be.false;
      expect(history.undo(at('___', 0))).to.be.null;
      expect(history.redo(at('___', 0))).to.be.null;
    });

    it('records a single step', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      expect(history.canUndo).to.be.true;
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });

    it('drops the oldest entry past the cap', () => {
      for (let i = 0; i < 120; i++) {
        history.record('atomic', at(`${i}`, 0));
        history.settle(`${i + 1}`, 0);
      }

      let steps = 0;
      let state = history.undo(at('120', 0));

      while (state) {
        steps++;
        state = history.undo(state);
      }

      expect(steps).to.equal(100);
    });
  });

  describe('Coalescing', () => {
    it('merges a contiguous run of insertions', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);
      history.record('insert', at('a__', 1));
      history.settle('ab_', 2);
      history.record('insert', at('ab_', 2));
      history.settle('abc', 3);

      // One step back to the state before the whole run.
      expect(history.undo(at('abc', 3))).to.eql(at('___', 0));
      expect(history.canUndo).to.be.false;
    });

    it('merges a contiguous run of backspaces', () => {
      history.record('delete-backward', at('abc', 3));
      history.settle('ab_', 2);
      history.record('delete-backward', at('ab_', 2));
      history.settle('a__', 1);

      expect(history.undo(at('a__', 1))).to.eql(at('abc', 3));
      expect(history.canUndo).to.be.false;
    });

    it('breaks the run when the kind changes', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);
      history.record('delete-backward', at('a__', 1));
      history.settle('___', 0);

      expect(history.undo(at('___', 0))).to.eql(at('a__', 1));
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });

    it('breaks the run when the caret is not contiguous', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);

      // The caret moved - e.g. an arrow key or a click.
      history.record('insert', at('a__', 2));
      history.settle('a_c', 3);

      expect(history.undo(at('a_c', 3))).to.eql(at('a__', 2));
      expect(history.undo(at('a__', 2))).to.eql(at('___', 0));
    });

    it('never merges into a replaced selection', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);
      history.record('insert', { value: 'a__', start: 1, end: 3 });
      history.settle('ab_', 2);

      expect(history.undo(at('ab_', 2))).to.eql({
        value: 'a__',
        start: 1,
        end: 3,
      });
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });

    it('never merges atomic edits', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);
      history.record('atomic', at('a__', 1));
      history.settle('ab_', 2);

      expect(history.undo(at('ab_', 2))).to.eql(at('a__', 1));
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });

    it('does not merge across an atomic edit', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);
      history.record('atomic', at('a__', 1));
      history.settle('ab_', 2);
      history.record('insert', at('ab_', 2));
      history.settle('abc', 3);

      expect(history.undo(at('abc', 3))).to.eql(at('ab_', 2));
      expect(history.undo(at('ab_', 2))).to.eql(at('a__', 1));
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });
  });

  describe('Traversal', () => {
    it('round-trips undo and redo', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      const undone = history.undo(at('a__', 1))!;
      expect(undone).to.eql(at('___', 0));
      expect(history.canRedo).to.be.true;

      expect(history.redo(undone)).to.eql(at('a__', 1));
      expect(history.canUndo).to.be.true;
      expect(history.canRedo).to.be.false;
    });

    it('keeps the redo caret correct across a fast repeat', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);
      history.record('atomic', at('a__', 1));
      history.settle('ab_', 2);

      // Two undos in a row. The masked text is written synchronously, but the caret is
      // only applied after the render - a key repeat outruns it and reports a stale one.
      const first = history.undo(at('ab_', 2))!;
      history.undo({ value: 'a__', start: 99, end: 99 });

      // The redo entry must carry the caret the first undo restored, not the stale 99.
      expect(history.redo(at('___', 0))).to.eql(first);
    });

    it('records after an undo and drops the redo stack', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);
      history.undo(at('a__', 1));

      expect(history.canRedo).to.be.true;

      history.record('atomic', at('___', 0));
      history.settle('z__', 1);

      expect(history.canRedo).to.be.false;
    });

    it('does not merge a new edit into the step it just restored', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);
      history.undo(at('a__', 1));

      history.record('insert', at('___', 0));
      history.settle('z__', 1);

      expect(history.undo(at('z__', 1))).to.eql(at('___', 0));
    });
  });

  describe('Invalidation', () => {
    it('drops the earlier history when the text moved out of band', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      // Something assigned `value` behind the history's back, and then the user edited.
      history.record('atomic', at('xyz', 0));
      history.settle('xyzq', 1);

      // The new edit is undoable, but only back to the assigned value - the steps that
      // preceded it describe a document that no longer exists.
      expect(history.undo(at('xyzq', 1))).to.eql(at('xyz', 0));
      expect(history.canUndo).to.be.false;
    });

    it('refuses to traverse a history whose document moved on', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      expect(history.undo(at('xyz', 0))).to.be.null;
      expect(history.canUndo).to.be.false;
    });

    it('drops the history when the mask pattern changes', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      signature = 'other-mask';

      expect(history.undo(at('a__', 1))).to.be.null;
      expect(history.canUndo).to.be.false;
    });

    it('resync keeps an unchanged document', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      history.resync('a__');

      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });

    it('resync drops a changed document', () => {
      history.record('atomic', at('___', 0));
      history.settle('a__', 1);

      history.resync('zzz');

      expect(history.canUndo).to.be.false;
    });

    it('resync breaks the current run', () => {
      history.record('insert', at('___', 0));
      history.settle('a__', 1);

      history.resync('a__');

      history.record('insert', at('a__', 1));
      history.settle('ab_', 2);

      expect(history.undo(at('ab_', 2))).to.eql(at('a__', 1));
      expect(history.undo(at('a__', 1))).to.eql(at('___', 0));
    });
  });
});
