import { expect } from '@open-wc/testing';
import { type SinonSpy, spy } from 'sinon';

import {
  type DataCity,
  dataCities,
  type FakeComboHost,
  fakeComboHost,
  recordName,
  remoteFiltering,
} from '#internals/testing/combo.spec.js';
import { ComboActiveOption } from './active-option.js';
import { DataState } from './data.js';

function setup(overrides: Partial<FakeComboHost> = {}) {
  const host = fakeComboHost(overrides);
  const state = new DataState<DataCity>(host);
  const onChange = spy();
  const active = new ComboActiveOption<DataCity>(host, state, onChange);

  /** One update of the combo: the records first, then the active option. */
  const update = (): void => {
    state.hostUpdate();
    active.hostUpdate();
  };

  const name = (): string | undefined =>
    active.record && recordName(active.record);

  update();
  return {
    host,
    state,
    active,
    onChange,
    update,
    name,
    requestUpdate: host.requestUpdate as SinonSpy,
  };
}

describe('Combo active option', () => {
  describe('Navigation intents', () => {
    it('has no active option at first and after the combo connects', () => {
      const { active } = setup();

      expect(active.active).to.equal(-1);

      active.set(2);
      active.hostConnected();

      expect(active.active).to.equal(-1);
    });

    it('steps over the group headers, which are no options', () => {
      // #Bulgaria, Sofia, Plovdiv, #France, Paris, #Germany, Berlin, Hamburg
      const { active, name } = setup({ groupKey: 'country' });

      expect(active.step(1)).to.be.true;
      expect(name()).to.equal('Sofia');

      active.step(1);
      active.step(1);
      expect(name()).to.equal('Paris');

      active.step(-1);
      expect(name()).to.equal('Plovdiv');
    });

    it('reports when no option comes in a direction', () => {
      const { active, name } = setup({ groupKey: 'country' });

      expect(active.step(-1)).to.be.false;
      expect(active.active).to.equal(-1);

      active.step(1);
      expect(active.step(-1)).to.be.false;
      expect(name()).to.equal('Sofia');

      active.last();
      expect(active.step(1)).to.be.false;
      expect(name()).to.equal('Hamburg');
    });

    it('makes the first option or the last record active', () => {
      const grouped = setup({ groupKey: 'country' });

      grouped.active.first();
      expect(grouped.name()).to.equal('Sofia');

      grouped.active.last();
      expect(grouped.name()).to.equal('Hamburg');

      const selectable = setup({ groupKey: 'country', groupSelection: true });

      selectable.active.first();
      expect(selectable.name()).to.equal('#Bulgaria');

      const remoteState = setup({
        filteringOptions: remoteFiltering,
        totalItemCount: 8,
      });

      remoteState.active.last();
      expect(remoteState.active.active).to.equal(7);
      expect(remoteState.name()).to.equal('placeholder');
    });

    it('requests a host update for a new index, and renders the rows on each write', () => {
      const { requestUpdate, active, onChange } = setup();
      requestUpdate.resetHistory();

      active.set(1);
      expect(requestUpdate.callCount).to.equal(1);
      expect(onChange.callCount).to.equal(1);

      active.set(1);
      expect(requestUpdate.callCount).to.equal(1);
      expect(onChange.callCount).to.equal(2);

      active.reset();
      expect(active.active).to.equal(-1);
      expect(requestUpdate.callCount).to.equal(2);
    });
  });

  describe('Record anchor', () => {
    it('follows its record to a new index, and reports the move once', () => {
      const { host, active, update, name } = setup();

      active.set(1);
      expect(name()).to.equal('Plovdiv');

      host.data = dataCities.map((city) => ({ ...city })).reverse();
      update();

      expect(name()).to.equal('Plovdiv');
      expect(active.active).to.equal(3);
      expect(active.moved).to.be.true;

      update();
      expect(active.moved).to.be.false;
    });

    it('has no active option when its record goes', () => {
      const { state, active, update } = setup();

      active.set(1);
      state.searchTerm = 'Paris';
      update();

      expect(active.active).to.equal(-1);
      expect(active.moved).to.be.false;
    });

    it('has no active option when a header stops being an option', () => {
      const { host, active, update, name } = setup({
        groupKey: 'country',
        groupSelection: true,
      });

      active.first();
      expect(name()).to.equal('#Bulgaria');

      host.groupSelection = false;
      update();

      expect(active.active).to.equal(-1);
    });

    it('keeps the active item when groupSelection changes', () => {
      const { host, active, update, name } = setup({ groupKey: 'country' });

      active.step(1);
      expect(name()).to.equal('Sofia');

      host.groupSelection = true;
      update();
      expect(name()).to.equal('Sofia');

      host.groupSelection = false;
      update();
      expect(name()).to.equal('Sofia');
    });

    it('keeps the active item when the select-all option shows or hides', () => {
      const { host, active, update, name } = setup({ showSelectAll: true });

      active.step(1);
      active.step(1);
      expect(name()).to.equal('Sofia');

      host.showSelectAll = false;
      update();

      expect(name()).to.equal('Sofia');
      expect(active.active).to.equal(0);

      host.showSelectAll = true;
      update();
      active.first();
      expect(name()).to.equal('select-all');

      host.showSelectAll = false;
      update();

      expect(active.active).to.equal(-1);
    });

    it('keeps an active placeholder in its place for the item that loads there', () => {
      const { host, active, update, name } = setup({
        filteringOptions: remoteFiltering,
        totalItemCount: 8,
      });
      const more = [
        { id: 6, name: 'Lyon', country: 'France' },
        { id: 7, name: 'Munich', country: 'Germany' },
      ];

      active.set(6);
      expect(name()).to.equal('placeholder');

      host.data = [...dataCities, ...more];
      update();

      expect(active.active).to.equal(6);
      expect(name()).to.equal('Munich');
    });
  });

  describe('Resets on close and mode change', () => {
    it('has no active option while the list is closed', () => {
      const { host, active, update } = setup();

      active.set(1);
      host.open = false;
      update();
      expect(active.active).to.equal(-1);

      active.set(2);
      update();
      expect(active.active).to.equal(-1);

      host.open = true;
      update();
      expect(active.active).to.equal(-1);
    });

    it('has no active option after singleSelect changes', () => {
      const single = setup({ singleSelect: true });

      single.active.set(1);
      single.update();
      expect(single.active.active).to.equal(1);

      single.host.singleSelect = false;
      single.update();
      expect(single.active.active).to.equal(-1);
    });
  });

  describe('Activation after a search', () => {
    it('makes the first option active in the next update, not the record it had', () => {
      // #France, Paris, #Germany, Berlin, Hamburg after the search.
      const { state, active, update, name } = setup({ groupKey: 'country' });

      active.last();
      expect(name()).to.equal('Hamburg');

      state.searchTerm = 'r';
      active.search();
      expect(name()).to.equal('Hamburg');

      update();
      expect(name()).to.equal('Paris');
    });

    it('requests the update, as a search without filtering changes no records', () => {
      const { requestUpdate, active, update } = setup();

      active.set(2);
      requestUpdate.resetHistory();

      active.search();
      expect(requestUpdate.calledOnce).to.be.true;

      update();
      expect(active.active).to.equal(0);
    });

    it('keeps a pending search over the intents before the update', () => {
      const { state, active, update, name } = setup();

      state.searchTerm = 'v';
      active.search();
      // On the old records. The search removes Sofia.
      active.step(1);
      expect(name()).to.equal('Sofia');

      update();

      expect(name()).to.equal('Plovdiv');
      expect(active.active).to.equal(0);

      active.search();
      active.reset();
      update();

      expect(active.active).to.equal(0);
    });

    it('has no active option after a search in remote mode', () => {
      const { active, update } = setup({ filteringOptions: remoteFiltering });

      active.search();
      active.set(2);
      update();

      expect(active.active).to.equal(-1);
    });

    it('drops a pending search when singleSelect changes', () => {
      const { host, active, update } = setup({ singleSelect: true });

      active.search();
      host.singleSelect = false;
      update();
      expect(active.active).to.equal(-1);

      update();
      expect(active.active).to.equal(-1);
    });

    it('drops a pending search when the list closes', () => {
      const { host, active, update } = setup();

      active.search();
      host.open = false;
      update();
      host.open = true;
      update();

      expect(active.active).to.equal(-1);
    });
  });
});
