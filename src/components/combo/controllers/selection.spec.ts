import { expect } from '@open-wc/testing';
import { spy } from 'sinon';

import type { ComboValue } from '../types.js';
import {
  ComboSelection,
  type ComboSelectionHost,
  type ComboValuePort,
} from './selection.js';

type City = { id: number | null; name: string };

const cities: City[] = [
  { id: 1, name: 'Sofia' },
  { id: 2, name: 'Plovdiv' },
  { id: 3, name: 'Varna' },
];
const [sofia, plovdiv, varna] = cities;
/** A record that `data` does not hold, for example from a remote source. */
const burgas: City = { id: 9, name: 'Burgas' };

type HostFields = Omit<ComboSelectionHost<City>, 'requestUpdate'>;

/** A host and a `value` port, with spies on the update requests, the writes and the row renders. */
function setup(overrides: Partial<HostFields> = {}) {
  const state = {
    value: [] as ComboValue<City>[],
    requestUpdate: spy(),
    onChange: spy(),
    write: spy((values: ComboValue<City>[]) => {
      state.value = values;
    }),
  };
  const host: ComboSelectionHost<City> = {
    data: cities,
    valueKey: 'id',
    displayKey: 'name',
    singleSelect: false,
    open: false,
    selectionCommit: 'immediate',
    ...overrides,
    requestUpdate: state.requestUpdate,
  };
  const port: ComboValuePort<City> = {
    read: () => state.value,
    write: state.write,
  };

  return {
    host,
    state,
    selection: new ComboSelection<City>(host, port, state.onChange),
  };
}

/** Opens the list in the confirm mode, so the selection has a pending part. */
function confirming(overrides: Partial<HostFields> = {}) {
  return setup({ open: true, selectionCommit: 'confirm', ...overrides });
}

/** Selects `records` of the list without an event, as `selectAllItems()`. */
function select(selection: ComboSelection<City>, ...records: City[]): boolean {
  return selection.apply(selection.proposeRecords(records, 'selection'));
}

function deselect(
  selection: ComboSelection<City>,
  ...records: City[]
): boolean {
  return selection.apply(selection.proposeRecords(records, 'deselection'));
}

/** Commits the selection of `records` with the list closed, then opens the list. */
function committedThenOpen(...records: City[]) {
  const context = setup({ selectionCommit: 'confirm' });

  select(context.selection, ...records);
  context.host.open = true;
  return context;
}

describe('Combo selection', () => {
  describe('Values', () => {
    it('reads the value from valueKey, or uses the record', () => {
      const keyed = setup();
      const plain = setup({ valueKey: undefined });

      select(keyed.selection, sofia);
      select(plain.selection, sofia);

      expect(keyed.state.value).to.eql([1]);
      expect(keyed.selection.propose(1, 'selection').items).to.eql([sofia]);
      expect(plain.state.value[0]).to.equal(sofia);
      expect(plain.selection.propose(sofia, 'selection').items[0]).to.equal(
        sofia
      );
    });

    it('uses the record as the value of a nullish field', () => {
      const { selection, state } = setup();
      const unknown: City = { id: null, name: 'Unknown' };

      select(selection, unknown);
      expect(state.value[0]).to.equal(unknown);
    });

    it('gives the values and the display text of the committed selection', () => {
      const { selection, state } = setup();

      select(selection, varna, sofia);
      expect(state.value).to.eql([3, 1]);
      expect(selection.text).to.equal('Varna, Sofia');
    });

    it('keeps a value without a record in its place, only in multiple selection', () => {
      const { host, selection, state } = setup();

      selection.assign([9, 1]);
      expect(state.value).to.eql([9, 1]);
      expect(selection.text).to.equal('Sofia');
      expect(selection.selected).to.eql([sofia]);
      expect(selection.hasRecords).to.be.true;

      host.singleSelect = true;
      selection.resync();
      expect(state.value).to.eql([1]);

      selection.assign([9]);
      expect(selection.hasRecords).to.be.false;
    });

    it('gives the records their values again for a new valueKey', () => {
      const { host, selection, state } = confirming();

      selection.assign([1, 9]);
      expect(selection.pendingValue).to.eql([1, 9]);
      host.valueKey = 'name';
      selection.rekey();

      expect(selection.pendingValue).to.eql(['Sofia', 9]);

      host.open = false;
      selection.resync();
      expect(state.value).to.eql(['Sofia', 9]);
    });
  });

  describe('Resolve', () => {
    it('resolves values and objects to the records of data in data order, one time each', () => {
      const { selection } = setup();

      expect(
        selection.propose([3, 1, { ...plovdiv }, 1], 'selection').items
      ).to.eql([sofia, plovdiv, varna]);
      expect(selection.propose([3], 'selection').items[0]).to.equal(varna);
    });

    it('takes the first record of a value that data repeats', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      expect(
        selection.propose([1, copy], 'selection').items
      ).to.have.ordered.members([sofia]);
    });

    it('puts the selected records and the objects that data does not hold last', () => {
      const { selection } = setup();
      const ruse: City = { id: 7, name: 'Ruse' };

      select(selection, burgas);
      const resolved = selection.propose([ruse, 9, 2, 42], 'selection').items;

      expect(resolved).to.eql([plovdiv, ruse, burgas]);
      expect(resolved[2]).to.equal(burgas);
    });

    it('prefers the pending record of a value to the committed one', () => {
      const { selection } = committedThenOpen(burgas);
      const newer: City = { ...burgas };

      deselect(selection, burgas);
      select(selection, newer);

      expect(selection.propose(9, 'selection').items[0]).to.equal(newer);
    });

    it('takes the first item only in single selection', () => {
      const { selection } = setup({ singleSelect: true });

      expect(selection.propose([3, 1], 'selection').items).to.eql([varna]);
    });
  });

  describe('Pending selection', () => {
    it('exists only while the list is open in the confirm mode of multiple selection', () => {
      expect(setup().selection.pendingValue).to.be.undefined;
      expect(setup({ open: true }).selection.pendingValue).to.be.undefined;
      expect(setup({ selectionCommit: 'confirm' }).selection.pendingValue).to.be
        .undefined;
      expect(confirming({ singleSelect: true }).selection.pendingValue).to.be
        .undefined;
      expect(confirming().selection.confirmMode).to.be.true;
      expect(confirming().selection.hasPending).to.be.true;
      expect(setup().selection.hasPending).to.be.false;
    });

    it('starts as a copy of the committed selection on the first read', () => {
      const { selection } = committedThenOpen(sofia);

      expect(selection.pendingValue).to.eql([1]);
      expect(selection.has(sofia)).to.be.true;

      // The next reads keep the copy and its changes.
      select(selection, plovdiv);
      expect(selection.pendingValue).to.eql([1, 2]);
      expect(selection.selected).to.eql([sofia]);
    });

    it('takes the changes and leaves the committed selection as it is', () => {
      const { selection, state } = committedThenOpen(sofia);

      select(selection, plovdiv);
      deselect(selection, sofia);

      expect(selection.pendingValue).to.eql([2]);
      expect(selection.has(plovdiv)).to.be.true;
      expect(selection.has(sofia)).to.be.false;
      expect(selection.selected).to.eql([sofia]);
      expect(state.value).to.eql([1]);
    });

    it('is dropped when the list closes, or on request', () => {
      const { host, selection } = confirming();

      select(selection, sofia);
      host.open = false;
      expect(selection.pendingValue).to.be.undefined;

      host.open = true;
      expect(selection.pendingValue).to.be.empty;

      select(selection, sofia);
      selection.dropPending();
      expect(selection.pendingValue).to.be.empty;
    });
  });

  describe('Changes', () => {
    it('previews the selected values first, then the new ones', () => {
      const { selection } = setup();

      select(selection, varna);
      expect(
        selection.proposeRecords([sofia, varna], 'selection').newValue
      ).to.eql([3, 1]);
      expect(selection.proposeRecords([varna], 'deselection').newValue).to.eql(
        []
      );
    });

    it('previews only the new value in single selection', () => {
      const { selection } = setup({ singleSelect: true });

      select(selection, varna);
      expect(selection.proposeRecords([sofia], 'selection').newValue).to.eql([
        1,
      ]);
    });

    it('computes newValue on the first read and keeps it', () => {
      const { selection } = setup();
      const change = selection.proposeRecords([sofia], 'selection');

      expect(change.newValue).to.eql([1]);
      select(selection, plovdiv);
      expect(change.newValue).to.eql([1]);
    });

    it('replaces the selection with a selection in single selection', () => {
      const { selection, state } = setup({ singleSelect: true });

      selection.assign([42]);
      select(selection, varna);
      expect(state.value).to.eql([3]);

      select(selection, sofia);
      expect(selection.selected).to.eql([sofia]);

      // A deselection removes only its value.
      deselect(selection, plovdiv);
      expect(selection.selected).to.eql([sofia]);
    });

    it('toggles the items that are not selected on, or all of them off when each one is selected', () => {
      const { selection } = setup();
      const toggle = (records: City[]) => {
        const { type, items } = selection.proposeRecords(records, 'toggle');
        return { type, items };
      };

      expect(toggle([sofia])).to.eql({ type: 'selection', items: [sofia] });

      select(selection, sofia);
      expect(toggle([sofia])).to.eql({ type: 'deselection', items: [sofia] });
      expect(toggle(cities)).to.eql({
        type: 'selection',
        items: [plovdiv, varna],
      });

      select(selection, plovdiv, varna);
      expect(toggle(cities)).to.eql({ type: 'deselection', items: cities });

      // It gives the change and does not make it.
      expect(selection.selected).to.eql(cities);
    });

    it('toggles a repeated value off, and reads the pending selection', () => {
      const copy = { ...sofia };
      const { selection } = confirming({ data: [sofia, plovdiv, copy] });

      select(selection, sofia);
      expect(selection.selected).to.be.empty;

      const { type, items } = selection.proposeRecords(
        [copy, plovdiv],
        'toggle'
      );
      expect(type).to.equal('selection');
      expect(items).to.have.ordered.members([plovdiv]);

      expect(selection.proposeRecords([copy], 'toggle').type).to.equal(
        'deselection'
      );
    });

    it('selects all the records of data and keeps the selected records outside it', () => {
      const { selection } = setup();

      select(selection, burgas);
      const change = selection.propose(undefined, 'selection');

      expect(change.items).to.eql(cities);
      expect(change.newValue).to.eql([1, 2, 3, 9]);
      selection.apply(change);
      expect([...selection.selected]).to.eql([...cities, burgas]);
    });

    it('selects all into the pending selection, and keeps the values without a record after the records', () => {
      const { selection } = confirming();

      selection.assign([42]);
      selection.apply(selection.propose([], 'selection'));

      expect(cities.every((city) => selection.has(city))).to.be.true;
      expect(selection.pendingValue).to.eql([1, 2, 3, 42]);
      expect(selection.selected).to.be.empty;
    });

    it('gives a committed value without a record its record from a pending change, in place', () => {
      const { selection, state } = confirming();

      selection.assign([9, 1]);
      expect(selection.selected).to.eql([sofia]);

      // No write while a selection is pending, but the text shows the record.
      expect(select(selection, burgas)).to.be.false;
      expect(selection.selected).to.eql([burgas, sofia]);
      expect(selection.text).to.equal('Burgas, Sofia');
      expect(state.value).to.eql([9, 1]);

      select(selection, plovdiv);
      expect(selection.selected).to.eql([burgas, sofia]);
    });

    it('gives a value without a record its record in place without a pending selection', () => {
      const { selection, state } = setup();

      selection.assign([9, 1]);
      expect(select(selection, burgas)).to.be.true;
      expect(state.value).to.eql([9, 1]);
      expect(selection.text).to.equal('Burgas, Sofia');
    });

    it('keeps one record for each value, and shows the value as selected for each record', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      select(selection, sofia, copy);
      expect(selection.selected).to.have.ordered.members([sofia]);
      expect(selection.has(copy)).to.be.true;

      deselect(selection, copy);
      expect(selection.has(sofia)).to.be.false;
      expect(selection.has(undefined as unknown as City)).to.be.false;

      // Any record of the value gives its first record in data.
      expect(
        selection.proposeRecords([copy, plovdiv, sofia], 'selection').items
      ).to.have.ordered.members([sofia, plovdiv]);
    });

    it('deselects the named values and forgets the ones without a record', () => {
      const { selection, state } = setup();

      selection.assign([9, 1, 42, 43]);
      selection.apply(selection.propose([42, sofia], 'deselection'));
      expect(state.value).to.eql([9, 43]);

      selection.apply(selection.propose(undefined, 'deselection'));
      expect(state.value).to.be.empty;
    });

    it('lists the records that the pending selection adds or removes, and commits it', () => {
      const { selection, state } = committedThenOpen(sofia, plovdiv);

      expect(selection.proposeCommit()).to.be.undefined;

      deselect(selection, sofia);
      select(selection, varna);

      const change = selection.proposeCommit()!;
      expect(change.type).to.equal('commit');
      expect(change.items).to.eql([varna, sofia]);
      expect(change.newValue).to.eql([2, 3]);

      expect(selection.apply(change)).to.be.true;
      expect(selection.selected).to.eql([plovdiv, varna]);
      expect(state.value).to.eql([2, 3]);

      // The commit copies the pending selection.
      select(selection, sofia);
      expect(selection.selected).to.eql([plovdiv, varna]);
    });

    it('has no commit without a pending selection', () => {
      expect(setup().selection.proposeCommit()).to.be.undefined;
    });

    it('clears the selection on a selection without items in single selection', () => {
      const { selection, state } = setup({ singleSelect: true });

      select(selection, sofia);
      selection.apply(selection.propose(undefined, 'selection'));
      expect(selection.selected).to.be.empty;
      expect(state.value).to.be.empty;
    });
  });

  describe('Value sync', () => {
    it('writes the committed values after each change, but not while a selection is pending', () => {
      const { host, selection, state } = setup({ selectionCommit: 'confirm' });

      select(selection, sofia);
      expect(state.write.callCount).to.equal(1);
      expect(selection.isSynced([1])).to.be.true;

      host.open = true;
      select(selection, plovdiv);
      expect(selection.resync()).to.be.false;
      expect(state.write.callCount).to.equal(1);
      expect(state.value).to.eql([1]);
    });

    it('is synced with the value it wrote, until data, its length or valueKey changes', () => {
      const data = [...cities];
      const { host, selection } = setup({ data });

      expect(selection.isSynced([])).to.be.false;

      select(selection, sofia);
      expect(selection.isSynced([1])).to.be.true;
      expect(selection.isSynced([2])).to.be.false;

      host.data = [...data];
      expect(selection.isSynced([1])).to.be.false;

      selection.assign([1]);
      expect(selection.isSynced([1])).to.be.true;

      host.data.push(burgas);
      expect(selection.isSynced([1])).to.be.false;

      selection.assign([1]);
      selection.rekey();
      expect(selection.isSynced([1])).to.be.false;
    });

    it('sees a change of value in place', () => {
      const { selection, state } = setup();
      const value: ComboValue<City>[] = [1];

      selection.assign(value);
      expect(selection.isSynced(value)).to.be.true;

      value.push(2);
      expect(selection.isSynced(value)).to.be.false;
      expect(state.value).to.equal(value);
    });

    it('writes one value in single selection with one write, and keeps an array it does not cut', () => {
      const { selection, state } = setup({ singleSelect: true });
      const value: ComboValue<City>[] = [3];

      selection.assign([1, 2]);
      expect(state.value).to.eql([1]);
      expect(state.write.callCount).to.equal(1);
      expect(selection.isSynced([1])).to.be.true;

      selection.assign(value);
      expect(state.value).to.equal(value);
      expect(selection.selected).to.eql([varna]);
    });

    it('drops the pending selection for a new value, and keeps it for the same value', () => {
      const { selection } = confirming();

      selection.assign([1]);
      select(selection, plovdiv);

      selection.assign([1]);
      expect(selection.pendingValue).to.eql([1, 2]);

      selection.assign([3]);
      expect(selection.pendingValue).to.eql([3]);
    });

    it('writes nothing for a new data unless single selection cuts the value', () => {
      const { host, selection, state } = setup();

      selection.assign([1, 2]);
      const writes = state.write.callCount;

      host.data = [...cities];
      selection.invalidateIndex();
      selection.dataChanged();
      expect(state.write.callCount).to.equal(writes);

      host.singleSelect = true;
      selection.dataChanged();
      expect(state.value).to.eql([1]);
      expect(state.write.callCount).to.equal(writes + 1);
    });

    it('cuts the value to one value when the selection turns single', () => {
      const { host, selection, state } = setup();

      selection.assign([2, 1]);
      host.singleSelect = true;
      selection.readValue();

      expect(state.value).to.eql([2]);
      expect(selection.selected).to.eql([plovdiv]);
      expect(selection.text).to.equal('Plovdiv');
    });

    it('writes an empty value and keeps the text on a clear while typing', () => {
      const { selection, state } = setup({ singleSelect: true });

      select(selection, sofia);
      const change = selection.propose(sofia, 'deselection');

      expect(selection.apply(change, { keepText: true })).to.be.true;
      expect(state.value).to.be.empty;
      expect(selection.isSynced([])).to.be.true;
      expect(selection.text).to.equal('Sofia');

      selection.project();
      expect(selection.text).to.be.empty;
    });

    it('writes the selection again after a canceled change', () => {
      const { selection, state } = setup();

      select(selection, sofia);
      selection.proposeRecords([plovdiv], 'selection');

      expect(selection.resync()).to.be.true;
      expect(state.write.callCount).to.equal(2);
      expect(state.value).to.eql([1]);
    });
  });

  describe('Sync', () => {
    it('gives each value its first record and keeps the records outside data', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      select(selection, burgas);
      selection.assign([1, 9, 42]);
      const [first, second, ...rest] = selection.selected;

      expect(first).to.equal(sofia);
      expect(second).to.equal(burgas);
      expect(rest).to.be.empty;
    });

    it('finds the records of data that grows in place', () => {
      const data = [sofia];
      const { selection } = setup({ data });

      selection.assign([2]);
      expect(selection.selected).to.be.empty;

      data.push(plovdiv);
      selection.assign([2]);
      expect([...selection.selected]).to.eql([plovdiv]);
    });

    it('finds a replaced record only after the index is invalidated', () => {
      const data = [sofia, plovdiv];
      const { selection } = setup({ data });
      const replaced: City = { id: 5, name: 'Pleven' };

      selection.assign([1]);
      data[1] = replaced;
      selection.assign([5]);
      expect(selection.selected).to.be.empty;

      selection.invalidateIndex();
      selection.assign([5]);
      expect([...selection.selected]).to.eql([replaced]);
    });

    it('gives the pending selection the records that new data gives to its values', () => {
      const { host, selection } = confirming();

      selection.assign([1, 9]);
      select(selection, plovdiv);

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      selection.dataChanged();

      expect(selection.selected).to.eql([sofia, burgas]);
      expect(selection.pendingValue).to.eql([1, 9, 2]);
      expect(selection.has(burgas)).to.be.true;
    });

    it('keeps the pending records that a new data does not hold', () => {
      const { host, selection } = confirming();

      select(selection, burgas);
      host.data = cities.slice(0, 2);
      selection.invalidateIndex();
      selection.dataChanged();

      expect(selection.pendingValue).to.eql([9]);
      expect(selection.has(burgas)).to.be.true;
    });

    it('keeps a value that the pending selection dropped out of it when new data gives it a record', () => {
      const { host, selection } = confirming();

      selection.assign([1, 9]);
      selection.apply(selection.propose(9, 'deselection'));

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      selection.dataChanged();

      expect(selection.selected).to.eql([sofia, burgas]);
      expect(selection.pendingValue).to.eql([1]);
    });

    it('indexes only the new items of a data that starts with the same keys', () => {
      const { host, selection } = setup();
      const index = () => selection['_dataIndex'];
      const before = index();
      const positions = before.get(1);

      host.data = [...cities, burgas];
      selection.invalidateIndex();

      expect(index()).to.equal(before);
      expect(index().get(1)).to.equal(positions);
      expect(index().get(9)).to.eql([3]);
    });

    it('indexes all the items again when a key changes in place', () => {
      const moved: City = { ...sofia };
      const { host, selection } = setup({ data: [moved, plovdiv] });

      selection.assign([1]);
      moved.id = 3;
      host.data = [...host.data];
      selection.invalidateIndex();
      selection.assign([3]);

      expect(selection.selected).to.eql([moved]);
    });

    it('gives a value that a new valueKey merges its first record in data', () => {
      const twin: City = { id: 7, name: 'Sofia' };
      const { host, selection, state } = setup({
        data: [sofia, plovdiv, twin],
      });

      selection.assign([7, 1]);
      host.valueKey = 'name';
      selection.rekey();

      expect(selection.selected).to.eql([sofia]);
      selection.resync();
      expect(state.value).to.eql(['Sofia']);
    });

    it('indexes all the items again for a new valueKey', () => {
      const { host, selection } = setup();

      selection.assign([1]);
      host.valueKey = 'name';
      selection.rekey();
      selection.assign(['Plovdiv']);

      expect([...selection.selected]).to.eql([plovdiv]);
    });
  });

  describe('Version', () => {
    it('changes on each change of the selected or the pending records, and renders the host and the rows', () => {
      const { host, selection, state } = confirming();
      let version = selection.version;
      const expectChange = (step: string) => {
        expect(selection.version, step).not.to.equal(version);
        expect(state.onChange.called, step).to.be.true;
        expect(state.requestUpdate.called, step).to.be.true;
        ({ version } = selection);
        state.onChange.resetHistory();
        state.requestUpdate.resetHistory();
      };

      // The first read copies the committed records, so nothing changes.
      expect(selection.pendingValue).to.exist;
      expect(selection.version).to.equal(version);

      selection.assign([1, 9]);
      expectChange('assign');
      select(selection, plovdiv);
      expectChange('apply');
      selection.dataChanged();
      expectChange('dataChanged');
      selection.apply(selection.propose(undefined, 'selection'));
      expectChange('select all');
      selection.rekey();
      expectChange('rekey');
      selection.apply(selection.proposeCommit()!);
      expectChange('commit');
      selection.apply(selection.propose(undefined, 'deselection'));
      expectChange('deselect all');
      selection.dropPending();
      expectChange('dropPending');

      // A closed list has no pending selection to drop.
      host.open = false;
      expect(selection.pendingValue).to.be.undefined;
      selection.dropPending();
      expect(selection.version).to.equal(version);
    });

    it('drops the pending selection without a render when a read finds the list closed', () => {
      const { host, selection, state } = confirming();

      select(selection, sofia);
      const { version } = selection;
      state.onChange.resetHistory();
      state.requestUpdate.resetHistory();

      host.open = false;
      expect(selection.has(sofia)).to.be.false;

      expect(selection.version).not.to.equal(version);
      expect(state.onChange.called).to.be.false;
      expect(state.requestUpdate.called).to.be.false;
    });

    it('renders the host for a new text only', () => {
      const { selection, state } = setup();

      select(selection, sofia);
      state.requestUpdate.resetHistory();

      selection.project();
      selection.resync();
      expect(state.requestUpdate.called).to.be.false;
    });
  });
});
