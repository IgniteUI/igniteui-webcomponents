import { expect } from '@open-wc/testing';

import { fc } from '#internals/testing/fast-check-setup.spec.js';
import type { ComboValue } from '../types.js';
import { ComboSelection, type ComboSelectionHost } from './selection.js';

type City = { id: number; name: string };

/** Records 0-3 start in `data`; 4 and 5 are outside it; values 6 and 7 never have a record. */
const pool: City[] = Array.from({ length: 6 }, (_, id) => ({
  id,
  name: `City ${id}`,
}));

type Op =
  | { op: 'apply'; records: number[]; selecting: boolean }
  | { op: 'syncFromValue' | 'forget'; values: number[] }
  | {
      op:
        | 'selectAll'
        | 'clear'
        | 'open'
        | 'close'
        | 'commit'
        | 'dropPending'
        | 'syncPending';
    }
  | { op: 'data'; size: number; copies: boolean };

const ids = fc.array(fc.integer({ min: 0, max: 7 }), { maxLength: 4 });

const opArb: fc.Arbitrary<Op> = fc.oneof(
  fc.record({
    op: fc.constant('apply' as const),
    records: fc.array(fc.integer({ min: 0, max: 5 }), { maxLength: 3 }),
    selecting: fc.boolean(),
  }),
  fc.record({
    op: fc.constantFrom('syncFromValue' as const, 'forget' as const),
    values: ids,
  }),
  fc.record({
    op: fc.constantFrom(
      'selectAll' as const,
      'clear' as const,
      'open' as const,
      'close' as const,
      'commit' as const,
      'dropPending' as const,
      'syncPending' as const
    ),
  }),
  fc.record({
    op: fc.constant('data' as const),
    size: fc.integer({ min: 0, max: 6 }),
    copies: fc.boolean(),
  })
);

function run(confirm: boolean, ops: Op[]): void {
  const host: ComboSelectionHost<City> = {
    data: pool.slice(0, 4),
    valueKey: 'id',
    displayKey: 'name',
    singleSelect: false,
    open: false,
    selectionCommit: confirm ? 'confirm' : 'immediate',
  };
  const selection = new ComboSelection<City>(host);

  for (const step of ops) {
    const committedBefore = selection.project().values;
    const hadPending = selection.pending !== undefined;

    switch (step.op) {
      case 'apply':
        selection.apply(
          step.records.map(
            (id) => host.data.find((r) => r.id === id) ?? pool[id]
          ),
          step.selecting
        );
        break;
      case 'syncFromValue':
        selection.syncFromValue(step.values);
        break;
      case 'forget':
        selection.forget(step.values);
        break;
      case 'open':
      case 'close':
        host.open = step.op === 'open';
        break;
      case 'commit': {
        const pending = selection.pending;
        if (pending) {
          selection.commit(pending);
        }
        break;
      }
      case 'data':
        host.data = pool
          .slice(0, step.size)
          .map((record) => (step.copies ? { ...record } : record));
        selection.invalidateIndex();
        selection.syncFromValue(committedBefore);
        selection.syncPending();
        break;
      default:
        selection[step.op]();
    }

    const values = selection.project().values;
    const records = selection.selected;
    const pending = selection.pending;

    // Each value one time, and one record for each value, in the order of the values.
    expect(new Set(values).size).to.equal(values.length);
    const recordValues = selection.toValues(records);
    expect(recordValues).to.eql(
      values.filter((value) => recordValues.includes(value))
    );

    // The pending selection exists only while the list is open in the confirm mode.
    expect(pending !== undefined).to.equal(host.open && confirm);

    // `has` follows the values that have a record in the current selection.
    for (const record of pool) {
      const value = record.id as ComboValue<City>;
      const selected = pending
        ? pending.get(value) !== undefined
        : recordValues.includes(value);

      expect(selection.has(record)).to.equal(selected);
    }

    // A change of the pending selection keeps the committed values and their order.
    const changesCommitted = ['commit', 'data', 'syncFromValue', 'clear'];
    if (hadPending && pending && !changesCommitted.includes(step.op)) {
      expect(values).to.eql(committedBefore);
    }
  }
}

/**
 * Runs `ops` and checks for each change that `preview()`, the `newValue` of
 * `igcChange`, gives the values that `apply()` then makes. As the combo, it
 * passes the first records, one record in single selection, and does not
 * select all in single selection.
 */
function runPreview(single: boolean, confirm: boolean, ops: Op[]): void {
  const host: ComboSelectionHost<City> = {
    data: pool.slice(0, 4),
    valueKey: 'id',
    displayKey: 'name',
    singleSelect: single,
    open: false,
    selectionCommit: confirm ? 'confirm' : 'immediate',
  };
  const selection = new ComboSelection<City>(host);
  const limit = <V>(values: V[]): V[] => (single ? values.slice(0, 1) : values);
  const currentValues = () => {
    const pending = selection.pending;
    return pending ? selection.valuesOf(pending) : selection.project().values;
  };

  for (const step of ops) {
    const committedBefore = selection.project().values;

    switch (step.op) {
      case 'apply': {
        const records = selection.firstRecords(
          limit(step.records).map(
            (id) => host.data.find((r) => r.id === id) ?? pool[id]
          )
        );
        const preview = selection.preview(records, step.selecting);

        selection.apply(records, step.selecting);
        expect(currentValues()).to.eql(preview);
        break;
      }
      case 'syncFromValue':
        selection.syncFromValue(limit(step.values));
        break;
      case 'forget':
        selection.forget(step.values);
        break;
      case 'open':
      case 'close':
        host.open = step.op === 'open';
        break;
      case 'commit': {
        const pending = selection.pending;
        if (pending) {
          selection.commit(pending);
        }
        break;
      }
      case 'data':
        host.data = pool
          .slice(0, step.size)
          .map((record) => (step.copies ? { ...record } : record));
        selection.invalidateIndex();
        selection.syncFromValue(committedBefore);
        selection.syncPending();
        break;
      case 'selectAll':
        if (!single) {
          selection.selectAll();
        }
        break;
      default:
        selection[step.op]();
    }
  }
}

describe('Combo selection properties', () => {
  it('keeps unique values, one record for each value and one order', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.array(opArb, { maxLength: 20 }), run)
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
