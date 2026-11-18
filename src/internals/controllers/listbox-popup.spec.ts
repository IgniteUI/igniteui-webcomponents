import { expect } from '@open-wc/testing';
import {
  decideListboxIntent,
  type ListboxIntent,
  type ListboxOutcome,
  type ListboxState,
} from './listbox-popup.js';

type Row = [ListboxIntent, Partial<ListboxState>, ListboxOutcome];

const COMMIT = { commit: true } as const;
const COMMIT_CLOSE = { commit: true, close: true } as const;
const CLOSE = { close: true } as const;

/**
 * The popup rules. A row names only the state that matters for it; the
 * outcome is the same for every value of the other state.
 */
const ROWS: Row[] = [
  ['move', { hasItem: false }, {}],
  ['move', { hasItem: true, open: true }, { activate: true }],
  ['move', { hasItem: true, open: false, closedKeys: true }, COMMIT],
  ['move', { hasItem: true, open: false, closedKeys: false }, {}],

  ['pick', { hasItem: false }, {}],
  [
    'pick',
    { hasItem: true, open: true, keepOpenOnSelect: false },
    COMMIT_CLOSE,
  ],
  ['pick', { hasItem: true, open: true, keepOpenOnSelect: true }, COMMIT],
  ['pick', { hasItem: true, open: false }, COMMIT],

  ['enter', { open: false, closedKeys: true }, { open: true }],
  ['enter', { open: false, closedKeys: false }, {}],
  ['enter', { open: true, hasItem: false }, CLOSE],
  [
    'enter',
    { open: true, hasItem: true, keepOpenOnSelect: false },
    COMMIT_CLOSE,
  ],
  ['enter', { open: true, hasItem: true, keepOpenOnSelect: true }, COMMIT],

  ['tab', { open: false }, {}],
  ['tab', { open: true, hasItem: false }, CLOSE],
  ['tab', { open: true, hasItem: true }, COMMIT_CLOSE],

  ['escape', { open: false }, {}],
  ['escape', { open: true }, { close: true, refocus: true }],
];

const KEYS: (keyof ListboxState)[] = [
  'open',
  'keepOpenOnSelect',
  'closedKeys',
  'hasItem',
];

const FLAGS = [false, true];

/** Every state: each combination of the four flags. */
const STATES: ListboxState[] = FLAGS.flatMap((open) =>
  FLAGS.flatMap((keepOpenOnSelect) =>
    FLAGS.flatMap((closedKeys) =>
      FLAGS.map((hasItem) => ({ open, keepOpenOnSelect, closedKeys, hasItem }))
    )
  )
);

function matches(state: ListboxState, partial: Partial<ListboxState>): boolean {
  return KEYS.every(
    (key) => partial[key] === undefined || partial[key] === state[key]
  );
}

describe('Listbox popup rules', () => {
  for (const [intent, partial, outcome] of ROWS) {
    it(`${intent} with ${JSON.stringify(partial)} gives ${JSON.stringify(outcome)}`, () => {
      for (const state of STATES.filter((each) => matches(each, partial))) {
        expect(
          decideListboxIntent(intent, state),
          JSON.stringify(state)
        ).to.deep.equal(outcome);
      }
    });
  }

  it('has one row for each state of each intent', () => {
    const intents = new Set(ROWS.map(([intent]) => intent));

    for (const intent of intents) {
      const rows = ROWS.filter(([each]) => each === intent);

      for (const state of STATES) {
        const count = rows.filter(([, partial]) =>
          matches(state, partial)
        ).length;
        expect(count, `${intent} ${JSON.stringify(state)}`).to.equal(1);
      }
    }

    expect([...intents]).to.have.members([
      'move',
      'pick',
      'enter',
      'tab',
      'escape',
    ]);
  });
});
