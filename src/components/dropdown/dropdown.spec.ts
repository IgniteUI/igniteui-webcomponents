import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { spy } from 'sinon';

import IgcDropdownHeaderComponent from './dropdown-header.js';
import type IgcDropdownItemComponent from './dropdown-item.js';
import IgcDropdownComponent from './dropdown.js';
import IgcButtonComponent from '../button/button.js';
import {
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  tabKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';

type ItemState = {
  active?: boolean;
  disabled?: boolean;
  selected?: boolean;
};

describe('Dropdown', () => {
  before(() => defineComponents(IgcDropdownComponent, IgcButtonComponent));

  let dropDown: IgcDropdownComponent;
  const Items = [
    'Specification',
    'Implementation',
    'Testing',
    'Samples',
    'Documentation',
    'Builds',
  ];

  const getTarget = () =>
    dropDown.querySelector('[slot="target"]') as IgcButtonComponent;
  const getActiveItem = () => dropDown.items.find((item) => item.active);
  const getHeaders = () =>
    Array.from(
      dropDown.querySelectorAll<IgcDropdownHeaderComponent>(
        IgcDropdownHeaderComponent.tagName
      )
    );

  function checkItemState(item: IgcDropdownItemComponent, state: ItemState) {
    for (const [key, value] of Object.entries(state)) {
      expect((item as any)[key]).to.equal(value);
    }
  }

  function createBasicDropdown(isOpen = false) {
    return html`<igc-dropdown ?open=${isOpen}>
      <igc-button slot="target">Open</igc-button>
      ${Items.map(
        (item) =>
          html`<igc-dropdown-item value=${item}>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>`;
  }

  function createAdvancedDropdown(isOpen = false) {
    return html`
      <igc-dropdown ?open=${isOpen}>
        <igc-button slot="target">Open</igc-button>
        <igc-dropdown-header>Tasks</igc-dropdown-header>
        <igc-dropdown-group>
          <span slot="label">Pre development</span>
          <igc-dropdown-item>Specification</igc-dropdown-item>
        </igc-dropdown-group>
        <igc-dropdown-group>
          <span slot="label">Development</span>
          <igc-dropdown-item>Implementation</igc-dropdown-item>
          <igc-dropdown-item>Testing</igc-dropdown-item>
        </igc-dropdown-group>
        <igc-dropdown-group>
          <span slot="label">Post development</span>
          <igc-dropdown-item>Samples</igc-dropdown-item>
          <igc-dropdown-item>Documentation</igc-dropdown-item>
          <igc-dropdown-item>Builds</igc-dropdown-item>
        </igc-dropdown-group>
      </igc-dropdown>
    `;
  }

  describe('DOM', () => {
    beforeEach(async () => {
      dropDown = await fixture<IgcDropdownComponent>(createBasicDropdown());
    });

    it('is rendered correctly', async () => {
      expect(dropDown).to.exist;
    });

    it('is accessible', async () => {
      // Closed state
      await expect(dropDown).dom.to.be.accessible();
      await expect(dropDown).shadowDom.to.be.accessible();

      dropDown.open = true;
      await elementUpdated(dropDown);

      // Open state
      await expect(dropDown).dom.to.be.accessible();
      await expect(dropDown).shadowDom.to.be.accessible();

      dropDown.open = false;
      await elementUpdated(dropDown);

      // Closed state again
      await expect(dropDown).dom.to.be.accessible();
      await expect(dropDown).shadowDom.to.be.accessible();
    });
  });

  describe('Initial selection', () => {
    it('multiple initially selected items', async () => {
      dropDown = await fixture<IgcDropdownComponent>(html`
        <igc-dropdown>
          <igc-button slot="target">Open</igc-button>
          ${Items.map(
            (item) =>
              html`<igc-dropdown-item value=${item} selected
                >${item}</igc-dropdown-item
              >`
          )}
        </igc-dropdown>
      `);

      await elementUpdated(dropDown);
      expect(dropDown.items.filter((item) => item.selected).length).to.equal(1);
      expect(dropDown.selectedItem).to.equal(dropDown.items.at(-1)!);
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      dropDown = await fixture<IgcDropdownComponent>(createBasicDropdown());
    });

    it('`toggle()` controls open state', async () => {
      dropDown.toggle();
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;

      dropDown.toggle();
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
    });

    it('`items` returns the correct collection', async () => {
      expect(dropDown.items.length).to.equal(Items.length);
    });

    it('`groups` returns the correct collection', async () => {
      expect(dropDown.groups.length).to.equal(0);
    });

    it('`select()` works', async () => {
      // With value
      dropDown.select('Implementation');

      let item = dropDown.items.find((item) => item.value === 'Implementation');
      expect(dropDown.selectedItem).to.equal(item);
      checkItemState(item!, { selected: true, active: true });

      dropDown.clearSelection();
      item = dropDown.items[4];

      expect(dropDown.selectedItem).to.be.null;

      // With index
      dropDown.select(4);

      expect(dropDown.selectedItem).to.equal(item);
      checkItemState(item, { selected: true, active: true });

      // Non-existent

      dropDown.clearSelection();
      dropDown.select('Non-existent');

      expect(dropDown.selectedItem).to.be.null;
      checkItemState(item, { selected: false, active: true });
    });

    it('`navigateTo()` works', async () => {
      // Non-existent
      dropDown.navigateTo('Non-existent');
      expect(getActiveItem()).to.be.undefined;

      const item = dropDown.items.find(
        (item) => item.value === 'Implementation'
      )!;

      // With value
      dropDown.navigateTo('Implementation');
      checkItemState(item, { active: true });

      // With index
      dropDown.navigateTo(0);
      checkItemState(item, { active: false });
      checkItemState(getActiveItem()!, { active: true });
    });
  });

  describe('With groups and headers', () => {
    beforeEach(async () => {
      dropDown = await fixture<IgcDropdownComponent>(createAdvancedDropdown());
    });

    it('correct collections', async () => {
      expect(dropDown.items.length).to.equal(6);
      expect(dropDown.groups.length).to.equal(3);
    });

    it('keyboard navigation works', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 3);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[2], { active: true });
    });

    it('clicking on a header is a no-op', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(getHeaders()[0]);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
      expect(dropDown.selectedItem).to.be.null;
    });

    it('clicking on a group is a no-op', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      for (const each of dropDown.groups) {
        simulateClick(each);
        await elementUpdated(dropDown);
        expect(dropDown.open).to.be.true;
        expect(dropDown.selectedItem).to.be.null;
      }
    });
  });

  describe('User interactions', () => {
    beforeEach(async () => {
      dropDown = await fixture<IgcDropdownComponent>(createBasicDropdown());
    });

    it('toggles open state on click', async () => {
      const button = getTarget();

      button.click();
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;

      button.click();
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
    });

    it('selects an item on click and closes the dropdown', async () => {
      const targetItem = dropDown.items[3];

      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(targetItem);
      await elementUpdated(dropDown);

      checkItemState(targetItem, { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(targetItem.value);
      expect(dropDown.open).to.be.false;
    });

    it('selects an item on click and does not close when keep-open-on-select is set', async () => {
      const targetItem = dropDown.items[3];

      dropDown.keepOpenOnSelect = true;
      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(targetItem);
      await elementUpdated(dropDown);

      checkItemState(targetItem, { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(targetItem.value);
      expect(dropDown.open).to.be.true;
    });

    it('clicking on a disabled item is a no-op', async () => {
      const targetItem = dropDown.items[3];
      targetItem.disabled = true;

      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(targetItem);
      await elementUpdated(dropDown);

      checkItemState(targetItem, {
        active: false,
        selected: false,
        disabled: true,
      });
      expect(dropDown.selectedItem).to.be.null;
      expect(dropDown.open).to.be.true;
    });

    it('clicking outside of the dropdown DOM tree closes the dropdown', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(document.body);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
    });

    it('clicking outside of the dropdown DOM tree with keep-open-on-outside-click', async () => {
      dropDown.keepOpenOnOutsideClick = true;
      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(document.body);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
    });

    it('pressing Escape closes the dropdown without selection', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 4);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, escapeKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: false });
      expect(dropDown.selectedItem).to.be.null;
      expect(dropDown.open).to.be.false;
    });

    it('pressing Enter selects the active item and closes the dropdown', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 4);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, enterKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(dropDown.items[3].value);
      expect(dropDown.open).to.be.false;
    });

    it('pressing Enter selects the active item and does not close the dropdown with keep-open-on-select', async () => {
      dropDown.keepOpenOnSelect = true;
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 4);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, enterKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(dropDown.items[3].value);
      expect(dropDown.open).to.be.true;
    });

    it('pressing Tab selects the active item and closes the dropdown', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 4);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, tabKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(dropDown.items[3].value);
      expect(dropDown.open).to.be.false;
    });

    it('pressing Tab selects the active item and closes the dropdown regardless of keep-open-on-select', async () => {
      dropDown.keepOpenOnSelect = true;
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 4);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, tabKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: true });
      expect(dropDown.selectedItem?.value).to.equal(dropDown.items[3].value);
      expect(dropDown.open).to.be.false;
    });

    it('activates the first item on ArrowDown if no selection is present', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown);
      await elementUpdated(dropDown);

      expect(dropDown.items[0].active).to.be.true;
    });

    it('sets the active element to the currently selected one', async () => {
      dropDown.select(3);
      dropDown.show();
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[3], { active: true, selected: true });
    });

    it('moves only active state and not selection with arrow keys', async () => {
      dropDown.select(3);
      dropDown.show();
      await elementUpdated(dropDown);

      const [prev, current, next] = dropDown.items.slice(2, 5);

      checkItemState(current, { active: true, selected: true });

      simulateKeyboard(dropDown, arrowUp);
      await elementUpdated(dropDown);

      checkItemState(current, { active: false, selected: true });
      checkItemState(prev, { active: true, selected: false });

      simulateKeyboard(dropDown, arrowDown, 2);
      await elementUpdated(dropDown);

      checkItemState(current, { active: false, selected: true });
      checkItemState(next, { active: true, selected: false });
    });

    it('moves to first item with Home key', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, homeKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[0], { active: true });
    });

    it('moves to last item with End key', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, endKey);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items.at(-1)!, { active: true });
    });

    it('does not lose active state at start/end bounds', async () => {
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, homeKey);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowUp);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items[0], { active: true });

      simulateKeyboard(dropDown, endKey);
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown);
      await elementUpdated(dropDown);

      checkItemState(dropDown.items.at(-1)!, { active: true });
    });

    it('skips disabled items on keyboard navigation', async () => {
      const [first, second] = [dropDown.items[2], dropDown.items[4]];
      first.disabled = true;
      second.disabled = true;
      await elementUpdated(dropDown);

      dropDown.show();
      await elementUpdated(dropDown);

      for (let i = 0; i < 4; i++) {
        simulateKeyboard(dropDown, arrowDown);
        await elementUpdated(dropDown);
        expect([first, second]).not.to.include(getActiveItem());
      }
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      dropDown = await fixture<IgcDropdownComponent>(createBasicDropdown());
    });

    it('does not emit events on API calls', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');

      dropDown.show();
      await elementUpdated(dropDown);
      expect(eventSpy).not.to.be.called;

      dropDown.hide();
      await elementUpdated(dropDown);
      expect(eventSpy).not.to.be.called;

      dropDown.select('Testing');
      await elementUpdated(dropDown);
      expect(eventSpy).not.to.be.called;
    });

    it('emits correct order of events on opening', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');

      simulateClick(getTarget());
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcOpening');
      expect(eventSpy.secondCall).calledWith('igcOpened');
    });

    it('emits correct order of events on closing', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');

      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(getTarget());
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('emits correct order of events on selection', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');
      let targetItem = dropDown.items[3];

      // Selection through click
      dropDown.show();
      await elementUpdated(dropDown);

      simulateClick(targetItem);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
      expect(eventSpy.firstCall).calledWithExactly('igcChange', {
        detail: targetItem,
      });
      expect(eventSpy.secondCall).calledWith('igcClosing');
      expect(eventSpy.thirdCall).calledWith('igcClosed');

      eventSpy.resetHistory();

      // Selection through keyboard
      targetItem = dropDown.items[2];

      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowUp);
      simulateKeyboard(dropDown, enterKey);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
      expect(eventSpy.firstCall).calledWithExactly('igcChange', {
        detail: targetItem,
      });
      expect(eventSpy.secondCall).calledWith('igcClosing');
      expect(eventSpy.thirdCall).calledWith('igcClosed');
    });

    it('can halt opening event sequence', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');
      dropDown.addEventListener('igcOpening', (e) => e.preventDefault(), {
        once: true,
      });

      simulateClick(getTarget());
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcOpening');
      expect(eventSpy.secondCall).to.be.null;
    });

    it('can halt closing event sequence', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');
      dropDown.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      // No selection
      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, escapeKey);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).to.be.null;

      eventSpy.resetHistory();

      // With selection
      dropDown.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      dropDown.show();
      await elementUpdated(dropDown);

      simulateKeyboard(dropDown, arrowDown, 3);
      simulateKeyboard(dropDown, enterKey);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcChange');
      expect(eventSpy.secondCall).calledWith('igcClosing');
      expect(eventSpy.thirdCall).to.be.null;
    });

    it('can halt closing event sequence on outside click', async () => {
      const eventSpy = spy(dropDown, 'emitEvent');

      dropDown.show();
      await elementUpdated(dropDown);

      dropDown.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      simulateClick(document.body);
      await elementUpdated(dropDown);

      expect(dropDown.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).to.be.null;
    });
  });
});
