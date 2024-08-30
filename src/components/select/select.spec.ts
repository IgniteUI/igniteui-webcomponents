import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import {
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  spaceBar,
  tabKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  FormAssociatedTestBed,
  checkValidationSlots,
  isFocused,
  simulateClick,
  simulateKeyboard,
  simulateScroll,
} from '../common/utils.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcSelectHeaderComponent from './select-header.js';
import type IgcSelectItemComponent from './select-item.js';
import IgcSelectComponent from './select.js';

type ItemState = {
  active?: boolean;
  disabled?: boolean;
  selected?: boolean;
};

type SelectSlots =
  | ''
  | 'prefix'
  | 'suffix'
  | 'header'
  | 'footer'
  | 'helper-text'
  | 'toggle-icon'
  | 'toggle-icon-expanded';

describe('Select', () => {
  before(() => defineComponents(IgcSelectComponent));

  let select: IgcSelectComponent;

  const getActiveItem = () => select.items.find((item) => item.active);

  const getInput = () =>
    select.shadowRoot!.querySelector(IgcInputComponent.tagName)!;

  const getSlot = (name: SelectSlots) => {
    return select.shadowRoot!.querySelector(
      `slot${name ? `[name=${name}]` : ':not([name])'}`
    ) as HTMLSlotElement;
  };

  const openSelect = async () => {
    await select.show();
  };

  const Items = [
    {
      value: 'spec',
      text: 'Specification',
      disabled: false,
    },
    {
      value: 'implementation',
      text: 'Implementation',
      disabled: false,
    },
    {
      value: 'testing',
      text: 'Testing',
      disabled: true,
    },
    {
      value: 'samples',
      text: 'Samples',
      disabled: false,
    },
    {
      value: 'documentation',
      text: 'Documentation',
      disabled: false,
    },
    {
      value: 'builds',
      text: 'Builds',
      disabled: true,
    },
  ];

  function checkItemState(item: IgcSelectItemComponent, state: ItemState) {
    for (const [key, value] of Object.entries(state)) {
      expect((item as any)[key]).to.equal(value);
    }
  }

  function createBasicSelect() {
    return html`
      <igc-select label="Select" name="select">
        ${Items.map(
          (item) =>
            html`<igc-select-item ?disabled=${item.disabled} value=${item.value}
              >${item.text}</igc-select-item
            >`
        )}
      </igc-select>
    `;
  }

  function createSlottedSelect() {
    return html`<igc-select label="Select">
      <igc-icon slot="prefix"></igc-icon>
      <igc-icon slot="suffix"></igc-icon>

      <igc-icon slot="toggle-icon" name="collapsed"></igc-icon>
      <igc-icon slot="toggle-icon-expanded" name="expanded"></igc-icon>

      <p slot="header">Header</p>
      <p slot="footer">Footer</p>

      <p slot="helper-text">Helper Text</p>

      <igc-select-item>1</igc-select-item>
      <igc-select-item>2</igc-select-item>
      <igc-select-item>3</igc-select-item>
    </igc-select>`;
  }

  function createSelectWithGroups() {
    return html`<igc-select label="Select">
      <igc-select-header>Tasks</igc-select-header>
      <igc-select-group>
        <span slot="label">Pre development</span>
        <igc-select-item>Specification</igc-select-item>
      </igc-select-group>
      <igc-select-group>
        <span slot="label">Development</span>
        <igc-select-item>Implementation</igc-select-item>
        <igc-select-item>Testing</igc-select-item>
      </igc-select-group>
      <igc-select-group>
        <span slot="label">Post development</span>
        <igc-select-item>Samples</igc-select-item>
        <igc-select-item>Documentation</igc-select-item>
        <igc-select-item>Builds</igc-select-item>
      </igc-select-group>
    </igc-select>`;
  }

  function createInitialSelectionValueOnly() {
    return html`
      <igc-select value="2">
        <igc-select-item>1</igc-select-item>
        <igc-select-item>2</igc-select-item>
        <igc-select-item>3</igc-select-item>
      </igc-select>
    `;
  }

  function createInitialMultipleSelection() {
    return html`
      <igc-select>
        <igc-select-item selected>1</igc-select-item>
        <igc-select-item selected>2</igc-select-item>
        <igc-select-item selected>3</igc-select-item>
      </igc-select>
    `;
  }

  function createInitialSelectionWithValueAndAttribute() {
    return html`
      <igc-select value="1">
        <igc-select-item>1</igc-select-item>
        <igc-select-item selected>2</igc-select-item>
        <igc-select-item selected>3</igc-select-item>
      </igc-select>
    `;
  }

  function createScrollableSelectParent() {
    return html`
      <div style="height: 1200px">
        <igc-select label="Select">
          ${Items.map(
            (item) =>
              html`<igc-select-item
                ?disabled=${item.disabled}
                value=${item.value}
                >${item.text}</igc-select-item
              >`
          )}
        </igc-select>
      </div>
    `;
  }

  describe('DOM', () => {
    describe('Default', () => {
      beforeEach(async () => {
        select = await fixture<IgcSelectComponent>(createBasicSelect());
      });

      it('is rendered correctly', async () => {
        expect(select).to.exist;
      });

      it('is accessible', async () => {
        // Closed state
        await expect(select).dom.to.be.accessible();
        await expect(select).shadowDom.to.be.accessible();

        select.open = true;
        await elementUpdated(select);

        // Open state
        await expect(select).dom.to.be.accessible();
        await expect(select).shadowDom.to.be.accessible();

        select.open = false;
        await elementUpdated(select);

        // Closed state again
        await expect(select).dom.to.be.accessible();
        await expect(select).shadowDom.to.be.accessible();
      });

      it('relevant props are passed to the underlying input', async () => {
        const props = {
          required: true,
          label: 'New Label',
          disabled: true,
          placeholder: 'Select placeholder',
          outlined: true,
        };

        const input = getInput();

        Object.assign(select, props);
        select.value = 'testing';
        await elementUpdated(select);

        for (const [prop, value] of Object.entries(props)) {
          expect((input as any)[prop]).to.equal(value);
        }
        expect(input.value).to.equal(select.selectedItem?.textContent);

        select.value = '123151';
        await elementUpdated(select);

        expect(input.value).to.be.empty;
      });
    });

    describe('Slotted content', () => {
      beforeEach(async () => {
        select = await fixture<IgcSelectComponent>(createSlottedSelect());
      });

      it('correctly projects elements', async () => {
        const slots: SelectSlots[] = [
          'header',
          'footer',
          'helper-text',
          'prefix',
          'suffix',
          'toggle-icon',
          'toggle-icon-expanded',
        ];

        for (const slot of slots) {
          expect(getSlot(slot).assignedElements()).not.to.be.empty;
        }
      });

      it('toggle-icon slots reflect open state', async () => {
        expect(getSlot('toggle-icon')).to.not.have.attribute('hidden');
        expect(getSlot('toggle-icon-expanded')).to.have.attribute('hidden');

        await openSelect();

        expect(getSlot('toggle-icon')).to.have.attribute('hidden');
        expect(getSlot('toggle-icon-expanded')).to.not.have.attribute('hidden');
      });
    });
  });

  describe('Autofocus', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(
        html`<igc-select autofocus></igc-select>`
      );
    });

    it('correctly applies autofocus on init', async () => {
      expect(document.activeElement).to.equal(select);
    });
  });

  describe('Scroll strategy', () => {
    let container: HTMLDivElement;

    beforeEach(async () => {
      container = await fixture(createScrollableSelectParent());
      select = container.querySelector(IgcSelectComponent.tagName)!;
    });

    it('`scroll` behavior', async () => {
      await openSelect();
      await simulateScroll(container, { top: 200 });

      expect(select.open).to.be.true;
    });

    it('`close` behavior', async () => {
      const eventSpy = spy(select, 'emitEvent');

      select.scrollStrategy = 'close';
      await openSelect();
      await simulateScroll(container, { top: 200 });

      expect(select.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.lastCall).calledWith('igcClosed');
    });

    it('`block behavior`', async () => {
      select.scrollStrategy = 'block';
      await openSelect();
      await simulateScroll(container, { top: 200 });

      expect(select.open).to.be.true;
    });
  });

  describe('Initial selection', () => {
    it('value only', async () => {
      select = await fixture(createInitialSelectionValueOnly());

      expect(select.selectedItem?.value).to.equal('2');
    });

    it('multiple items with selected attribute are coerced to the last one', async () => {
      select = await fixture(createInitialMultipleSelection());

      expect(select.selectedItem?.value).to.equal('3');
    });

    it('attribute takes precedence over value on first render', async () => {
      select = await fixture(createInitialSelectionWithValueAndAttribute());

      expect(select.selectedItem?.value).to.equal('3');
      expect(select.value).to.equal('3');
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(createBasicSelect());
    });

    it('`toggle()` controls the open state', async () => {
      await select.toggle();
      expect(select.open).to.be.true;

      await select.toggle();
      expect(select.open).to.be.false;
    });

    it('`items` returns the correct collection', async () => {
      expect(select.items.length).to.equal(Items.length);
    });

    it('`groups` returns the correct collection', async () => {
      expect(select.groups).to.be.empty;
    });

    it('`value` works', async () => {
      select.value = 'implementation';
      expect(select.selectedItem?.value).to.equal(select.value);

      select.value = 'testing';
      expect(select.selectedItem?.value).to.equal(select.value);
      checkItemState(select.selectedItem!, {
        active: true,
        disabled: true,
        selected: true,
      });

      select.value = '';
      expect(select.selectedItem).to.be.null;
    });

    it('`select()` works', async () => {
      // With value
      select.select('implementation');

      checkItemState(select.selectedItem!, { selected: true, active: true });
      expect(select.selectedItem?.value).to.equal('implementation');
      expect(select.value).to.equal(select.selectedItem?.value);
      select.clearSelection();

      // With index
      select.select(4);
      checkItemState(select.selectedItem!, { selected: true, active: true });
      expect(select.selectedItem?.value).to.equal(select.items[4].value);
      expect(select.value).to.equal(select.items[4].value);
      select.clearSelection();

      // Selecting a disabled item
      select.select('testing');
      checkItemState(select.selectedItem!, { selected: true });
      expect(select.selectedItem?.value).to.equal('testing');
      expect(select.value).to.equal('testing');

      // Trying to select non-existent index with selection present
      select.select(-1);
      expect(select.selectedItem).to.not.be.null;
      expect(select.value).to.equal('testing');

      // Trying to select non-existent value with selection present
      select.select('non-existent');
      expect(select.selectedItem).to.not.be.null;
      expect(select.value).to.equal('testing');

      // Non-existent index with no selection present
      select.clearSelection();
      select.select(-1);
      expect(select.items.every((item) => item.selected)).to.be.false;
      expect(select.selectedItem).to.be.null;
      expect(select.value).to.be.undefined;

      // Non-existent value with no selection present
      select.select('81313213');
      expect(select.items.every((item) => item.selected)).to.be.false;
      expect(select.selectedItem).to.be.null;
      expect(select.value).to.be.undefined;
    });

    it('`navigateTo() works`', async () => {
      // Non-existent
      for (const each of [-1, 100, 'Nope']) {
        select.navigateTo(each as any);
        expect(getActiveItem()).to.be.undefined;
      }

      // With value
      select.navigateTo('implementation');
      expect(getActiveItem()?.value).to.equal('implementation');

      // With index
      select.navigateTo(0);
      checkItemState(select.items[0], { active: true });

      // Only one active item
      expect(select.items.filter((item) => item.active).length).to.equal(1);
    });

    it('reports validity when required', async () => {
      const validity = spy(select, 'reportValidity');

      select.value = '';
      select.required = true;
      await elementUpdated(select);

      select.reportValidity();
      expect(validity).to.have.returned(false);
      expect(select.invalid).to.be.true;

      select.value = Items[0].value;
      select.reportValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });

    it('reports validity when not required', async () => {
      const validity = spy(select, 'reportValidity');

      select.value = '';
      select.required = false;
      await elementUpdated(select);

      select.reportValidity();
      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;

      select.value = Items[0].value;
      await elementUpdated(select);
      select.reportValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });

    it('checks validity when required', async () => {
      const validity = spy(select, 'checkValidity');

      select.value = '';
      select.required = true;
      await elementUpdated(select);

      select.checkValidity();
      expect(validity).to.have.returned(false);
      expect(select.invalid).to.be.true;

      select.value = Items[0].value;
      await elementUpdated(select);
      select.checkValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });

    it('checks validity when not required', async () => {
      const validity = spy(select, 'checkValidity');

      select.value = '';
      select.required = false;
      await elementUpdated(select);

      select.checkValidity();
      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;

      select.value = Items[0].value;
      await elementUpdated(select);
      select.checkValidity();

      expect(validity).to.have.returned(true);
      expect(select.invalid).to.be.false;
    });

    it('`focus()`', async () => {
      select.focus();
      expect(document.activeElement).to.equal(select);
      expect(select.shadowRoot?.activeElement).to.equal(getInput());
    });

    it('`blur()`', async () => {
      select.focus();

      select.blur();
      expect(document.activeElement).to.not.equal(select);
      expect(select.shadowRoot?.activeElement).to.be.null;
    });
  });

  describe('Groups', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(createSelectWithGroups());
    });

    it('has correct collections', async () => {
      expect(select.items.length).to.equal(6);
      expect(select.groups.length).to.equal(3);
    });

    it('clicking on a header is a no-op', async () => {
      await openSelect();

      simulateClick(select.querySelector(IgcSelectHeaderComponent.tagName)!);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(select.selectedItem).to.be.null;
    });

    it('clicking on a group is a no-op', async () => {
      await openSelect();

      for (const group of select.groups) {
        simulateClick(group);
        await elementUpdated(select);

        expect(select.open).to.be.true;
        expect(select.selectedItem).to.be.null;
      }
    });

    it('group disabled state', async () => {
      const group = select.groups[0];

      group.disabled = true;
      await elementUpdated(select);
      checkItemState(select.items[0], { disabled: true });

      simulateKeyboard(select, arrowDown);
      await elementUpdated(select);

      checkItemState(select.items[1], { selected: true });
      expect(select.selectedItem?.value).to.equal('Implementation');

      group.disabled = false;
      await elementUpdated(select);

      checkItemState(select.items[0], { disabled: false });

      simulateKeyboard(select, arrowUp);
      await elementUpdated(select);

      checkItemState(select.items[0], { selected: true });
      expect(select.selectedItem?.value).to.equal('Specification');
    });

    it('keyboard navigation works (open)', async () => {
      await openSelect();

      for (const item of select.items) {
        simulateKeyboard(select, arrowDown);
        await elementUpdated(select);

        checkItemState(item, { active: true });
      }
    });

    it('keyboard selection works (closed)', async () => {
      const eventSpy = spy(select, 'emitEvent');

      for (const item of select.items) {
        simulateKeyboard(select, arrowDown);
        await elementUpdated(select);

        expect(eventSpy).calledWith('igcChange', { detail: item });
        checkItemState(item, { selected: true });
      }
    });
  });

  describe('User interactions', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(createBasicSelect());
    });

    it('toggles open state on click', async () => {
      simulateClick(getInput());
      await elementUpdated(select);

      expect(select.open).to.be.true;

      simulateClick(getInput());
      await elementUpdated(select);

      expect(select.open).to.be.false;
    });

    it('toggles open state on Enter keys', async () => {
      simulateKeyboard(select, enterKey);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(select.selectedItem).to.be.null;

      simulateKeyboard(select, enterKey);
      await elementUpdated(select);

      expect(select.open).to.be.false;
      expect(select.selectedItem).to.be.null;
    });

    it('does not toggle open state on Spacebar key', async () => {
      simulateKeyboard(select, spaceBar);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(select.selectedItem).to.be.null;

      simulateKeyboard(select, spaceBar);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(select.selectedItem).to.be.null;
    });

    it('selects an item and closes the dropdown', async () => {
      const targetItem = select.items[4];

      await openSelect();

      simulateClick(targetItem);
      await elementUpdated(select);

      checkItemState(targetItem, { active: true, selected: true });
      expect(select.selectedItem).to.equal(targetItem);
      expect(select.value).to.equal(targetItem.value);
      expect(select.open).to.be.false;
    });

    it('selects an item on click and does not close when keep-open-on-select is set', async () => {
      const targetItem = select.items[4];

      select.keepOpenOnSelect = true;
      await openSelect();

      simulateClick(targetItem);
      await elementUpdated(select);
      checkItemState(targetItem, { active: true, selected: true });
      expect(select.selectedItem).to.equal(targetItem);
      expect(select.value).to.equal(targetItem.value);
      expect(select.open).to.be.true;
    });

    it('clicking on a disabled item is a no-op', async () => {
      const targetItem = select.items[4];
      const initialValue = select.value;

      targetItem.disabled = true;
      await openSelect();

      simulateClick(targetItem);
      await elementUpdated(select);

      checkItemState(targetItem, {
        active: false,
        selected: false,
        disabled: true,
      });
      expect(select.selectedItem).to.be.null;
      expect(select.value).to.equal(initialValue);
      expect(select.open).to.be.true;
    });

    it('clicking outside of the igc-select DOM tree closes the dropdown', async () => {
      await openSelect();

      simulateClick(document.body);
      await elementUpdated(select);

      expect(select.open).to.be.false;
    });

    it('clicking outside of the igc-select DOM tree with keep-open-on-outside-click', async () => {
      select.keepOpenOnOutsideClick = true;
      await openSelect();

      simulateClick(document.body);
      await elementUpdated(select);

      expect(select.open).to.be.true;
    });

    it('pressing Escape closes the dropdown without selection', async () => {
      await openSelect();

      simulateKeyboard(select, arrowDown, 4);
      simulateKeyboard(select, escapeKey);
      await elementUpdated(select);

      checkItemState(select.items[4], { active: true, selected: false });
      expect(select.selectedItem).to.be.null;
      expect(select.value).to.be.undefined;
      expect(select.open).to.be.false;
    });

    it('pressing Enter selects the active item and closes the dropdown', async () => {
      await openSelect();

      simulateKeyboard(select, arrowDown, 4);
      simulateKeyboard(select, enterKey);
      await elementUpdated(select);

      const item = select.items[4];

      checkItemState(item, { active: true, selected: true });
      expect(select.selectedItem).to.equal(item);
      expect(select.value).to.equal(item.value);
      expect(select.open).to.be.false;
    });

    it('pressing Enter selects the active item and does not close the dropdown with keep-open-on-select', async () => {
      select.keepOpenOnSelect = true;
      await openSelect();

      simulateKeyboard(select, arrowDown, 4);
      simulateKeyboard(select, enterKey);
      await elementUpdated(select);

      const item = select.items[4];

      checkItemState(item, { active: true, selected: true });
      expect(select.selectedItem).to.equal(item);
      expect(select.value).to.equal(item.value);
      expect(select.open).to.be.true;
    });

    it('pressing Tab selects the active item and closes the dropdown', async () => {
      await openSelect();

      simulateKeyboard(select, arrowDown, 4);
      simulateKeyboard(select, tabKey);
      await elementUpdated(select);

      const item = select.items[4];

      checkItemState(item, { active: true, selected: true });
      expect(select.selectedItem).to.equal(item);
      expect(select.value).to.equal(item.value);
      expect(select.open).to.be.false;
    });

    it('pressing Tab selects the active item and closes the dropdown regardless of keep-open-on-select', async () => {
      select.keepOpenOnSelect = true;
      await openSelect();

      simulateKeyboard(select, arrowDown, 4);
      simulateKeyboard(select, tabKey);
      await elementUpdated(select);

      const item = select.items[4];

      checkItemState(item, { active: true, selected: true });
      expect(select.selectedItem).to.equal(item);
      expect(select.value).to.equal(item.value);
      expect(select.open).to.be.false;
    });

    it('pressing Tab while the active item is the current selected item moves focus back to the component', async () => {
      select.value = 'spec';
      await openSelect();

      simulateKeyboard(select, tabKey);
      await elementUpdated(select);

      const item = select.items[0];

      checkItemState(item, { active: true, selected: true });
      expect(select.selectedItem).to.equal(item);
      expect(select.value).to.equal(item.value);
      expect(select.open).to.be.false;
      expect(isFocused(select)).to.be.true;
    });

    // Search selection

    it('does not select disabled items when searching (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');

      simulateKeyboard(select, 'tes'.split(''));
      await elementUpdated(select);

      const item = select.items[2];
      expect(eventSpy).not.calledWith('igcChange', { detail: item });

      checkItemState(item, { active: false, selected: false });
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
    });

    it('does not activates disabled items when searching (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      await openSelect();

      simulateKeyboard(select, 'tes'.split(''));
      await elementUpdated(select);

      const item = select.items[2];
      expect(eventSpy).not.calledWith('igcChange', { detail: item });

      checkItemState(item, { active: false, selected: false });
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
    });

    it('resumes search after default timeout', async () => {
      simulateKeyboard(select, 'null'.split(''));
      await elementUpdated(select);

      expect(select.selectedItem).to.be.null;

      await aTimeout(501);
      simulateKeyboard(select, 'impl'.split(''));
      await elementUpdated(select);

      expect(select.selectedItem?.value).to.equal('implementation');
    });

    it('activates the correct item when searching with character keys (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      await openSelect();

      simulateKeyboard(select, 'doc'.split(''));
      await elementUpdated(select);

      const item = select.items.at(-2)!;
      expect(eventSpy).not.calledWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: false });
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
      expect(select.open).to.be.true;
    });

    it('selects the correct item when searching (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');

      simulateKeyboard(select, 'doc'.split(''));
      await elementUpdated(select);

      const item = select.items.at(-2)!;
      expect(eventSpy).calledWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: true });
      expect(select.value).to.equal(item.value);
      expect(select.selectedItem).to.equal(item);
      expect(select.open).to.be.false;
    });

    // Navigation

    it('opens dropdown on Alt + ArrowDown', async () => {
      simulateKeyboard(select, [altKey, arrowDown]);
      await elementUpdated(select);

      expect(select.open).to.be.true;
    });

    it('closes dropdown on Alt + ArrowUp', async () => {
      await openSelect();

      simulateKeyboard(select, [altKey, arrowUp]);
      await elementUpdated(select);

      expect(select.open).to.be.false;
    });

    it('Home key (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');

      simulateKeyboard(select, homeKey);
      await elementUpdated(select);

      const item = select.items[0];
      expect(eventSpy).calledOnceWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: true });
      expect(select.value).to.equal(item.value);
      expect(select.selectedItem).to.equal(item);
      expect(select.open).to.be.false;
    });

    it('Home key (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      await openSelect();

      simulateKeyboard(select, homeKey);
      await elementUpdated(select);

      const item = select.items[0];
      expect(eventSpy).not.calledWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: false });
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
      expect(select.open).to.be.true;
    });

    it('End key (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');

      simulateKeyboard(select, endKey);
      await elementUpdated(select);

      const item = select.items.at(-2)!;
      expect(eventSpy).calledOnceWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: true });
      expect(select.value).to.equal(item.value);
      expect(select.selectedItem).to.equal(item);
      expect(select.open).to.be.false;
    });

    it('End key (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      await openSelect();

      simulateKeyboard(select, endKey);
      await elementUpdated(select);

      const item = select.items.at(-2)!;
      expect(eventSpy).not.calledWith('igcChange', { detail: item });

      checkItemState(item, { active: true, selected: false });
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
      expect(select.open).to.be.true;
    });

    it('ArrowDown (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      const activeItems = Items.filter((item) => !item.disabled);
      const { value: lastValue } = activeItems.at(-1)!;

      // navigate through active items
      for (const { value } of activeItems) {
        simulateKeyboard(select, arrowDown);
        await elementUpdated(select);

        expect(eventSpy).calledWith('igcChange', { detail: getActiveItem() });
        expect(getActiveItem()?.value).to.equal(value);
        expect(select.value).to.equal(value);
        expect(select.selectedItem).to.equal(getActiveItem());
      }

      // out-of-bounds
      simulateKeyboard(select, arrowDown);
      await elementUpdated(select);

      expect(eventSpy.callCount).to.equal(activeItems.length);
      expect(getActiveItem()?.value).to.equal(lastValue);
      expect(select.value).to.equal(lastValue);
      expect(select.selectedItem?.value).to.equal(lastValue);
    });

    it('ArrowDown (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      const activeItems = Items.filter((item) => !item.disabled);
      await openSelect();

      // navigate through active items
      for (const { value } of activeItems) {
        simulateKeyboard(select, arrowDown);
        await elementUpdated(select);

        expect(eventSpy).not.calledWith('igChange');
        expect(getActiveItem()?.value).to.equal(value);
        expect(select.value).to.be.undefined;
        expect(select.selectedItem).to.be.null;
      }

      // out-of-bounds - do not move active state
      simulateKeyboard(select, arrowDown);
      await elementUpdated(select);

      expect(eventSpy).not.calledWith('igChange');
      expect(getActiveItem()?.value).to.equal(activeItems.at(-1)?.value);
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
    });

    it('ArrowUp (closed state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      const activeItems = Items.filter((item) => !item.disabled).reverse();
      const { value: lastValue } = activeItems.at(-1)!;

      select.navigateTo('builds');

      // navigate through active items
      for (const { value } of activeItems) {
        simulateKeyboard(select, arrowUp);
        await elementUpdated(select);

        expect(eventSpy).calledWith('igcChange', { detail: getActiveItem() });
        expect(getActiveItem()?.value).to.equal(value);
        expect(select.value).to.equal(value);
        expect(select.selectedItem).to.equal(getActiveItem());
      }

      // out-of-bounds
      simulateKeyboard(select, arrowUp);
      await elementUpdated(select);

      expect(eventSpy.callCount).to.equal(activeItems.length);
      expect(getActiveItem()?.value).to.equal(lastValue);
      expect(select.value).to.equal(lastValue);
      expect(select.selectedItem?.value).to.equal(lastValue);
    });

    it('ArrowUp (open state)', async () => {
      const eventSpy = spy(select, 'emitEvent');
      const activeItems = Items.filter((item) => !item.disabled).reverse();
      await openSelect();

      select.navigateTo('builds');

      // navigate through active items
      for (const { value } of activeItems) {
        simulateKeyboard(select, arrowUp);
        await elementUpdated(select);

        expect(eventSpy).not.calledWith('igChange');
        expect(getActiveItem()?.value).to.equal(value);
        expect(select.value).to.be.undefined;
        expect(select.selectedItem).to.be.null;
      }

      // out-of-bounds - do not move active state
      simulateKeyboard(select, arrowUp);
      await elementUpdated(select);

      expect(eventSpy).not.calledWith('igChange');
      expect(getActiveItem()?.value).to.equal(activeItems.at(-1)?.value);
      expect(select.value).to.be.undefined;
      expect(select.selectedItem).to.be.null;
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(createBasicSelect());
    });

    it('correct sequence of events', async () => {
      const eventSpy = spy(select, 'emitEvent');

      simulateClick(getInput());
      await elementUpdated(select);

      expect(eventSpy.firstCall).calledWith('igcOpening');
      expect(eventSpy.secondCall).calledWith('igcOpened');

      eventSpy.resetHistory();

      simulateClick(select.items[0]);
      await elementUpdated(select);

      expect(eventSpy.firstCall).calledWith('igcChange', {
        detail: select.items[0],
      });
      expect(eventSpy.secondCall).calledWith('igcClosing');
      expect(eventSpy.thirdCall).calledWith('igcClosed');
    });

    it('does not emit events on API calls', async () => {
      const eventSpy = spy(select, 'emitEvent');

      await openSelect();
      expect(eventSpy).not.to.be.called;

      await select.hide();
      expect(eventSpy).not.to.be.called;

      select.select('testing');
      expect(eventSpy).not.to.be.called;
    });

    it('can halt opening event sequence', async () => {
      const eventSpy = spy(select, 'emitEvent');
      select.addEventListener('igcOpening', (e) => e.preventDefault(), {
        once: true,
      });

      simulateClick(getInput());
      await elementUpdated(select);

      expect(select.open).to.be.false;
      expect(eventSpy.firstCall).calledWith('igcOpening');
      expect(eventSpy.secondCall).to.be.null;
    });

    it('can halt closing event sequence', async () => {
      const eventSpy = spy(select, 'emitEvent');
      select.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      // No selection
      await openSelect();

      simulateKeyboard(select, escapeKey);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).to.be.null;

      eventSpy.resetHistory();

      // With selection
      select.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      await openSelect();

      simulateKeyboard(select, arrowDown, 2);
      simulateKeyboard(select, enterKey);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcChange');
      expect(eventSpy.secondCall).calledWith('igcClosing');
      expect(eventSpy.thirdCall).to.be.null;
    });

    it('can halt closing event sequence on outside click', async () => {
      const eventSpy = spy(select, 'emitEvent');
      select.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      await openSelect();

      simulateClick(document.body);
      await elementUpdated(select);

      expect(select.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).to.be.null;
    });
  });

  describe('issue-1123', () => {
    beforeEach(async () => {
      select = await fixture<IgcSelectComponent>(html`
        <igc-select>
          <igc-select-item value="Orange"
            ><span id="click-target">Orange</span></igc-select-item
          >
          <igc-select-item value="Apple"><span>Apple</span></igc-select-item>
          <igc-select-item value="Banana">Banana</igc-select-item>
          <igc-select-item value="Mango">Mango</igc-select-item>
        </igc-select>
      `);
    });

    it('', async () => {
      await openSelect();

      const inner = document.getElementById('click-target')!;
      simulateClick(inner);
      await elementUpdated(select);

      expect(select.value).to.equal('Orange');
    });
  });

  describe('Form integration', () => {
    const spec = new FormAssociatedTestBed<IgcSelectComponent>(
      createBasicSelect()
    );

    beforeEach(async () => {
      await spec.setup(IgcSelectComponent.tagName);
    });

    it('is form associated', async () => {
      expect(spec.element.form).to.equal(spec.form);
    });

    it('is not associated on submit if not value is present', async () => {
      expect(spec.submit()?.get(spec.element.name)).to.be.null;
    });

    it('is associated on submit', async () => {
      spec.element.value = 'spec';

      expect(spec.submit()?.get(spec.element.name)).to.equal(
        spec.element.value
      );
    });

    it('is correctly reset on form reset', async () => {
      spec.element.value = 'spec';

      spec.reset();
      expect(spec.element.value).to.equal(undefined);
    });

    it('is correctly reset of form reset with selection through attribute on item', async () => {
      const bed = new FormAssociatedTestBed<IgcSelectComponent>(
        html`<igc-select name="with-item-selection">
          <igc-select-item value="1">1</igc-select-item>
          <igc-select-item value="2">2</igc-select-item>
          <igc-select-item value="3" selected>3</igc-select-item>
        </igc-select>`
      );

      await bed.setup(IgcSelectComponent.tagName);

      expect(bed.element.value).to.eq('3');

      bed.element.value = '1';
      expect(bed.element.value).to.eq('1');

      bed.reset();
      expect(bed.element.value).to.eq('3');
    });

    it('reflects disabled ancestor state', async () => {
      spec.setAncestorDisabledState(true);
      expect(spec.element.disabled).to.be.true;

      spec.setAncestorDisabledState(false);
      expect(spec.element.disabled).to.be.false;
    });

    it('fulfils required constraint', async () => {
      spec.element.required = true;
      await elementUpdated(spec.element);
      spec.submitFails();

      spec.element.value = 'spec';
      await elementUpdated(spec.element);
      spec.submitValidates();
    });

    it('fulfils custom constraint', async () => {
      spec.element.setCustomValidity('invalid');
      spec.submitFails();

      spec.element.setCustomValidity('');
      spec.submitValidates();
    });
  });

  describe('Validation message slots', () => {
    let select: IgcSelectComponent;

    async function createFixture(template: TemplateResult) {
      select = await fixture<IgcSelectComponent>(template);
    }

    it('renders value-missing slot', async () => {
      await createFixture(html`
        <igc-select required>
          <div slot="value-missing"></div>
        </igc-select>
      `);

      await checkValidationSlots(select, 'valueMissing');
    });

    it('renders invalid slot', async () => {
      await createFixture(html`
        <igc-select required>
          <div slot="invalid"></div>
        </igc-select>
      `);

      await checkValidationSlots(select, 'invalid');
    });

    it('renders custom-error slot', async () => {
      await createFixture(html`
        <igc-select>
          <div slot="custom-error"></div>
        </igc-select>
      `);

      select.setCustomValidity('invalid');
      await checkValidationSlots(select, 'customError');
    });
  });
});
