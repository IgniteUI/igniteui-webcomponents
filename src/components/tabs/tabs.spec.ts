import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import {
  arrowLeft,
  arrowRight,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';
import IgcTabComponent from './tab.js';
import IgcTabsComponent from './tabs.js';

describe('Tabs component', () => {
  function verifySelection(tabs: IgcTabsComponent, tab: IgcTabComponent) {
    const { selected } = getTabsDOM(tabs);
    // biome-ignore lint/complexity/useLiteralKeys: test-scenarios
    const activeTab = tabs['_activeTab'];

    expect(first(selected) === tab).to.be.true;
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

    it('selected indicator align with the selected tab', async () => {
      const { indicator } = getTabsDOM(element);
      let selected = getTabsDOM(element).selected;

      let offsetLeft = getTabDOM(first(selected)).header.offsetLeft;
      expect(indicator.style.transform).to.equal(`translateX(${offsetLeft}px)`);
      expect(indicator.style.width).to.equal(
        `${getTabDOM(first(selected)).header.offsetWidth}px`
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('third');
      await elementUpdated(element);

      selected = getTabsDOM(element).selected;
      verifySelection(element, element.tabs[2]);

      offsetLeft = getTabDOM(first(selected)).header.offsetLeft;
      expect(indicator.style.transform).to.eq(`translateX(${offsetLeft}px)`);
      expect(indicator.style.width).to.eq(
        `${getTabDOM(first(selected)).header.offsetWidth}px`
      );
    });

    it('selected indicator align with the selected tab (RTL)', async () => {
      const { indicator, container } = getTabsDOM(element);

      element.dir = 'rtl';

      element.requestUpdate();
      await elementUpdated(element);

      let activeTabHeader = getTabDOM(
        first(getTabsDOM(element).selected)
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

      activeTabHeader = getTabDOM(first(getTabsDOM(element).selected)).header;
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
        detail: first(getTabsDOM(element).selected),
      });
    });

    it('emits `igcChange` when selecting item via arrow key press', async () => {
      const eventSpy = spy(element, 'emitEvent');

      simulateKeyboard(getTabDOM(element.tabs[1]).header, arrowLeft);
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: first(getTabsDOM(element).selected),
      });
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
      const firstTabHeader = getTabDOM(first(element.tabs)).header;
      const lastTabHeader = getTabDOM(last(element.tabs)).header;

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

    it('aligns tab headers properly when `alignment` is set to center', async () => {
      const { container } = getTabsDOM(element);
      const firstTabHeader = getTabDOM(first(element.tabs)).header;
      const lastTabHeader = getTabDOM(last(element.tabs)).header;

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
      first(getTabsDOM(element).selected).remove();
      await elementUpdated(element);

      verifySelection(element, element.tabs[1]);
    });

    it('keeps current selection when removing other tabs', async () => {
      element.select('third');
      await elementUpdated(element);

      element.tabs.slice(0, 2).forEach((el) => el.remove());
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

  describe('issue-1140', () => {
    it('Tabs throw if a child tab is immediately appended', async () => {
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

      verifySelection(tabs, first(tabs.tabs));
      verifySelection(nestedTabs, last(nestedTabs.tabs));

      simulateClick(getTabDOM(first(nestedTabs.tabs)).header);
      await elementUpdated(tabs);

      verifySelection(tabs, first(tabs.tabs));
      verifySelection(nestedTabs, first(nestedTabs.tabs));

      simulateClick(getTabDOM(last(tabs.tabs)).header);
      await elementUpdated(tabs);

      verifySelection(tabs, last(tabs.tabs));
      verifySelection(nestedTabs, first(nestedTabs.tabs));
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
