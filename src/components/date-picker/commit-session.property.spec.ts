import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { type CommitPolicy, CommitSession } from './commit-session.js';

type Value = number | null;

type Step =
  | { op: 'pick' | 'commitEdit' | 'setFromCode'; value: Value }
  | { op: 'policy'; policy: CommitPolicy }
  | { op: 'confirm' | 'cancel' | 'clear' | 'blur' };

const valueArb: fc.Arbitrary<Value> = fc.constantFrom(null, 1, 2, 3);
const policyArb: fc.Arbitrary<CommitPolicy> = fc.constantFrom(
  'at-once',
  'on-confirm'
);

const stepArb: fc.Arbitrary<Step> = fc.oneof(
  fc.record({
    op: fc.constantFrom(
      'pick' as const,
      'commitEdit' as const,
      'setFromCode' as const
    ),
    value: valueArb,
  }),
  fc.record({ op: fc.constant('policy' as const), policy: policyArb }),
  fc.record({
    op: fc.constantFrom(
      'confirm' as const,
      'cancel' as const,
      'clear' as const,
      'blur' as const
    ),
  })
);

/**
 * Runs `steps` and checks after each one that:
 * - a report carries the value, and changes the reported value, except a pick under `at-once`
 * - a value from code, a clear, Cancel and a pick under `on-confirm` report nothing
 * - Cancel restores the value from before the draft
 * - after a blur, no change is left unreported, except a draft
 */
function run(initial: Value, initialPolicy: CommitPolicy, steps: Step[]): void {
  const picker = {
    policy: initialPolicy,
    value: initial,
    reports: [] as Value[],
  };

  const session = new CommitSession<number>({
    policy: () => picker.policy,
    read: () => picker.value,
    write: (value) => {
      picker.value = value;
    },
    emit: (value) => {
      expect(value).to.equal(picker.value);
      picker.reports.push(value);
    },
  });
  session.adopt();

  // The model: the reported value, and the value before the draft.
  let reported = initial;
  let beforeDraft: Value | undefined;

  for (const step of steps) {
    const before = picker.reports.length;
    const onConfirm = picker.policy === 'on-confirm';

    switch (step.op) {
      case 'policy':
        picker.policy = step.policy;
        break;
      case 'setFromCode':
        picker.value = step.value;
        session.adopt();
        reported = step.value;
        beforeDraft = undefined;
        break;
      case 'pick':
        if (!onConfirm) beforeDraft = undefined;
        else if (beforeDraft === undefined) beforeDraft = picker.value;
        session.pick(step.value);
        break;
      case 'cancel':
        session.cancel();
        if (beforeDraft !== undefined) {
          expect(picker.value).to.equal(beforeDraft);
          beforeDraft = undefined;
        }
        break;
      case 'confirm':
        session.confirm();
        if (onConfirm) beforeDraft = undefined;
        break;
      case 'commitEdit':
        session.commitEdit(step.value);
        beforeDraft = undefined;
        break;
      case 'clear':
        session.clear();
        beforeDraft = undefined;
        break;
      case 'blur':
        session.blur();
        break;
    }

    const reports = picker.reports.slice(before);
    expect(reports.length).to.be.at.most(1);

    const silent = ['setFromCode', 'clear', 'cancel'].includes(step.op);
    if (silent || (step.op === 'pick' && onConfirm)) {
      expect(reports).to.eql([]);
    }

    if (reports.length) {
      if (step.op !== 'pick') expect(reports[0]).not.to.equal(reported);
      reported = reports[0];
    }

    if (step.op === 'blur' && beforeDraft === undefined) {
      expect(picker.value).to.equal(reported);
    }
  }
}

describe('Commit session', () => {
  describe('Properties', () => {
    it('keeps the commit rules for any sequence of actions', () => {
      fc.assert(
        fc.property(
          valueArb,
          policyArb,
          fc.array(stepArb, { maxLength: 25 }),
          run
        )
      );
    });
  });
});
