import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { range } from 'lit/directives/range.js';
import { spy } from 'sinon';
import {
  arrowLeft,
  arrowRight,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { isUnderPageLayer } from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateKeyboard,
} from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { preventDefault } from '#internals/utils/events.js';
import { configureTheme } from '#theming/config.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcTabComponent from './tab.js';
import IgcTabsComponent from './tabs.js';

describe('Tabs component', () => {
  function verifySelection(tabs: IgcTabsComponent, tab: IgcTabComponent) {
    const { selected } = getTabsDOM(tabs);
    const activeTab = tabs['_activeTab'];

    expect(firstOf(selected) === tab).to.be.true;
    expect(activeTab === tab).to.be.true;
    expect(getComputedStyle(getTabDOM(tab).body).display).to.equal('block');
  }

  before(() => {
    defineComponents(IgcTabComponent, IgcTabsComponent);
  });

  let element: IgcTabsComponent;

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`<igc-tabs></igc-tabs>`);
    });

    it('is initialized with the proper default values', async () => {
      expect(document.querySelector(IgcTabsComponent.tagName)).to.exist;
      expect(element.alignment).to.eq('start');
      expect(element.activation).to.eq('auto');
      expect(element.tabs).to.be.empty;
    });
  });

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1" disabled>Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
          <igc-tab id="third">
            <p slot="label">Tab 3</p>
            Content 3
          </igc-tab>
          <igc-tab><p slot="label">Tab 4</p></igc-tab>
        </igc-tabs>
      `);
    });

    // `aria-required-children` is a false positive: axe sees each panel nested in
    // the tablist, but the flat tree that browsers expose resolves the roles.
    it('is accessible', async () => {
      await expect(element).to.be.accessible({
        ignoredRules: ['aria-required-children'],
      });
      await expect(element).shadowDom.to.be.accessible({
        ignoredRules: ['aria-required-children'],
      });
    });

    it('renders the IgcTabComponents', () => {
      expect(element.tabs).lengthOf(4);
    });

    it('selects the first enabled tab when nothing else is specified', async () => {
      verifySelection(element, element.tabs[1]);
    });

    it('selects the tab with selected attribute in the template', async () => {
      const tabsComponent = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2" selected>Content 2</igc-tab>
          <igc-tab>
            <p slot="label">Tab 3</p>
            Content 34
          </igc-tab>
        </igc-tabs>
      `);

      verifySelection(tabsComponent, tabsComponent.tabs[1]);

      for (const tab of tabsComponent.tabs) {
        expect(getComputedStyle(getTabDOM(tab).body).display).to.equal(
          tab.selected ? 'block' : 'none'
        );
      }
    });

    it('selects a tab on mouse click if it is not disabled', async () => {
      simulateClick(getTabDOM(element.tabs[0]).header);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);

      simulateClick(getTabDOM(element.tabs[2]).header);
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);
    });

    it('`select` method selects the specified tab', async () => {
      element.select('third');
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);

      element.select(element.tabs[1]);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('`select` method does not change currently selected tab if the specified value does not exist.', async () => {
      element.select('test');
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('selects next/previous tab when pressing right/left arrow', async () => {
      const tabs = element.tabs;

      simulateClick(getTabDOM(tabs[1]).header);
      simulateKeyboard(getTabDOM(tabs[1]).header, arrowRight);
      await elementUpdated(element);

      verifySelection(element, tabs[2]);

      simulateKeyboard(getTabDOM(tabs[2]).header, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, tabs[1]);

      simulateKeyboard(getTabDOM(tabs[1]).header, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, tabs[3]);
    });

    it('selects next/previous tab when pressing right/left arrow (RTL)', async () => {
      const tabs = element.tabs;

      element.dir = 'rtl';
      tabs[1].focus();

      simulateKeyboard(getTabDOM(tabs[1]).header, arrowRight);
      await elementUpdated(element);

      verifySelection(element, tabs[3]);

      simulateKeyboard(getTabDOM(tabs[3]).header, arrowRight);
      await elementUpdated(element);

      verifySelection(element, tabs[2]);

      simulateKeyboard(getTabDOM(tabs[2]).header, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, tabs[3]);
    });

    it('selects first/last enabled tab when pressing home/end keys', async () => {
      const tabs = element.tabs;

      simulateKeyboard(getTabDOM(tabs[1]).header, endKey);
      await elementUpdated(element);

      verifySelection(element, tabs[3]);

      simulateKeyboard(getTabDOM(tabs[3]).header, homeKey);
      await elementUpdated(element);

      verifySelection(element, tabs[1]);
    });

    it('only focuses the corresponding tab when activation is manual and navigating with keyboard', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      simulateKeyboard(getTabDOM(element.tabs[1]).header, endKey);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
      expect(element.querySelectorAll(IgcTabComponent.tagName)[3]).to.equal(
        document.activeElement
      );
    });

    it('selects the focused tab when activation is set to `manual` and space/enter is pressed', async () => {
      const tabs = element.tabs;

      element.activation = 'manual';
      simulateKeyboard(getTabDOM(tabs[1]).header, endKey);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);

      simulateKeyboard(getTabDOM(tabs[3]).header, spaceBar);
      await elementUpdated(element);

      verifySelection(element, element.tabs[3]);

      simulateKeyboard(getTabDOM(tabs[3]).header, homeKey);
      await elementUpdated(element);

      verifySelection(element, element.tabs[3]);

      simulateKeyboard(getTabDOM(tabs[1]).header, enterKey);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('prevents the default action of the activation keys', async () => {
      // A tab header has no native activation, so Space would also scroll the
      // page. The shared helper dispatches non-cancelable events, so build one here.
      const activate = (key: string) => {
        const event = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
        });

        getTabDOM(element.tabs[2]).header.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(activate(spaceBar)).to.be.true;
      expect(activate(enterKey)).to.be.true;
    });

    it('selected indicator align with the selected tab', async () => {
      const { indicator } = getTabsDOM(element);
      let selected = getTabsDOM(element).selected;

      let offsetLeft = getTabDOM(firstOf(selected)).header.offsetLeft;
      expect(indicator.style.transform).to.equal(`translateX(${offsetLeft}px)`);
      expect(indicator.style.width).to.equal(
        `${getTabDOM(firstOf(selected)).header.offsetWidth}px`
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('third');
      await elementUpdated(element);

      selected = getTabsDOM(element).selected;
      verifySelection(element, element.tabs[2]);

      offsetLeft = getTabDOM(firstOf(selected)).header.offsetLeft;
      expect(indicator.style.transform).to.eq(`translateX(${offsetLeft}px)`);
      expect(indicator.style.width).to.eq(
        `${getTabDOM(firstOf(selected)).header.offsetWidth}px`
      );
    });

    it('places the selected indicator at the start when the page sets `text-align`', async () => {
      // The Bootstrap theme shows no indicator.
      configureTheme('material');

      try {
        const tabs = await fixture<IgcTabsComponent>(html`
          <igc-tabs style="width: 600px; text-align: center">
            <igc-tab label="One"></igc-tab>
            <igc-tab label="Two" selected></igc-tab>
          </igc-tabs>
        `);
        await elementUpdated(tabs);

        // The transform moves the indicator to its tab from this position.
        expect(getTabsDOM(tabs).indicator.offsetLeft).to.equal(0);
      } finally {
        configureTheme('bootstrap');
        await nextFrame();
      }
    });

    it('selected indicator align with the selected tab (RTL)', async () => {
      const { indicator, container } = getTabsDOM(element);

      element.dir = 'rtl';

      element.requestUpdate();
      await elementUpdated(element);

      let activeTabHeader = getTabDOM(
        firstOf(getTabsDOM(element).selected)
      ).header;
      let activeTabOffsetLeft = activeTabHeader.offsetLeft;
      let activeTabWidth = activeTabHeader.getBoundingClientRect().width;
      const scrollContainerWidth = container.getBoundingClientRect().width;

      expect(indicator.style.transform).to.equal(
        `translateX(${activeTabOffsetLeft - scrollContainerWidth + activeTabWidth}px)`
      );

      expect(indicator.style.width).to.equal(`${activeTabWidth}px`);

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('third');
      await elementUpdated(element);

      activeTabHeader = getTabDOM(firstOf(getTabsDOM(element).selected)).header;
      activeTabOffsetLeft = activeTabHeader.offsetLeft;
      activeTabWidth = activeTabHeader.getBoundingClientRect().width;

      expect(indicator.style.transform).to.eq(
        `translateX(${activeTabOffsetLeft - scrollContainerWidth + activeTabWidth}px)`
      );

      expect(indicator.style.width).to.eq(`${activeTabWidth}px`);
    });

    it('emits `igcChange` when selecting item via mouse click', async () => {
      const eventSpy = spy(element, 'emitEvent');

      simulateClick(getTabDOM(element.tabs[3]).header);
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: firstOf(getTabsDOM(element).selected),
      });
    });

    it('emits `igcChange` when selecting item via arrow key press', async () => {
      const eventSpy = spy(element, 'emitEvent');

      simulateKeyboard(getTabDOM(element.tabs[1]).header, arrowLeft);
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: firstOf(getTabsDOM(element).selected),
      });
    });

    it('does not change active tab when clicking inside the tab content', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const input = document.createElement('input');
      element.tabs[1].append(input);

      simulateClick(input);
      await elementUpdated(element);

      expect(eventSpy.callCount).to.equal(0);
      verifySelection(element, element.tabs[1]);
    });

    it('does not change active tab with keyboard interaction inside the tab content', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const input = document.createElement('input');
      element.tabs[1].append(input);

      simulateKeyboard(input, arrowLeft);
      await elementUpdated(element);

      expect(eventSpy.callCount).to.equal(0);
      verifySelection(element, element.tabs[1]);
    });

    it('aligns tab headers properly when `alignment` is set to justify', async () => {
      const { container } = getTabsDOM(element);

      element.alignment = 'justify';
      await elementUpdated(element);

      const expectedWidth = container.offsetWidth / element.tabs.length;

      const diff = element.tabs
        .map((tab) => getTabDOM(tab).header.offsetWidth - expectedWidth)
        .reduce((a, b) => a - b, 0);

      expect(diff).to.equal(0);
    });

    it('aligns tab headers properly when `alignment` is set to start', async () => {
      const { container } = getTabsDOM(element);
      const firstTabHeader = getTabDOM(firstOf(element.tabs)).header;
      const lastTabHeader = getTabDOM(lastOf(element.tabs)).header;

      const widths = element.tabs.map(
        (tab) => getTabDOM(tab).header.offsetWidth
      );

      const result = widths.reduce((a, b) => a + b, 0);
      const noTabsAreaWidth = container.offsetWidth - result;
      const offsetRight =
        container.offsetWidth -
        lastTabHeader.offsetLeft -
        lastTabHeader.offsetWidth;

      expect(firstTabHeader.offsetLeft).to.equal(0);
      expect(offsetRight - noTabsAreaWidth).to.equal(0);
      expect(Math.abs(90 - widths[0])).to.equal(0);
      expect(Math.abs(90 - widths[1])).to.equal(0);
      expect(Math.abs(90 - widths[2])).to.equal(0);
      expect(Math.abs(90 - widths[3])).to.equal(0);
    });

    it('gives every tab the same width when `alignment` is set to justify, whatever the labels', async () => {
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs alignment="justify" style="width: 600px">
          <igc-tab label="A">Content 1</igc-tab>
          <igc-tab label="A longer label">Content 2</igc-tab>
          <igc-tab label="Mid">Content 3</igc-tab>
          <igc-tab label="An even longer tab label">Content 4</igc-tab>
        </igc-tabs>
      `);
      await elementUpdated(tabs);

      const expectedWidth =
        getTabsDOM(tabs).container.offsetWidth / tabs.tabs.length;

      for (const tab of tabs.tabs) {
        expect(
          getTabDOM(tab).header.getBoundingClientRect().width
        ).to.be.closeTo(expectedWidth, 1);
      }
    });

    it('aligns tab headers properly when `alignment` is set to center', async () => {
      const { container } = getTabsDOM(element);
      const firstTabHeader = getTabDOM(firstOf(element.tabs)).header;
      const lastTabHeader = getTabDOM(lastOf(element.tabs)).header;

      element.alignment = 'center';
      await elementUpdated(element);

      const widths = element.tabs.map(
        (tab) => getTabDOM(tab).header.offsetWidth
      );

      const result = widths.reduce((a, b) => a + b, 0);
      const noTabsAreaWidth = container.offsetWidth - result;
      const offsetRight =
        container.offsetWidth -
        lastTabHeader.offsetLeft -
        lastTabHeader.offsetWidth;

      expect(
        Math.round(noTabsAreaWidth / 2) - firstTabHeader.offsetLeft
      ).to.equal(0);
      expect(offsetRight - firstTabHeader.offsetLeft).to.equal(0);
      expect(Math.abs(90 - widths[0])).to.equal(0);
      expect(Math.abs(90 - widths[1])).to.equal(0);
      expect(Math.abs(90 - widths[2])).to.equal(0);
      expect(Math.abs(90 - widths[3])).to.equal(0);
    });

    it('updates selection through tab element `selected` attribute', async () => {
      element.tabs[2].selected = true;
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);
    });

    it('updates selection state when removing selected tab', async () => {
      element.select('third');
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);
      firstOf(getTabsDOM(element).selected).remove();
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('keeps current selection when removing other tabs', async () => {
      element.select('third');
      await elementUpdated(element);

      for (const el of element.tabs.slice(0, 2)) {
        el.remove();
      }

      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
    });

    it('updates selected state when adding tabs at runtime', async () => {
      let tab = document.createElement(IgcTabComponent.tagName);
      element.insertBefore(tab, element.children[1]);
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);

      tab = document.createElement(IgcTabComponent.tagName);
      element.appendChild(tab);
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);

      tab = await fixture<IgcTabComponent>(html`<igc-tab>New Tab</igc-tab>`);
      tab.selected = true;
      element.insertBefore(tab, element.children[2]);
      await elementUpdated(element);

      verifySelection(element, element.tabs[2]);

      tab = await fixture<IgcTabComponent>(html`<igc-tab>New Tab</igc-tab>`);
      tab.selected = true;
      element.appendChild(tab);
      await elementUpdated(element);

      verifySelection(element, element.tabs[7]);
    });
  });

  describe('Selection state', () => {
    function verifyNoSelection(tabs: IgcTabsComponent) {
      expect(getTabsDOM(tabs).selected).to.be.empty;
      expect(tabs.selectedTab).to.be.null;
      expect(tabs.selected).to.be.empty;
    }

    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
          <igc-tab label="Tab 3" disabled>Content 3</igc-tab>
        </igc-tabs>
      `);
    });

    it('skips a tab that does not render with the arrow keys', async () => {
      const [first, second, third] = element.tabs;

      element.select(first);
      third.disabled = false;
      second.hidden = true;
      await elementUpdated(element);

      getTabDOM(first).header.focus();
      simulateKeyboard(getTabDOM(first).header, arrowRight);
      await elementUpdated(element);

      expect(document.activeElement).to.equal(third);
      verifySelection(element, third);
    });

    it('emits `igcChange` when activating a tab with `manual` activation', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      simulateClick(getTabDOM(element.tabs[0]).header);
      await elementUpdated(element);

      const eventSpy = spy(element, 'emitEvent');

      simulateKeyboard(getTabDOM(element.tabs[0]).header, arrowRight);
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
      expect(eventSpy.callCount).to.equal(0);

      simulateKeyboard(getTabDOM(element.tabs[1]).header, enterKey);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: element.tabs[1],
      });
    });

    it('clears the selection when the active tab is deselected', async () => {
      const active = element.tabs[0];

      active.selected = false;
      await elementUpdated(element);

      verifyNoSelection(element);

      simulateClick(getTabDOM(active).header);
      await elementUpdated(element);

      verifySelection(element, active);
    });

    it('clears the selection when the last remaining tab is removed', async () => {
      for (const tab of element.tabs.slice(1)) {
        tab.remove();
      }
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);

      element.tabs[0].remove();
      await elementUpdated(element);

      verifyNoSelection(element);
    });

    it('recovers the selection when a tab is added while nothing is selected', async () => {
      for (const tab of element.tabs) {
        tab.remove();
      }
      await elementUpdated(element);

      verifyNoSelection(element);

      const tab = document.createElement(IgcTabComponent.tagName);
      tab.label = 'New tab';
      element.append(tab);

      await elementUpdated(tab);
      await elementUpdated(element);

      verifySelection(element, tab);
    });

    it('selects an added selected tab when the active tab is deselected at the same time', async () => {
      const tab = document.createElement(IgcTabComponent.tagName);
      tab.label = 'New tab';
      tab.selected = true;

      // A declarative render moves `selected` to the new tab in one task.
      element.tabs[0].selected = false;
      element.append(tab);

      await elementUpdated(tab);
      await elementUpdated(element);

      verifySelection(element, tab);
    });

    it('selects the selected tab of new markup', async () => {
      element.innerHTML = `
        <igc-tab label="New 1">Content 1</igc-tab>
        <igc-tab label="New 2" selected>Content 2</igc-tab>
      `;
      const [, selected] = element.tabs;

      await elementUpdated(selected);
      await elementUpdated(element);

      verifySelection(element, selected);
    });

    it('keeps the selection when the selected tab moves', async () => {
      const active = element.tabs[0];

      element.append(active);
      await elementUpdated(element);

      verifySelection(element, active);
    });

    it('selects the last tab in document order when several tabs become selected at once', async () => {
      const tab = document.createElement(IgcTabComponent.tagName);
      element.append(tab);
      await elementUpdated(tab);
      await elementUpdated(element);

      tab.selected = true;
      element.tabs[1].selected = true;

      await elementUpdated(tab);
      await elementUpdated(element);

      verifySelection(element, tab);
    });

    it('ignores disabled tabs in the `select` method', async () => {
      const disabled = element.tabs[2];

      element.select(disabled);
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);

      element.select(disabled.id);
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
    });

    it('reverts a `selected` state applied to a disabled tab', async () => {
      const disabled = element.tabs[2];

      disabled.selected = true;
      await elementUpdated(element);

      expect(disabled.selected).to.be.false;
      verifySelection(element, element.tabs[0]);
    });

    it('does not select a disabled tab marked as selected in the template', async () => {
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2" disabled selected>Content 2</igc-tab>
        </igc-tabs>
      `);

      verifySelection(tabs, tabs.tabs[0]);
      expect(tabs.tabs[1].selected).to.be.false;
    });

    it('ignores tabs which are not children of the component', async () => {
      const foreign = await fixture<IgcTabComponent>(
        html`<igc-tab label="Foreign"></igc-tab>`
      );

      element.select(foreign);
      await elementUpdated(element);

      expect(foreign.selected).to.be.false;
      verifySelection(element, element.tabs[0]);
    });

    it('`select` accepts a label and round-trips with the `selected` getter', async () => {
      element.select('Tab 2');
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
      expect(element.selected).to.equal('Tab 2');

      const token = element.selected;

      element.select(element.tabs[0]);
      await elementUpdated(element);

      element.select(token);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('`select` does not emit `igcChange`', async () => {
      const eventSpy = spy(element, 'emitEvent');

      element.select(element.tabs[1]);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
      expect(eventSpy.callCount).to.equal(0);
    });

    it('hands over the selection when the active tab is disabled', async () => {
      const [firstTab, secondTab] = element.tabs;

      firstTab.disabled = true;
      await elementUpdated(element);
      await elementUpdated(secondTab);

      verifySelection(element, secondTab);
      expect(firstTab.selected).to.be.false;
    });

    it('keeps the selection when another tab is disabled', async () => {
      element.tabs[1].disabled = true;
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
    });

    it('clears the selection when every tab is disabled', async () => {
      for (const tab of element.tabs) {
        tab.disabled = true;
      }
      await elementUpdated(element);

      verifyNoSelection(element);
    });

    it('restores a tab stop when a disabled tab is enabled again', async () => {
      for (const tab of element.tabs) {
        tab.disabled = true;
      }
      await elementUpdated(element);

      verifyNoSelection(element);

      element.tabs[1].disabled = false;
      await elementUpdated(element);
      await elementUpdated(element.tabs[1]);

      expect(getTabDOM(element.tabs[1]).header.tabIndex).to.equal(0);
    });

    it('selects a tab that has not rendered yet', async () => {
      const tab = document.createElement(IgcTabComponent.tagName);
      tab.label = 'Pending';
      tab.selected = true;
      element.append(tab);

      await elementUpdated(tab);
      await elementUpdated(element);

      verifySelection(element, tab);
    });

    it('exposes the selected tab through `selectedTab`', async () => {
      expect(element.selectedTab).to.equal(element.tabs[0]);

      element.select(element.tabs[1]);
      await elementUpdated(element);

      expect(element.selectedTab).to.equal(element.tabs[1]);
    });
  });

  // The links point to fragments, so a click that the browser follows does not
  // leave the test page. A click that would open a new browsing context is
  // canceled on the document, after the tabs handled it.
  describe('Link tabs', () => {
    /** Dispatches a cancelable click and returns whether the tabs canceled it. */
    function clickLink(node: Element, init?: MouseEventInit): boolean {
      let canceledByTabs = false;
      const record = (event: Event) => {
        canceledByTabs = event.defaultPrevented;
      };

      element.addEventListener('click', record, { once: true });
      document.addEventListener('click', preventDefault, { once: true });

      node.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          composed: true,
          cancelable: true,
          ...init,
        })
      );

      return canceledByTabs;
    }

    /** Dispatches a cancelable key press and returns whether it was canceled. */
    function pressKey(
      node: Element,
      key: string,
      init?: KeyboardEventInit
    ): boolean {
      const options = { key, bubbles: true, composed: true, ...init };
      const event = new KeyboardEvent('keydown', {
        ...options,
        cancelable: true,
      });

      node.dispatchEvent(event);
      node.dispatchEvent(new KeyboardEvent('keyup', options));

      return event.defaultPrevented;
    }

    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1" href="#link-tab-1">Content 1</igc-tab>
          <igc-tab label="Tab 2" href="#link-tab-2">Content 2</igc-tab>
          <igc-tab label="Tab 3" href="#link-tab-3" target="_blank">
            Content 3
          </igc-tab>
          <igc-tab label="Tab 4">Content 4</igc-tab>
          <igc-tab label="Tab 5" href="#link-tab-5" disabled>Content 5</igc-tab>
        </igc-tabs>
      `);
    });

    afterEach(() => {
      history.replaceState(null, '', location.pathname + location.search);
    });

    it('selects the tab on a plain click and follows the link', async () => {
      const eventSpy = spy(element, 'emitEvent');

      simulateClick(getTabDOM(element.tabs[1]).header);
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
      expect(eventSpy).calledOnceWithExactly('igcChange', {
        detail: element.tabs[1],
      });
      expect(location.hash).to.equal('#link-tab-2');
    });

    it('selects the tab but emits no `igcNavigate` when the application cancels the click', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const second = element.tabs[1];
      const route = spy();

      second.addEventListener('click', preventDefault);
      second.addEventListener('igcNavigate', route);
      clickLink(getTabDOM(second).header);
      await elementUpdated(element);

      verifySelection(element, second);
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: second });
      expect(route.callCount).to.equal(0);
      expect(location.hash).to.be.empty;
    });

    it('leaves a click with a modifier key or another button to the browser', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const route = spy();
      const { header } = getTabDOM(element.tabs[1]);

      // A capture listener also gets the events that do not bubble.
      element.addEventListener('igcNavigate', route, { capture: true });

      for (const init of [
        { altKey: true },
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { button: 1 },
      ]) {
        expect(clickLink(header, init)).to.be.false;
        await elementUpdated(element);

        verifySelection(element, element.tabs[0]);
      }

      expect(eventSpy.callCount).to.equal(0);
      expect(route.callCount).to.equal(0);
    });

    it('follows the target of a base element, without regard to case', async () => {
      const base = document.createElement('base');
      base.target = '_BLANK';
      document.head.append(base);

      try {
        expect(clickLink(getTabDOM(element.tabs[1]).header)).to.be.false;
        await elementUpdated(element);

        verifySelection(element, element.tabs[0]);
      } finally {
        base.remove();
      }
    });

    it('does not select a tab whose link opens in another browsing context', async () => {
      const eventSpy = spy(element, 'emitEvent');
      const route = spy();

      element.addEventListener('igcNavigate', route, { capture: true });

      expect(clickLink(getTabDOM(element.tabs[2]).header)).to.be.false;
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
      expect(eventSpy.callCount).to.equal(0);
      expect(route.callCount).to.equal(0);
    });

    it('follows the link of the focused tab on Enter and Space', async () => {
      const [first, second] = element.tabs;
      const eventSpy = spy(element, 'emitEvent');
      const clicks = spy();
      const navigate = spy();

      second.addEventListener('click', clicks);
      element.addEventListener('igcNavigate', navigate, { capture: true });
      getTabDOM(second).header.focus();

      expect(pressKey(getTabDOM(second).header, enterKey)).to.be.true;
      await elementUpdated(element);

      verifySelection(element, second);
      expect(clicks).calledOnce;
      expect(eventSpy).calledOnceWithExactly('igcChange', { detail: second });
      expect(location.hash).to.equal('#link-tab-2');

      getTabDOM(first).header.focus();

      expect(pressKey(getTabDOM(first).header, spaceBar)).to.be.true;
      await elementUpdated(element);

      verifySelection(element, first);
      expect(location.hash).to.equal('#link-tab-1');
      expect(navigate).calledTwice;
    });

    it('leaves Ctrl+Enter to the browser', async () => {
      const second = element.tabs[1];
      const clicks = spy();

      second.addEventListener('click', clicks);
      getTabDOM(second).header.focus();

      expect(pressKey(getTabDOM(second).header, enterKey, { ctrlKey: true })).to
        .be.false;
      await elementUpdated(element);

      verifySelection(element, element.tabs[0]);
      expect(clicks.callCount).to.equal(0);
    });

    it('selects without a navigation on focus with `auto` activation', async () => {
      const [first, second, third] = element.tabs;
      const clicks = spy();

      element.addEventListener('click', clicks);
      getTabDOM(first).header.focus();

      simulateKeyboard(getTabDOM(first).header, arrowRight);
      await elementUpdated(element);

      verifySelection(element, second);

      // The link of the third tab opens elsewhere, so the focus does not select it.
      simulateKeyboard(getTabDOM(second).header, arrowRight);
      await elementUpdated(element);

      expect(document.activeElement).to.equal(third);
      verifySelection(element, second);
      expect(clicks.callCount).to.equal(0);
      expect(location.hash).to.be.empty;
    });

    it('navigates link and plain tabs alike and skips a disabled link tab', async () => {
      const [first, , , fourth] = element.tabs;

      getTabDOM(fourth).header.focus();

      simulateKeyboard(getTabDOM(fourth).header, arrowRight);
      await elementUpdated(element);

      expect(document.activeElement).to.equal(first);

      simulateKeyboard(getTabDOM(first).header, endKey);
      await elementUpdated(element);

      expect(document.activeElement).to.equal(fourth);
      verifySelection(element, fourth);
    });

    it('leaves the keys of a control in a tab label to the control', async () => {
      const second = element.tabs[1];
      const button = document.createElement('button');

      button.slot = 'suffix';
      button.textContent = 'Pin';
      second.append(button);
      await elementUpdated(second);

      button.focus();

      for (const key of [enterKey, spaceBar, arrowRight, endKey]) {
        expect(pressKey(button, key)).to.be.false;
      }
      await elementUpdated(element);

      expect(document.activeElement).to.equal(button);
      verifySelection(element, element.tabs[0]);
      expect(location.hash).to.be.empty;
    });

    it('emits a cancelable `igcNavigate` that keeps the browser on the page', async () => {
      const [first, second] = element.tabs;
      const follow = spy();
      const route = spy(preventDefault);

      first.addEventListener('igcNavigate', follow);
      second.addEventListener('igcNavigate', route);

      expect(clickLink(getTabDOM(first).header)).to.be.false;
      expect(clickLink(getTabDOM(second).header)).to.be.true;
      // A click on the selected tab follows its link too.
      expect(clickLink(getTabDOM(second).header)).to.be.true;
      await elementUpdated(element);

      verifySelection(element, second);
      expect(follow).calledOnce;
      expect(route).calledTwice;

      const [event] = route.firstCall.args;
      expect(event.target).to.equal(second);
      expect(event.bubbles).to.be.false;
    });

    it('does not emit `igcNavigate` for a plain or a disabled tab', async () => {
      const [, , , fourth, fifth] = element.tabs;
      const route = spy();

      element.addEventListener('igcNavigate', route, { capture: true });

      clickLink(getTabDOM(fourth).header);
      clickLink(getTabDOM(fifth).header);
      await elementUpdated(element);

      verifySelection(element, fourth);
      expect(route.callCount).to.equal(0);
    });

    it('does not emit `igcNavigate` for a click in the panel', () => {
      const first = element.tabs[0];
      const link = document.createElement('a');
      const route = spy(preventDefault);

      link.href = '#panel-link';
      first.append(link);
      first.addEventListener('igcNavigate', route);

      link.click();

      expect(route.callCount).to.equal(0);
      expect(location.hash).to.equal('#panel-link');
    });
  });

  describe('Layout', () => {
    /** Waits for the resize observations of the current layout. */
    async function settle(): Promise<void> {
      await nextFrame();
      await nextFrame();
    }

    function indicatorFollows(tab: IgcTabComponent): Promise<void> {
      return waitUntil(
        () =>
          getTabsDOM(element).indicator.style.width ===
          `${getTabDOM(tab).header.offsetWidth}px`,
        'The indicator did not follow the header'
      );
    }

    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
        </igc-tabs>
      `);
      await settle();
    });

    it('does not measure the strip for changes inside a panel', async () => {
      const layout = spy(element['_domHelpers'], 'updateLayout');
      const content = document.createElement('div');

      content.style.height = '400px';
      element.tabs[0].append(content);
      content.append(document.createElement('p'));
      await settle();

      expect(layout.callCount).to.equal(0);
    });

    it('handles a click once, without the echo of the reflected selection', async () => {
      const resolve = spy(
        element as unknown as { _resolveSelection(): unknown },
        '_resolveSelection'
      );

      simulateClick(getTabDOM(element.tabs[1]).header);
      await elementUpdated(element.tabs[1]);
      await settle();

      verifySelection(element, element.tabs[1]);
      expect(resolve.callCount).to.equal(0);
    });

    it('clears the selection when the app deselects the tab that a click selected', async () => {
      const [, second] = element.tabs;

      element.addEventListener(
        'igcChange',
        ({ detail }) => {
          detail.selected = false;
        },
        { once: true }
      );

      simulateClick(getTabDOM(second).header);
      await elementUpdated(second);
      await settle();

      expect(element.selectedTab).to.be.null;
      expect(element.tabs.some((tab) => tab.selected)).to.be.false;
    });

    it('moves the indicator when the direction of an ancestor changes', async () => {
      const { indicator } = getTabsDOM(element);
      const host = element.parentElement!;

      element.select(element.tabs[1]);
      await elementUpdated(element);
      await settle();

      const ltr = indicator.style.transform;

      host.dir = 'rtl';
      await waitUntil(
        () => indicator.style.transform !== ltr,
        'The indicator did not follow the direction'
      );

      // The same position as a full update in this direction gives.
      const rtl = indicator.style.transform;
      element.requestUpdate();
      await elementUpdated(element);
      await settle();

      expect(indicator.style.transform).to.equal(rtl);

      host.removeAttribute('dir');
      await waitUntil(
        () => indicator.style.transform === ltr,
        'The indicator did not return'
      );
    });

    it('follows a change of size of a tab header', async () => {
      const [first] = element.tabs;

      getTabDOM(first).header.style.padding = '24px 48px';
      await indicatorFollows(first);

      first.label = 'A much longer label';
      await elementUpdated(first);
      await indicatorFollows(first);
    });

    it('observes a header that a change of `href` replaced', async () => {
      const [first] = element.tabs;

      first.href = '#layout';
      await elementUpdated(first);
      await settle();

      first.label = 'A much longer label';
      await elementUpdated(first);
      await indicatorFollows(first);
    });

    it('paints its headers under an earlier page layer', () => {
      const { header } = getTabDOM(element.tabs[0]);

      expect(isUnderPageLayer(element, header)).to.be.true;
    });

    it('places fixed content of the selected panel against the viewport', () => {
      const fixed = document.createElement('div');
      fixed.style.cssText = 'position: fixed; top: 0; left: 0';
      element.tabs[0].append(fixed);

      // An element that does not render has no client rects.
      const [rect] = fixed.getClientRects();
      expect([rect?.top, rect?.left]).to.eql([0, 0]);
    });
  });

  describe('Scrolling', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          ${Array.from(range(1, 19)).map(
            (idx) => html`
              <igc-tab id=${idx} .label=${`Item ${idx}`} ?disabled=${idx === 3}>
                Content ${idx}
              </igc-tab>
            `
          )}
        </igc-tabs>
      `);
    });

    function startScrollButton() {
      return element.renderRoot.querySelector(
        'igc-icon-button[part="start-scroll-button"]'
      ) as IgcIconButtonComponent;
    }

    function endScrollButton() {
      return element.renderRoot.querySelector(
        'igc-icon-button[part="end-scroll-button"]'
      ) as IgcIconButtonComponent;
    }

    it('displays scroll buttons', async () => {
      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;

      element.select('18');
      await elementUpdated(element);

      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;

      element.select('9');
      await elementUpdated(element);
      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;
    });

    it('measures the strip in its own CSS pixels under an ancestor zoom', async () => {
      const { container } = getTabsDOM(element);
      const ownWidth = () =>
        container.getBoundingClientRect().width / container.currentCSSZoom;

      element.parentElement!.style.zoom = '2';
      await waitUntil(
        () =>
          container.style.getPropertyValue('--_ig-tabs-width') ===
          `${ownWidth()}px`,
        'The strip width is not in CSS pixels'
      );

      element.select('18');
      const header = getTabDOM(element.tabs[17]).header;

      await waitUntil(() => {
        const strip = container.getBoundingClientRect();
        const { left, right } = header.getBoundingClientRect();
        return left >= strip.left - 1 && right <= strip.right + 1;
      }, 'The selected tab did not scroll into view');
    });

    it('points the scroll buttons along the writing direction', async () => {
      const flipped = 'matrix(-1, 0, 0, 1, 0, 0)';
      const transforms = () =>
        [startScrollButton(), endScrollButton()].map(
          (button) => getComputedStyle(button).transform
        );

      expect(transforms()).to.eql(['none', 'none']);

      element.dir = 'rtl';
      await elementUpdated(element);

      expect(transforms()).to.eql([flipped, flipped]);

      element.removeAttribute('dir');
      element.parentElement!.dir = 'rtl';
      await elementUpdated(element);

      expect(transforms()).to.eql([flipped, flipped]);
    });

    it('does display scroll buttons if alignment is justify', async () => {
      element.alignment = 'justify';
      await elementUpdated(element);

      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;
    });

    it('scrolls to start when start scroll button is clicked', async () => {
      element.select('18');
      await elementUpdated(element);

      await waitUntil(
        () => endScrollButton().disabled,
        'End scroll button is not disabled at end of scroll'
      );

      startScrollButton().click();
      await elementUpdated(element);

      await waitUntil(
        () => !endScrollButton().disabled,
        'End scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls to end when end scroll button is clicked', async () => {
      element.select('1');

      await elementUpdated(element);
      await waitUntil(
        () => startScrollButton().disabled,
        'Start scroll button is not disabled at end of scroll'
      );

      endScrollButton().click();

      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton().disabled,
        'Start scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls when tab is partially visible', async () => {
      const header = element.querySelector(IgcTabComponent.tagName)!;
      header.label = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
      element.style.width = '300px';
      await elementUpdated(element);

      endScrollButton().click();
      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton().disabled,
        'Start scroll button is disabled on opposite scroll'
      );
    });

    function isInView(container: HTMLElement, header: HTMLElement) {
      const padding = Number.parseFloat(
        getComputedStyle(container).scrollPaddingInlineStart
      );
      const bounds = container.getBoundingClientRect();
      const rect = header.getBoundingClientRect();

      return (
        rect.left >= bounds.left + padding - 1 &&
        rect.right <= bounds.right - padding + 1
      );
    }

    function tabHeaders() {
      return element.tabs.map((tab) => getTabDOM(tab).header);
    }

    it('scrolls the next out of view tab into view', async () => {
      element.style.width = '400px';
      await elementUpdated(element);

      const { container } = getTabsDOM(element);
      const target = tabHeaders().find(
        (header) => !isInView(container, header)
      )!;

      expect(target, 'No tab is out of view to begin with').to.not.be.undefined;

      endScrollButton().click();

      await waitUntil(
        () => isInView(container, target),
        'The next out of view tab was not scrolled into view'
      );
    });

    it('scrolls a tab selected through its `selected` property into view', async () => {
      element.style.width = '400px';
      await elementUpdated(element);

      const { container } = getTabsDOM(element);
      const tab = lastOf(element.tabs)!;
      const header = getTabDOM(tab).header;

      expect(
        isInView(container, header),
        'The last tab is in view to begin with'
      ).to.be.false;

      // Selection driven by the DOM, the way a framework binding applies it.
      tab.selected = true;
      await elementUpdated(element);

      await waitUntil(
        () => isInView(container, header),
        'The programmatically selected tab was not scrolled into view'
      );
      expect(getTabsDOM(element).selected).to.deep.equal([tab]);
    });

    it('scrolls a tab added as selected into view', async () => {
      element.style.width = '400px';
      await elementUpdated(element);

      const { container } = getTabsDOM(element);
      const tab = document.createElement(IgcTabComponent.tagName);
      tab.label = 'Added';
      tab.selected = true;

      element.append(tab);
      await elementUpdated(element);

      await waitUntil(
        () => isInView(container, getTabDOM(tab).header),
        'The added selected tab was not scrolled into view'
      );
      expect(getTabsDOM(element).selected).to.deep.equal([tab]);
    });

    it('scrolls an added selected tab into view when it is the one that makes the strip overflow', async () => {
      // Four tabs fit, the fifth one brings in the scroll buttons.
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs style="width: 400px">
          ${Array.from(range(1, 5)).map(
            (idx) =>
              html`<igc-tab .label=${`Tab ${idx}`}>Content ${idx}</igc-tab>`
          )}
        </igc-tabs>
      `);
      const { container } = getTabsDOM(tabs);

      expect(
        tabs.renderRoot.querySelector('[part="end-scroll-button"]'),
        'The strip overflows to begin with'
      ).to.be.null;

      const tab = document.createElement(IgcTabComponent.tagName);
      tab.label = 'Added';
      tab.selected = true;

      tabs.append(tab);
      await elementUpdated(tabs);

      await waitUntil(
        () =>
          tabs.renderRoot.querySelector('[part="end-scroll-button"]') !== null,
        'The scroll buttons did not appear'
      );
      await waitUntil(
        () => isInView(container, getTabDOM(tab).header),
        'The added selected tab was not scrolled into view'
      );
    });

    it('hides the scroll buttons when removing a tab makes the strip fit again', async () => {
      // Four tabs fit in 400px, the fifth one brings in the scroll buttons.
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs style="width: 400px">
          ${Array.from(range(1, 6)).map(
            (idx) =>
              html`<igc-tab .label=${`Tab ${idx}`}>Content ${idx}</igc-tab>`
          )}
        </igc-tabs>
      `);
      const endButton = () =>
        tabs.renderRoot.querySelector('[part="end-scroll-button"]');

      await waitUntil(
        () => endButton() !== null,
        'The strip does not overflow'
      );

      lastOf(tabs.tabs)!.remove();
      await elementUpdated(tabs);

      await waitUntil(
        () => endButton() === null,
        'The scroll buttons stayed after the tabs fit again'
      );
    });

    it('does not scroll the page when a selected tab is out of view', async () => {
      // Push the tabs below the fold so that a document scroll would be observable.
      const wrapper = await fixture<HTMLElement>(html`
        <div>
          <div style="height: 300vh"></div>
          <igc-tabs style="width: 400px">
            ${Array.from(range(1, 19)).map(
              (idx) =>
                html`<igc-tab .label=${`Item ${idx}`}>Content ${idx}</igc-tab>`
            )}
          </igc-tabs>
        </div>
      `);
      const tabs = wrapper.querySelector(IgcTabsComponent.tagName)!;
      const { container } = getTabsDOM(tabs);

      window.scrollTo(0, 0);
      const target = lastOf(tabs.tabs)!;

      target.selected = true;
      await elementUpdated(tabs);
      await waitUntil(
        () => isInView(container, getTabDOM(target).header),
        'The programmatically selected tab was not scrolled into view'
      );

      expect(window.scrollY, 'The page was scrolled').to.equal(0);
    });

    it('reveals a tab selected in the initial markup without scrolling the page', async () => {
      // The tabs are below the fold and the last tab is selected from the start, which is
      // the case where the initial scroll into view used to move the document.
      const wrapper = await fixture<HTMLElement>(html`
        <div>
          <div style="height: 300vh"></div>
          <igc-tabs style="width: 400px">
            ${Array.from(range(1, 19)).map(
              (idx) =>
                html`<igc-tab .label=${`Item ${idx}`} ?selected=${idx === 18}
                  >Content ${idx}</igc-tab
                >`
            )}
          </igc-tabs>
        </div>
      `);
      const tabs = wrapper.querySelector(IgcTabsComponent.tagName)!;
      const { container } = getTabsDOM(tabs);
      const target = lastOf(tabs.tabs)!;

      await waitUntil(
        () => isInView(container, getTabDOM(target).header),
        'The initially selected tab was not scrolled into view'
      );
      expect(getTabsDOM(tabs).selected).to.deep.equal([target]);
      expect(window.scrollY, 'The page was scrolled').to.equal(0);
    });

    it('scrolls the previous out of view tab into view', async () => {
      element.style.width = '400px';
      await elementUpdated(element);

      element.select('18');
      await elementUpdated(element);
      await waitUntil(
        () => endScrollButton().disabled,
        'Did not reach the end of the strip'
      );

      const { container } = getTabsDOM(element);
      // The closest tab hidden past the start edge of the strip.
      const target = tabHeaders().findLast(
        (header) =>
          header.getBoundingClientRect().left <
          container.getBoundingClientRect().left
      )!;

      expect(target, 'No tab is hidden past the start edge').to.not.be
        .undefined;

      startScrollButton().click();

      await waitUntil(
        () => isInView(container, target),
        'The previous out of view tab was not scrolled into view'
      );
    });

    it('does not overshoot past the tab brought into view', async () => {
      element.style.width = '400px';
      await elementUpdated(element);

      const { container } = getTabsDOM(element);
      const headers = tabHeaders();
      const target = headers.find((header) => !isInView(container, header))!;
      const next = headers[headers.indexOf(target) + 1];

      endScrollButton().click();

      await waitUntil(
        () => isInView(container, target),
        'The next out of view tab was not scrolled into view'
      );

      expect(
        isInView(container, next),
        'Scrolled further than the first out of view tab'
      ).to.be.false;
    });

    it('skips the layout work when it leaves the DOM during a selection', async () => {
      const { indicator } = getTabsDOM(element);
      const parent = element.parentElement!;
      const transform = indicator.style.transform;
      const target = element.tabs[4];

      element.select(target);
      element.remove();
      await nextFrame();
      await nextFrame();

      expect(target.selected).to.be.true;
      expect(indicator.style.transform).to.equal(transform);

      parent.append(element);
      await waitUntil(
        () =>
          indicator.style.transform ===
          `translateX(${getTabDOM(target).header.offsetLeft}px)`,
        'The indicator did not follow the selection after re-attaching'
      );
    });

    it('does not re-render when the scroll state is unchanged', async () => {
      const { container } = getTabsDOM(element);

      container.dispatchEvent(new Event('scroll'));
      await elementUpdated(element);

      const updateSpy = spy(element, 'requestUpdate');

      container.dispatchEvent(new Event('scroll'));
      container.dispatchEvent(new Event('scroll'));
      await elementUpdated(element);

      expect(updateSpy.callCount).to.equal(0);
    });

    it('displays scroll buttons (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;

      element.select('18');
      await elementUpdated(element);

      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;

      element.select('9');
      await elementUpdated(element);
      expect(startScrollButton()).to.not.be.null;
      expect(endScrollButton()).to.not.be.null;
    });

    it('scrolls to start when start scroll button is clicked (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      element.select('18');

      await elementUpdated(element);
      await waitUntil(
        () => endScrollButton().disabled,
        'End scroll button is not disabled at end of scroll'
      );

      startScrollButton().click();

      await elementUpdated(element);
      await waitUntil(
        () => !endScrollButton().disabled,
        'End scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls to end when end scroll button is clicked (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      element.select('1');

      await elementUpdated(element);
      await waitUntil(
        () => startScrollButton().disabled,
        'Start scroll button is not disabled at end of scroll'
      );

      endScrollButton().click();

      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton().disabled,
        'Start scroll button is disabled on opposite scroll'
      );
    });
  });

  describe('Composition', () => {
    before(() => {
      if (customElements.get('tabs-wrapper')) {
        return;
      }

      customElements.define(
        'tabs-wrapper',
        class extends HTMLElement {
          connectedCallback() {
            if (!this.shadowRoot) {
              this.attachShadow({ mode: 'open' }).innerHTML =
                '<igc-tabs><slot></slot></igc-tabs>';
            }
          }
        }
      );
    });

    it('picks up tabs projected through an intermediate slot', async () => {
      const wrapper = await fixture<HTMLElement>(html`
        <tabs-wrapper>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
        </tabs-wrapper>
      `);

      const tabs = wrapper.shadowRoot!.querySelector(IgcTabsComponent.tagName)!;
      await elementUpdated(tabs);

      expect(tabs.tabs).lengthOf(2);
      expect(tabs.selectedTab).to.equal(tabs.tabs[0]);
    });

    it('navigates and activates tabs projected through an intermediate slot', async () => {
      const wrapper = await fixture<HTMLElement>(html`
        <tabs-wrapper>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
          <igc-tab label="Tab 3" href="#projected-tab-3">Content 3</igc-tab>
        </tabs-wrapper>
      `);

      const tabs = wrapper.shadowRoot!.querySelector(IgcTabsComponent.tagName)!;
      tabs.activation = 'manual';
      await elementUpdated(tabs);

      const [, second, third] = tabs.tabs;

      getTabDOM(second).header.focus();
      simulateKeyboard(getTabDOM(second).header, arrowRight);
      await elementUpdated(tabs);

      expect(document.activeElement).to.equal(third);

      simulateKeyboard(getTabDOM(third).header, enterKey);
      await elementUpdated(tabs);

      verifySelection(tabs, third);
      expect(location.hash).to.equal('#projected-tab-3');

      history.replaceState(null, '', location.pathname + location.search);
    });

    it('follows the state and the children of tabs projected through an intermediate slot', async () => {
      const wrapper = await fixture<HTMLElement>(html`
        <tabs-wrapper>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
        </tabs-wrapper>
      `);

      const tabs = wrapper.shadowRoot!.querySelector(IgcTabsComponent.tagName)!;
      await elementUpdated(tabs);

      const [first, second] = tabs.tabs;

      second.selected = true;
      await elementUpdated(second);
      await nextFrame();

      verifySelection(tabs, second);
      expect(first.selected).to.be.false;

      const third = document.createElement(IgcTabComponent.tagName);
      third.label = 'Tab 3';
      wrapper.append(third);
      await elementUpdated(third);
      await nextFrame();

      expect(tabs.tabs).lengthOf(3);
      expect(getTabDOM(third).header.getAttribute('aria-setsize')).to.equal(
        '3'
      );
      expect(
        getTabsDOM(tabs).container.style.getPropertyValue('--_tabs-count')
      ).to.equal('3');

      second.remove();
      await nextFrame();

      verifySelection(tabs, first);
    });

    it('follows changes of the tabs made while detached', async () => {
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
          <igc-tab label="Tab 3">Content 3</igc-tab>
        </igc-tabs>
      `);
      const parent = tabs.parentElement!;
      const [first, second, third] = tabs.tabs;

      tabs.remove();
      first.remove();
      parent.append(tabs);
      await elementUpdated(tabs);
      await nextFrame();

      verifySelection(tabs, second);
      expect(getTabDOM(second).header.tabIndex).to.equal(0);

      tabs.remove();
      third.selected = true;
      await elementUpdated(third);
      parent.append(tabs);
      await elementUpdated(tabs);
      await nextFrame();

      verifySelection(tabs, third);
      expect(second.selected).to.be.false;
    });
  });

  describe('issue-1140', () => {
    it('Tabs throw if a child tab is immediately appended', async () => {
      // https://github.com/IgniteUI/igniteui-webcomponents/pull/1705#issuecomment-2912189331
      const tabs = document.createElement(IgcTabsComponent.tagName);
      const tab = document.createElement(IgcTabComponent.tagName);
      document.body.appendChild(tabs);

      expect(() => tabs.appendChild(tab)).not.to.throw();
    });
  });

  describe('issue-713', () => {
    it('Nested tabs selection', async () => {
      const tabs = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab label="1">
            Panel 1
            <igc-tabs>
              <igc-tab label="1.1">Panel 1.1</igc-tab>
              <igc-tab label="1.2" selected>Panel 1.2</igc-tab>
            </igc-tabs>
          </igc-tab>
          <igc-tab label="2">Panel 2</igc-tab>
        </igc-tabs>
      `);

      const nestedTabs = tabs.querySelector(IgcTabsComponent.tagName)!;

      verifySelection(tabs, firstOf(tabs.tabs));
      verifySelection(nestedTabs, lastOf(nestedTabs.tabs));

      simulateClick(getTabDOM(firstOf(nestedTabs.tabs)).header);
      await elementUpdated(tabs);

      verifySelection(tabs, firstOf(tabs.tabs));
      verifySelection(nestedTabs, firstOf(nestedTabs.tabs));

      simulateClick(getTabDOM(lastOf(tabs.tabs)).header);
      await elementUpdated(tabs);

      verifySelection(tabs, lastOf(tabs.tabs));
      verifySelection(nestedTabs, firstOf(nestedTabs.tabs));
    });
  });

  describe('issue-2416', () => {
    let tabs: IgcTabsComponent;
    const reasons: unknown[] = [];

    const onRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      reasons.push(event.reason);
    };

    beforeEach(() => {
      reasons.length = 0;
      window.addEventListener('unhandledrejection', onRejection);

      tabs = document.createElement(IgcTabsComponent.tagName);

      for (const label of ['One', 'Two']) {
        const tab = document.createElement(IgcTabComponent.tagName);
        tab.label = label;
        tabs.append(tab);
      }
    });

    afterEach(() => {
      window.removeEventListener('unhandledrejection', onRejection);
      tabs.remove();
    });

    const removals: Record<string, () => unknown> = {
      'in the same task': () => tabs.remove(),
      'after a microtask': () => Promise.resolve().then(() => tabs.remove()),
      'after its first update': () =>
        tabs.updateComplete.then(() => tabs.remove()),
    };

    for (const [when, remove] of Object.entries(removals)) {
      it(`does not throw when removed ${when}`, async () => {
        document.body.append(tabs);
        await remove();
        await nextFrame();
        await nextFrame();

        expect(reasons).to.be.empty;
      });
    }

    it('follows resizes when added back after an early removal', async () => {
      document.body.append(tabs);
      tabs.remove();
      await nextFrame();

      document.body.append(tabs);
      await elementUpdated(tabs);

      const { container } = getTabsDOM(tabs);
      const width = () => container.style.getPropertyValue('--_ig-tabs-width');

      tabs.style.width = '200px';

      await waitUntil(
        () => width() === `${container.getBoundingClientRect().width}px`,
        'The layout did not follow the resize'
      );
      expect(reasons).to.be.empty;
    });
  });
});

function getTabsDOM(tabs: IgcTabsComponent) {
  const root = tabs.renderRoot;
  return {
    get selected() {
      return tabs.tabs.filter((tab) => tab.selected);
    },
    get container() {
      return root.querySelector<HTMLElement>('[part="tabs"]')!;
    },
    get indicator() {
      return root.querySelector<HTMLElement>(
        '[part="selected-indicator"] span'
      )!;
    },
  };
}

function getTabDOM(tab: IgcTabComponent) {
  const root = tab.renderRoot;
  return {
    get header() {
      return root.querySelector<HTMLElement>('[part~="tab-header"]')!;
    },

    get body() {
      return root.querySelector<HTMLElement>('[part~="tab-body"]')!;
    },
  };
}
