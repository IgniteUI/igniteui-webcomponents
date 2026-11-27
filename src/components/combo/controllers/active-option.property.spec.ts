import { expect } from '@open-wc/testing';

import {
  type DataCity,
  dataCities,
  type FakeComboHost,
  fakeComboHost,
  recordName,
} from '#internals/testing/combo.spec.js';
import { fc } from '#internals/testing/fast-check-setup.spec.js';
import { ComboActiveOption } from './active-option.js';
import { DataState } from './data.js';

type Toggle =
  | 'open'
  | 'showSelectAll'
  | 'groupSelection'
  | 'singleSelect'
  | 'groupKey';

const pool: DataCity[] = [
  ...dataCities,
  { id: 6, name: 'Varna', country: 'Bulgaria' },
];

type Op =
  | { op: 'step'; delta: -1 | 1 }
  // Not `reset`: the manifest analyzer also reads specs, and that literal
  // changes the printed `type` of the button.
  | { op: 'first' | 'last' | 'none' | 'update' }
  | { op: 'pick'; nth: number }
  | { op: 'term'; term: string; search: boolean }
  | { op: 'data'; size: number; copies: boolean; reverse: boolean }
  | { op: 'toggle'; field: Toggle };

const opArb: fc.Arbitrary<Op> = fc.oneof(
  { weight: 4, arbitrary: fc.constant({ op: 'update' as const }) },
  fc.record({
    op: fc.constant('step' as const),
    delta: fc.constantFrom(-1 as const, 1 as const),
  }),
  fc.record({
    op: fc.constantFrom('first' as const, 'last' as const, 'none' as const),
  }),
  fc.record({ op: fc.constant('pick' as const), nth: fc.nat({ max: 8 }) }),
  fc.record({
    op: fc.constant('term' as const),
    term: fc.constantFrom('', 'o', 'r', 'a', 'Paris', 'x'),
    search: fc.boolean(),
  }),
  fc.record({
    op: fc.constant('data' as const),
    size: fc.integer({ min: 0, max: pool.length }),
    copies: fc.boolean(),
    reverse: fc.boolean(),
  }),
  fc.record({
    op: fc.constant('toggle' as const),
    field: fc.constantFrom<Toggle>(
      'open',
      'showSelectAll',
      'groupSelection',
      'singleSelect',
      'groupKey'
    ),
  })
);

type Start = Pick<
  FakeComboHost,
  'showSelectAll' | 'groupSelection' | 'singleSelect' | 'groupKey'
>;

const startArb: fc.Arbitrary<Start> = fc.record({
  showSelectAll: fc.boolean(),
  groupSelection: fc.boolean(),
  singleSelect: fc.boolean(),
  groupKey: fc.constantFrom(undefined, 'country' as const),
});

function run(start: Start, ops: Op[]): void {
  const host = fakeComboHost({
    data: pool.slice(0, 5),
    requestUpdate: () => {},
    ...start,
  });
  const state = new DataState<DataCity>(host);
  const active = new ComboActiveOption<DataCity>(host, state, () => {});
  // The names are unique, so they match records without `indexOfRecord`.
  const keyAt = (index: number): string | undefined => {
    const record = state.dataState[index];
    return record ? recordName(record) : undefined;
  };

  state.hostUpdate();
  active.hostUpdate();

  // The anchor of the last update, and whether an intent came since.
  let anchor = keyAt(active.active);
  let singleSelect = host.singleSelect;
  let intent = false;

  for (const step of ops) {
    switch (step.op) {
      case 'step':
        active.step(step.delta);
        intent = true;
        break;
      case 'first':
      case 'last':
        active[step.op]();
        intent = true;
        break;
      case 'none':
        active.reset();
        intent = true;
        break;
      case 'pick': {
        const options = state.dataState
          .map((record, index) => (state.isOption(record) ? index : -1))
          .filter((index) => index > -1);

        if (options.length > 0) {
          active.set(options[step.nth % options.length]);
          intent = true;
        }
        break;
      }
      case 'term':
        state.searchTerm = step.term;
        if (step.search) {
          active.search();
          intent = true;
        }
        break;
      case 'data': {
        const data = pool
          .slice(0, step.size)
          .map((city) => (step.copies ? { ...city } : city));
        host.data = step.reverse ? data.reverse() : data;
        break;
      }
      case 'toggle':
        if (step.field === 'groupKey') {
          host.groupKey = host.groupKey ? undefined : 'country';
        } else {
          host[step.field] = !host[step.field];
        }
        break;
      case 'update': {
        state.hostUpdate();
        active.hostUpdate();

        const records = state.dataState;
        const index = active.active;

        // The active option is an option, or none.
        if (index !== -1) {
          expect(records[index]).to.exist;
          expect(state.isOption(records[index])).to.be.true;
        }

        // A closed list has no active option.
        if (!host.open) {
          expect(index).to.equal(-1);
        }

        // Without an intent, the active option follows its anchor, or none is active.
        if (host.open && !intent && singleSelect === host.singleSelect) {
          const next = anchor
            ? records.findIndex((record) => recordName(record) === anchor)
            : -1;
          const expected =
            next > -1 && state.isOption(records[next]) ? next : -1;

          expect(index).to.equal(expected);
        }

        anchor = keyAt(index);
        singleSelect = host.singleSelect;
        intent = false;
        break;
      }
    }
  }
}

describe('Combo active option', () => {
  describe('Random operation invariants', () => {
    it('is an option or none, none while closed, and follows its anchor', () => {
      fc.assert(fc.property(startArb, fc.array(opArb, { maxLength: 40 }), run));
    });
  });
});
