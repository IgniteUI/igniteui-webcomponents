import {
  elementUpdated,
  expect,
  fixture,
  html,
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
} from '../../internals/controllers/key-bindings.js';
import { defineComponents } from '../../internals/definitions/defineComponents.js';
import {
  simulateClick,
  simulateKeyboard,
} from '../../internals/testing/simulate.spec.js';
import { first, last } from '../../internals/utils/arrays.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
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

    // `aria-required-children` is suppressed as a false positive: axe walks the DOM and
    // sees each tab's panel nested in the tablist, while browsers expose the flat tree
    // where the roles resolve correctly. Screen readers announce the tabs as expected.
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
