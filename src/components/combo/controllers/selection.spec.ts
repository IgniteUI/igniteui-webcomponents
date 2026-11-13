import { expect } from '@open-wc/testing';
import { spy } from 'sinon';

import type { ComboValue } from '../types.js';
import { ComboSelection, type ComboSelectionHost } from './selection.js';

type City = { id: number | null; name: string };

const cities: City[] = [
  { id: 1, name: 'Sofia' },
  { id: 2, name: 'Plovdiv' },
  { id: 3, name: 'Varna' },
];
const [sofia, plovdiv, varna] = cities;
/** A record that `data` does not hold, for example from a remote source. */
const burgas: City = { id: 9, name: 'Burgas' };

function setup(overrides: Partial<ComboSelectionHost<City>> = {}) {
  const host: ComboSelectionHost<City> = {
    data: cities,
    valueKey: 'id',
    displayKey: 'name',
    singleSelect: false,
    open: false,
    selectionCommit: 'immediate',
    ...overrides,
  };

  return { host, selection: new ComboSelection<City>(host) };
}

/** Opens the list in the confirm mode, so the selection has a pending part. */
function confirming(overrides: Partial<ComboSelectionHost<City>> = {}) {
  return setup({ open: true, selectionCommit: 'confirm', ...overrides });
}

/** The entries of a selection of `records`, keyed by `id`. */
function entriesOf(...records: City[]): Map<ComboValue<City>, City> {
  return new Map(records.map((record) => [record.id, record]));
}

describe('Combo selection', () => {
  describe('Values', () => {
    it('reads the value from valueKey, or uses the record', () => {
      const keyed = setup().selection;
      const plain = setup({ valueKey: undefined }).selection;

      expect(keyed.toValues([sofia])).to.eql([1]);
      expect(keyed.keyOf(sofia)).to.equal(1);
      expect(plain.toValues([sofia])[0]).to.equal(sofia);
      expect(plain.keyOf(sofia)).to.equal(sofia);
    });

    it('uses the record as the value of a nullish field, but not as its key', () => {
      const { selection } = setup();
      const unknown: City = { id: null, name: 'Unknown' };

      expect(selection.toValues([unknown])[0]).to.equal(unknown);
      expect(selection.keyOf(unknown)).to.be.null;
    });

    it('gives the values and the display text of the committed selection', () => {
      const { selection } = setup();

      selection.apply([varna, sofia], true);
      expect(selection.project()).to.eql({
        values: [3, 1],
        text: 'Varna, Sofia',
      });
    });

    it('keeps a value without a record in its place, only in multiple selection', () => {
      const { host, selection } = setup();

      selection.syncFromValue([9, 1]);
      expect(selection.project()).to.eql({ values: [9, 1], text: 'Sofia' });
      expect(selection.selected).to.eql([sofia]);
      expect(selection.hasRecords).to.be.true;

      host.singleSelect = true;
      expect(selection.project().values).to.eql([1]);

      selection.syncFromValue([9]);
      expect(selection.hasRecords).to.be.false;
    });

    it('gives the records their values again for a new valueKey', () => {
      const { host, selection } = confirming();

      selection.syncFromValue([1, 9]);
      selection.pending;
      host.valueKey = 'name';
      selection.rekey();

      expect(selection.project().values).to.eql(['Sofia', 9]);
      expect(selection.valuesOf(selection.pending!)).to.eql(['Sofia', 9]);
    });
  });

  describe('Resolve', () => {
    it('resolves values and objects to the records of data in data order, one time each', () => {
      const { selection } = setup();

      expect(selection.resolve([3, 1, { ...plovdiv }, 1])).to.eql([
        sofia,
        plovdiv,
        varna,
      ]);
      expect(selection.resolve([3])[0]).to.equal(varna);
    });

    it('takes the first record of a value that data repeats', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      expect(selection.resolve([1, copy])).to.have.ordered.members([sofia]);
    });

    it('puts the selected records and the objects that data does not hold last', () => {
      const { selection } = setup();
      const ruse: City = { id: 7, name: 'Ruse' };

      selection.apply([burgas], true);
      const resolved = selection.resolve([ruse, 9, 2, 42]);

      expect(resolved).to.eql([plovdiv, ruse, burgas]);
      expect(resolved[2]).to.equal(burgas);
    });

    it('prefers the pending record of a value to the committed one', () => {
      const { selection } = confirming();
      const newer: City = { ...burgas };

      selection.commit(entriesOf(burgas));
      selection.apply([burgas], false);
      selection.apply([newer], true);

      expect(selection.resolve([9])[0]).to.equal(newer);
    });
  });

  describe('Pending selection', () => {
    it('exists only while the list is open in the confirm mode of multiple selection', () => {
      expect(setup().selection.pending).to.be.undefined;
      expect(setup({ open: true }).selection.pending).to.be.undefined;
      expect(setup({ selectionCommit: 'confirm' }).selection.pending).to.be
        .undefined;
      expect(confirming({ singleSelect: true }).selection.pending).to.be
        .undefined;
      expect(confirming().selection.confirmMode).to.be.true;
    });

    it('starts as a copy of the committed selection on the first read', () => {
      const { selection } = confirming();

      selection.commit(entriesOf(sofia));
      const pending = selection.pending!;

      expect(selection.recordsOf(pending)).to.eql([sofia]);
      expect(selection.pending).to.equal(pending);
      expect(selection.has(sofia)).to.be.true;
    });

    it('takes the changes and leaves the committed selection as it is', () => {
      const { selection } = confirming();

      selection.commit(entriesOf(sofia));
      selection.apply([plovdiv], true);
      selection.apply([sofia], false);

      expect(selection.currentRecords()).to.eql([plovdiv]);
      expect(selection.selected).to.eql([sofia]);
    });

    it('is dropped when the list closes, or on request', () => {
      const { host, selection } = confirming();

      selection.apply([sofia], true);
      host.open = false;
      expect(selection.pending).to.be.undefined;

      host.open = true;
      expect([...selection.pending!]).to.be.empty;

      selection.apply([sofia], true);
      selection.dropPending();
      expect([...selection.pending!]).to.be.empty;
    });
  });

  describe('Changes', () => {
    it('previews the selected values first, then the new ones', () => {
      const { selection } = setup();

      selection.apply([varna], true);
      expect(selection.preview([sofia, varna], true)).to.eql([3, 1]);
      expect(selection.preview([varna], false)).to.eql([]);
    });

    it('previews only the new value in single selection', () => {
      const { selection } = setup({ singleSelect: true });

      selection.apply([varna], true);
      expect(selection.preview([sofia], true)).to.eql([1]);
    });

    it('selects all the records of data and keeps the selected records outside it', () => {
      const { selection } = setup();

      selection.apply([burgas], true);
      selection.selectAll();
      expect([...selection.selected]).to.eql([...cities, burgas]);
    });

    it('selects all into the pending selection, and keeps the values without a record after the records', () => {
      const { selection } = confirming();

      selection.syncFromValue([42]);
      selection.selectAll();
      expect(selection.recordsOf(selection.pending!)).to.eql(cities);
      expect(selection.valuesOf(selection.pending!)).to.eql([1, 2, 3, 42]);
      expect(selection.selected).to.be.empty;
    });

    it('gives a committed value without a record its record from a pending change, in place', () => {
      const { selection } = confirming();

      selection.syncFromValue([9, 1]);
      expect(selection.selected).to.eql([sofia]);

      expect(selection.apply([burgas], true)).to.be.true;
      expect(selection.selected).to.eql([burgas, sofia]);
      expect(selection.apply([plovdiv], true)).to.be.false;
    });

    it('gives a value without a record its record in place without a pending selection', () => {
      const { selection } = setup();

      selection.syncFromValue([9, 1]);
      expect(selection.apply([burgas], true)).to.be.false;
      expect(selection.project()).to.eql({
        values: [9, 1],
        text: 'Burgas, Sofia',
      });
    });

    it('keeps one record for each value, and shows the value as selected for each record', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      selection.apply([sofia, copy], true);
      expect(selection.selected).to.have.ordered.members([sofia]);
      expect(selection.has(copy)).to.be.true;

      selection.apply([copy], false);
      expect(selection.has(sofia)).to.be.false;
      expect(selection.has(undefined as unknown as City)).to.be.false;

      // Any record of the value selects its first record in data.
      selection.apply([copy], true);
      expect(selection.selected).to.have.ordered.members([sofia]);
    });

    it('forgets the named values without a record, or all of them', () => {
      const { selection } = setup();

      selection.syncFromValue([9, 1, 42, 43]);
      selection.forget([42, sofia]);
      expect(selection.project().values).to.eql([9, 1, 43]);

      selection.forget([]);
      expect(selection.project().values).to.eql([1]);
    });

    it('lists the records that the pending selection adds or removes, and commits it', () => {
      const { selection } = confirming();

      selection.commit(entriesOf(sofia, plovdiv));
      expect(selection.changes(selection.pending!)).to.be.empty;

      selection.apply([sofia], false);
      selection.apply([varna], true);

      const pending = selection.pending!;
      expect(selection.changes(pending)).to.eql([varna, sofia]);

      selection.commit(pending);
      expect(selection.selected).to.eql([plovdiv, varna]);

      // The commit copies the pending selection.
      selection.apply([sofia], true);
      expect(selection.selected).to.eql([plovdiv, varna]);
    });

    it('clears the committed selection', () => {
      const { selection } = setup();

      selection.apply([sofia], true);
      selection.clear();
      expect(selection.selected).to.be.empty;
    });
  });

  describe('Sync', () => {
    it('gives each value its first record and keeps the records outside data', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      selection.apply([burgas], true);
      selection.syncFromValue([1, 9, 42]);
      const [first, second, ...rest] = selection.selected;

      expect(first).to.equal(sofia);
      expect(second).to.equal(burgas);
      expect(rest).to.be.empty;
    });

    it('finds the records of data that grows in place', () => {
      const data = [sofia];
      const { selection } = setup({ data });

      selection.syncFromValue([2]);
      expect(selection.selected).to.be.empty;

      data.push(plovdiv);
      selection.syncFromValue([2]);
      expect([...selection.selected]).to.eql([plovdiv]);
    });

    it('finds a replaced record only after the index is invalidated', () => {
      const data = [sofia, plovdiv];
      const { selection } = setup({ data });
      const replaced: City = { id: 5, name: 'Pleven' };

      selection.syncFromValue([1]);
      data[1] = replaced;
      selection.syncFromValue([5]);
      expect(selection.selected).to.be.empty;

      selection.invalidateIndex();
      selection.syncFromValue([5]);
      expect([...selection.selected]).to.eql([replaced]);
    });

    it('gives the pending selection the records that new data gives to its values', () => {
      const { host, selection } = confirming();

      selection.syncFromValue([1, 9]);
      selection.apply([plovdiv], true);

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      selection.syncFromValue([1, 9]);
      selection.syncPending();

      expect(selection.selected).to.eql([sofia, burgas]);
      expect(selection.recordsOf(selection.pending!)).to.eql([
        sofia,
        burgas,
        plovdiv,
      ]);
    });

    it('keeps the pending records that a new data does not hold', () => {
      const { host, selection } = confirming();

      selection.apply([burgas], true);
      host.data = cities.slice(0, 2);
      selection.invalidateIndex();
      selection.syncPending();

      expect(selection.recordsOf(selection.pending!)).to.have.ordered.members([
        burgas,
      ]);
    });

    it('keeps a value that the pending selection dropped out of it when new data gives it a record', () => {
      const { host, selection } = confirming();

      selection.syncFromValue([1, 9]);
      selection.forget([9]);

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      selection.syncFromValue([1, 9]);
      selection.syncPending();

      expect(selection.selected).to.eql([sofia, burgas]);
      expect(selection.valuesOf(selection.pending!)).to.eql([1]);
    });

    it('indexes only the new items of a data that starts with the indexed items', () => {
      const { host, selection } = setup();
      const keys = spy(selection, 'keyOf');

      selection.syncFromValue([1]);
      expect(keys.callCount).to.equal(3);

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      selection.syncFromValue([9]);

      expect(keys.callCount).to.equal(4);
      expect([...selection.selected]).to.eql([burgas]);
    });

    it('indexes all the items again for a new valueKey', () => {
      const { host, selection } = setup();

      selection.syncFromValue([1]);
      host.valueKey = 'name';
      selection.rekey();
      selection.syncFromValue(['Plovdiv']);

      expect([...selection.selected]).to.eql([plovdiv]);
    });
  });

  describe('Version', () => {
    it('changes on each change of the selected or the pending records', () => {
      const { host, selection } = confirming();
      let version = selection.version;
      const expectChange = (step: string) => {
        expect(selection.version, step).not.to.equal(version);
        version = selection.version;
      };

      // The first read copies the committed records, so nothing changes.
      selection.pending;
      expect(selection.version).to.equal(version);

      selection.syncFromValue([1, 9]);
      expectChange('syncFromValue');
      selection.apply([plovdiv], true);
      expectChange('apply');
      selection.syncPending();
      expectChange('syncPending');
      selection.selectAll();
      expectChange('selectAll');
      selection.rekey();
      expectChange('rekey');
      selection.commit(selection.pending!);
      expectChange('commit');
      selection.clear();
      expectChange('clear');
      selection.dropPending();
      expectChange('dropPending');

      // A closed list has no pending selection to drop.
      host.open = false;
      selection.pending;
      selection.dropPending();
      expect(selection.version).to.equal(version);
    });
  });
});
