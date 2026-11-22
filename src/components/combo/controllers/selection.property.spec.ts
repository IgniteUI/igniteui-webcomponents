import { expect } from '@open-wc/testing';
import { spy } from 'sinon';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import type { ComboValue } from '../types.js';
import {
  ComboSelection,
  type ComboSelectionChange,
  type ComboSelectionHost,
} from './selection.js';

type City = { id: number; name: string };

/** Records 0-3 start in `data`; 4 and 5 are outside it; values 6 and 7 never have a record. */
const pool: City[] = Array.from({ length: 6 }, (_, id) => ({
  id,
  name: `City ${id}`,
}));

type Op =
  | { op: 'select' | 'deselect' | 'toggle'; records: number[] }
  | { op: 'selectValues' | 'deselectValues' | 'assign'; values: number[] }
  | {
      op:
        | 'open'
        | 'close'
        | 'commit'
        | 'dropPending'
        | 'dataChanged'
        | 'resync'
        | 'project'
        | 'clearWhileTyping';
    }
  | { op: 'data'; size: number; copies: boolean };

const ids = fc.array(fc.integer({ min: 0, max: 7 }), { maxLength: 4 });

const opArb: fc.Arbitrary<Op> = fc.oneof(
  fc.record({
    op: fc.constantFrom(
      'select' as const,
      'deselect' as const,
      'toggle' as const
    ),
    records: fc.array(fc.integer({ min: 0, max: 5 }), { maxLength: 3 }),
  }),
  fc.record({
    op: fc.constantFrom(
      'selectValues' as const,
      'deselectValues' as const,
      'assign' as const
    ),
    values: ids,
  }),
  fc.record({
    op: fc.constantFrom(
      'open' as const,
      'close' as const,
      'commit' as const,
      'dropPending' as const,
      'dataChanged' as const,
      'resync' as const,
      'project' as const,
      'clearWhileTyping' as const
    ),
  }),
  fc.record({
    op: fc.constant('data' as const),
    size: fc.integer({ min: 0, max: 6 }),
    copies: fc.boolean(),
  })
);

/** What a step did. */
type StepResult = {
  /** A change of the selection through `apply` or `resync`, which writes the committed values. */
  change: boolean;
  keepText: boolean;
  /** The `newValue` of an applied proposal, read before the apply. */
  preview?: ComboValue<City>[];
};

function harness(single: boolean, confirm: boolean) {
  const state = {
    value: [] as ComboValue<City>[],
    write: spy((values: ComboValue<City>[]) => {
      state.value = values;
    }),
  };
  const host: ComboSelectionHost<City> = {
    requestUpdate: () => {},
    data: pool.slice(0, 4),
    valueKey: 'id',
    displayKey: 'name',
    singleSelect: single,
    open: false,
    selectionCommit: confirm ? 'confirm' : 'immediate',
  };
  const selection = new ComboSelection<City>(
    host,
    { read: () => state.value, write: state.write },
    () => {}
  );

  return { host, state, selection };
}

type Harness = ReturnType<typeof harness>;

const recordChange = {
  select: 'selection',
  deselect: 'deselection',
  toggle: 'toggle',
} as const;

/** Runs `step` as the combo does: one record of the list in single selection. */
function perform({ host, selection }: Harness, step: Op): StepResult {
  const result: StepResult = { change: false, keepText: false };
  const limit = <V>(values: V[]): V[] =>
    host.singleSelect ? values.slice(0, 1) : values;
  const apply = (change: ComboSelectionChange<City>, keepText = false) => {
    result.change = true;
    result.keepText = keepText;
    result.preview = change.newValue;
    selection.apply(change, { keepText });
  };

  switch (step.op) {
    case 'select':
    case 'deselect':
    case 'toggle':
      apply(
        selection.proposeRecords(
          limit(
            step.records.map(
              (id) => host.data.find((record) => record.id === id) ?? pool[id]
            )
          ),
          recordChange[step.op]
        )
      );
      break;
    case 'selectValues':
    case 'deselectValues':
      apply(
        selection.propose(
          step.values,
          step.op === 'selectValues' ? 'selection' : 'deselection'
        )
      );
      break;
    case 'assign':
      selection.assign(step.values);
      break;
    case 'open':
    case 'close':
      host.open = step.op === 'open';
      break;
    case 'commit': {
      const change = selection.proposeCommit();
      if (change) {
        result.preview = change.newValue;
        selection.apply(change);
      }
      break;
    }
    case 'resync':
      result.change = true;
      selection.resync();
      break;
    case 'clearWhileTyping': {
      const [selected] = selection.selected;
      if (host.singleSelect && selected) {
        apply(selection.propose(selected, 'deselection'), true);
      }
      break;
    }
    case 'data':
      host.data = pool
        .slice(0, step.size)
        .map((record) => (step.copies ? { ...record } : record));
      selection.invalidateIndex();
      selection.dataChanged();
      break;
    default:
      selection[step.op]();
  }

  return result;
}

/**
 * The internal state that the invariants check: the values of the committed
 * selection, which a sync writes to `value`, and the pending entries with
 * their records. No public member gives either.
 */
function internals(selection: ComboSelection<City>) {
  return {
    committedValues: selection['_valuesOf'](selection['_committed']),
    pending: selection['_lazyPending'],
  };
}

function committedValues(selection: ComboSelection<City>): ComboValue<City>[] {
  return internals(selection).committedValues;
}

function displayText(selection: ComboSelection<City>): string {
  return selection.selected.map(({ name }) => name).join(', ');
}

function run(single: boolean, confirm: boolean, ops: Op[]): void {
  const context = harness(single, confirm);
  const { host, state, selection } = context;
  // A clear while typing keeps the text until the next projection.
  let staleText = false;

  for (const step of ops) {
    const committedBefore = committedValues(selection);
    const hadPending = selection.pendingValue !== undefined;
    const textBefore = selection.text;
    const writesBefore = state.write.callCount;

    const { change, keepText } = perform(context, step);

    const { committedValues: values, pending } = internals(selection);
    const records = selection.selected;
    const wrote = state.write.callCount > writesBefore;

    // Each value one time, and one record for each value, in the order of the values.
    expect(new Set(values).size).to.equal(values.length);
    const recordValues = records.map(({ id }) => id as ComboValue<City>);
    expect(recordValues).to.eql(
      values.filter((value) => recordValues.includes(value))
    );

    // The pending selection exists only while the list is open in the confirm mode.
    expect(pending !== undefined).to.equal(host.open && confirm && !single);

    // `has` follows the values that have a record in the current selection.
    for (const record of pool) {
      const value = record.id as ComboValue<City>;
      const selected = pending
        ? pending.get(value) !== undefined
        : recordValues.includes(value);

      expect(selection.has(record)).to.equal(selected);
    }

    // A change of the pending selection keeps the committed values and their order.
    const changesCommitted = ['commit', 'data', 'dataChanged', 'assign'];
    if (hadPending && pending && !changesCommitted.includes(step.op)) {
      expect(values).to.eql(committedBefore);
    }

    // A change writes the committed values one time, but not while a selection is pending.
    if (change) {
      expect(state.write.callCount).to.equal(
        writesBefore + (hadPending ? 0 : 1)
      );

      if (!hadPending) {
        expect(state.value).to.eql(keepText ? [] : values);
      }
    }

    // `value` is synced with each write.
    if (wrote) {
      expect(selection.isSynced(state.value)).to.be.true;
    }

    if (keepText) {
      expect(selection.text).to.equal(textBefore);
      staleText = true;
    } else if (wrote || step.op === 'project') {
      staleText = false;
    }

    if (!staleText) {
      expect(selection.text).to.equal(displayText(selection));
    }
  }
}

/**
 * Runs `ops` and checks for each proposal that its `newValue`, read before
 * the apply, gives the values that the apply then makes.
 */
function runPreview(single: boolean, confirm: boolean, ops: Op[]): void {
  const context = harness(single, confirm);
  const { selection } = context;

  for (const step of ops) {
    const { preview } = perform(context, step);
    // A deselection by value also forgets the values without a record, which
    // `newValue` keeps. Only `deselect()` makes it in multiple selection, and
    // it sends no event.
    const forgets = step.op === 'deselectValues' && !single;

    if (preview && !forgets) {
      expect(selection.pendingValue ?? committedValues(selection)).to.eql(
        preview
      );
    }
  }
}

describe('Combo selection properties', () => {
  it('keeps unique values, one record for each value and one order, with value in sync', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.array(opArb, { maxLength: 20 }),
        run
      )
    );
  });

  it('previews the values that each change makes, in both selection modes', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.array(opArb, { maxLength: 20 }),
        runPreview
      )
    );
  });
});
