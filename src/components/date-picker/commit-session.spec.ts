import { expect } from '@open-wc/testing';
import { createRecordingPicker } from '#internals/testing/commit-session.spec.js';
import type { CommitPolicy } from './commit-session.js';

type Value = number | { start: number; end: number };

function createSession(policy: CommitPolicy, initial: Value | null = 1) {
  return createRecordingPicker<Value>(policy, initial);
}

describe('Commit session', () => {
  describe('at-once', () => {
    it('writes and reports each pick', () => {
      const { picker, session } = createSession('at-once');

      session.pick(2);
      session.pick(2);

      expect(picker.value).to.equal(2);
      expect(picker.reports).to.eql([2, 2]);
    });

    it('ignores Cancel and Done', () => {
      const { picker, session } = createSession('at-once');
      session.pick(2);

      session.cancel();
      session.confirm();

      expect(picker.value).to.equal(2);
      expect(picker.reports).to.eql([2]);
    });

    it('reports an editor commit only when it changes the reported value', () => {
      const { picker, session } = createSession('at-once');

      session.commitEdit(1);
      session.commitEdit(3);
      session.commitEdit(3);

      expect(picker.reports).to.eql([3]);
    });

    it('reports a clear on blur, one time, also after Cancel and Done', () => {
      const { picker, session } = createSession('at-once');

      session.clear();
      session.cancel();
      session.confirm();
      expect(picker.value).to.be.null;
      expect(picker.reports).to.eql([]);

      session.blur();
      session.blur();
      expect(picker.reports).to.eql([null]);
    });

    it('reports a clear through the editor commit, and not again on blur', () => {
      const { picker, session } = createSession('at-once');

      session.clear();
      session.commitEdit(null);
      session.blur();

      expect(picker.reports).to.eql([null]);
    });
  });

  describe('on-confirm', () => {
    it('keeps picks as a draft until Done', () => {
      const { picker, session } = createSession('on-confirm');

      session.pick(2);
      expect(picker.value).to.equal(2);
      expect(picker.reports).to.eql([]);

      session.confirm();
      session.confirm();
      expect(picker.reports).to.eql([2]);
    });

    it('reports nothing on Done without a change', () => {
      const { picker, session } = createSession('on-confirm');

      session.pick(2);
      session.pick(1);
      session.confirm();

      expect(picker.reports).to.eql([]);
    });

    it('restores the value from before the draft on Cancel', () => {
      const { picker, session } = createSession('on-confirm');

      session.pick(2);
      session.pick(3);
      session.cancel();

      expect(picker.value).to.equal(1);
      expect(picker.reports).to.eql([]);
    });

    it('keeps the value of Done on a later Cancel', () => {
      const { picker, session } = createSession('on-confirm');

      session.pick(2);
      session.confirm();
      session.cancel();
      session.blur();

      expect(picker.value).to.equal(2);
      expect(picker.reports).to.eql([2]);
    });

    it('never reports a draft on blur', () => {
      const { picker, session } = createSession('on-confirm');

      session.pick(2);
      session.blur();
      expect(picker.reports).to.eql([]);

      session.confirm();
      expect(picker.reports).to.eql([2]);
    });

    it('ends the draft on a value set from code', () => {
      const { picker, session, setFromCode } = createSession('on-confirm');
      session.pick(2);

      setFromCode(3);
      session.confirm();
      session.cancel();

      expect(picker.value).to.equal(3);
      expect(picker.reports).to.eql([]);
    });

    for (const close of ['cancel', 'confirm'] as const) {
      it(`reports a clear one time after ${close}`, () => {
        const { picker, session } = createSession('on-confirm');

        session.clear();
        session[close]();
        session.blur();

        expect(picker.value).to.be.null;
        expect(picker.reports).to.eql([null]);
      });
    }
  });

  it('ends a draft on a pick under at-once', () => {
    const { picker, session } = createSession('on-confirm');
    session.pick(2);

    picker.policy = 'at-once';
    session.pick(3);
    session.cancel();
    session.blur();

    expect(picker.value).to.equal(3);
    expect(picker.reports).to.eql([3]);
  });

  it('reads the policy at each action', () => {
    const { picker, session } = createSession('on-confirm');

    session.pick(2);
    expect(picker.reports).to.eql([]);

    picker.policy = 'at-once';
    session.pick(3);
    expect(picker.reports).to.eql([3]);
  });

  it('compares values by content', () => {
    const { picker, session } = createSession('on-confirm', {
      start: 1,
      end: 2,
    });

    session.pick({ start: 1, end: 2 });
    session.confirm();

    expect(picker.reports).to.eql([]);
  });
});
