import { expect } from '@open-wc/testing';

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
    value: [],
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

    it('takes every record of a value that data repeats', () => {
      const copy = { ...sofia };
      const { selection } = setup({ data: [sofia, plovdiv, copy] });

      expect(selection.resolve([1])).to.eql([sofia, copy]);
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

      selection.commit(new Set([burgas]));
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

      selection.commit(new Set([sofia]));
      const pending = selection.pending!;

      expect(pending).not.to.equal(selection.selected);
      expect([...pending]).to.eql([sofia]);
      expect(selection.pending).to.equal(pending);
      expect(selection.current).to.equal(pending);
    });

    it('takes the changes and leaves the committed selection as it is', () => {
      const { selection } = confirming();

      selection.commit(new Set([sofia]));
      selection.apply([plovdiv], true);
      selection.apply([sofia], false);

      expect([...selection.current]).to.eql([plovdiv]);
      expect([...selection.selected]).to.eql([sofia]);
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

    it('selects all into the pending selection', () => {
      const { selection } = confirming();

      selection.selectAll();
      expect([...selection.pending!]).to.eql(cities);
      expect(selection.selected).to.be.empty;
    });

    it('gives the committed selection the records of values that had none', () => {
      const { selection } = confirming({ value: [1, 9] });

      selection.syncFromValue([1, 9]);
      expect([...selection.selected]).to.eql([sofia]);

      selection.apply([burgas], true);
      expect(selection.resolveValues([burgas])).to.be.true;
      expect([...selection.selected]).to.eql([sofia, burgas]);
      expect(selection.resolveValues([plovdiv])).to.be.false;
    });

    it('resolves values only while the list has a pending selection', () => {
      const { selection } = setup({ value: [1, 9] });

      selection.syncFromValue([1, 9]);
      expect(selection.resolveValues([burgas])).to.be.false;
      expect([...selection.selected]).to.eql([sofia]);
    });

    it('lists the records that the pending selection adds or removes, and commits it', () => {
      const { selection } = confirming();

      selection.commit(new Set([sofia, plovdiv]));
      expect(selection.changes(selection.pending!)).to.be.empty;

      selection.apply([sofia], false);
      selection.apply([varna], true);

      const pending = selection.pending!;
      expect(selection.changes(pending)).to.eql([varna, sofia]);

      selection.commit(pending);
      expect([...selection.selected]).to.eql([plovdiv, varna]);
      expect(selection.selected).not.to.equal(pending);
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
      const { host, selection } = confirming({ value: [1, 9] });

      selection.syncFromValue([1, 9]);
      selection.apply([plovdiv], true);

      host.data = [...cities, burgas];
      selection.invalidateIndex();
      const known = selection.knownValues();

      expect([...known!]).to.eql([1]);
      selection.syncFromValue(host.value);
      selection.syncPending(known);

      expect([...selection.selected]).to.eql([sofia, burgas]);
      expect([...selection.pending!]).to.eql([sofia, plovdiv, burgas]);
    });

    it('has no known values without a pending selection, or when every value has a record', () => {
      expect(setup({ value: [1, 9] }).selection.knownValues()).to.be.undefined;

      const { selection } = confirming({ value: [1] });
      selection.syncFromValue([1]);
      expect(selection.knownValues()).to.be.undefined;
    });
  });
});
