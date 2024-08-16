import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { spy } from 'sinon';

import type { TemplateResult } from 'lit';
import {
  type IgcIconButtonComponent,
  IgcTabComponent,
  IgcTabsComponent,
  defineComponents,
} from '../../index.js';
import {
  arrowLeft,
  arrowRight,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '../common/controllers/key-bindings.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';

describe('Tabs component', () => {
  // Helper functions
  const getTabs = (tabs: IgcTabsComponent) =>
    Array.from(tabs.querySelectorAll(IgcTabComponent.tagName));

  const getSelectedTab = (tabs: IgcTabsComponent) => {
    const collection = getTabs(tabs).filter((tab) => tab.selected);
    expect(collection.length).to.equal(1);
    return collection.at(0) as IgcTabComponent;
  };

  const getScrollContainer = (tabs: IgcTabsComponent) =>
    tabs.renderRoot.querySelector('[part="tabs"]') as HTMLElement;

  const getTabList = (tabs: IgcTabsComponent) =>
    tabs.renderRoot.querySelector('[role="tablist"]') as HTMLElement;

  const fireKeyboardEvent = (key: string) =>
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true });

  const verifySelection = (tabs: IgcTabsComponent, tab: IgcTabComponent) => {
    expect(getSelectedTab(tabs).isEqualNode(tab)).to.be.true;
    expect(tabs?.activeTab?.isEqualNode(tab)).to.be.true;
    expect(getComputedStyle(tab.contentBody).display).to.equal('flex');
  };

  before(() => {
    defineComponents(IgcTabComponent, IgcTabsComponent);
  });

  let element: IgcTabsComponent;

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`<igc-tabs></igc-tabs>`);
    });

    it('is initialized with the proper default values', async () => {
      expect(document.querySelector('igc-tabs')).to.exist;
      expect(element.activeTab).to.be.undefined;
      expect(element.alignment).to.eq('start');
      expect(element.activation).to.eq('auto');
      expect(getTabs(element)).to.be.empty;
    });
  });

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(
        html`<igc-tabs>
          <igc-tab label="Tab 1" disabled>Content 1</igc-tab>
          <igc-tab label="Tab 2">Content 2</igc-tab>
          <igc-tab id="third"
            ><p slot="label">Tab 3</p>
            Content 3</igc-tab
          >
          <igc-tab><p slot="label">Tab 4</p></igc-tab>
        </igc-tabs>`
      );
    });

    it('is accessible', async () => {
      await expect(element).to.be.accessible({
        ignoredRules: ['aria-required-children'],
      });
    });

    it('renders the IgcTabComponents', () => {
      expect(getTabs(element)).to.have.length(4);
    });

    it('selects the first enabled tab when nothing else is specified', async () => {
      verifySelection(element, getTabs(element)[1]);
    });

    it('selects the tab with selected attribute in the template', async () => {
      const tabsComponent = await fixture<IgcTabsComponent>(
        html`<igc-tabs>
          <igc-tab label="Tab 1">Content 1</igc-tab>
          <igc-tab label="Tab 2" selected>Content 2</igc-tab>
          <igc-tab
            ><p slot="label">Tab 3</p>
            Content 3</igc-tab
          >
        </igc-tabs>`
      );
      verifySelection(tabsComponent, getTabs(tabsComponent)[1]);
      expect(
        tabsComponent.tabs.map(
          (tab: IgcTabComponent) => getComputedStyle(tab.contentBody).display
        )
      ).deep.equal(['none', 'flex', 'none']);
    });

    it('selects a tab on mouse click if it is not disabled', async () => {
      getTabs(element)[0].header.click();
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);

      getTabs(element)[2].header.click();
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);
    });

    it('`select` method selects the specified tab', async () => {
      element.select('third');
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      element.select(getTabs(element)[1]);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('`select` method does not change currently selected tab if the specified value does not exist.', async () => {
      element.select('test');
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('keydown does not select another tab when focus is not over tab header', async () => {
      const input = document.getElementById('input');
      input?.focus();

      input?.dispatchEvent(fireKeyboardEvent('ArrowRight'));
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('selects next/previous tab when pressing right/left arrow', async () => {
      const container = getTabList(element);

      simulateClick(getTabs(element)[1]);
      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);
    });

    it('selects next/previous tab when pressing right/left arrow (RTL)', async () => {
      const container = getTabList(element);

      element.dir = 'rtl';
      getTabs(element)[1].focus();
      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);

      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);
    });

    it('selects first/last enabled tab when pressing home/end keys', async () => {
      const container = getTabList(element);
      simulateKeyboard(container, endKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);

      simulateKeyboard(container, homeKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('only focuses the corresponding tab when activation is manual and navigating with keyboard', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      simulateKeyboard(getTabList(element), endKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
      expect(element.querySelectorAll('igc-tab')[3]).to.eq(
        document.activeElement
      );
    });

    it('selects the focused tab when activation is set to `manual` and space/enter is pressed', async () => {
      const container = getTabList(element);

      element.activation = 'manual';
      simulateKeyboard(container, endKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);

      simulateKeyboard(container, spaceBar);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);

      simulateKeyboard(container, homeKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[3]);

      simulateKeyboard(container, enterKey);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('selected indicator align with the selected tab', async () => {
      const indicator = element.shadowRoot?.querySelector(
        '[part="selected-indicator"] span'
      ) as HTMLElement;

      let offsetLeft = `${getSelectedTab(element).header.offsetLeft}px`;
      expect(indicator.style.transform).to.eq(`translate(${offsetLeft})`);
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).header.offsetWidth}px`
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('third');
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      offsetLeft = `${getSelectedTab(element).header.offsetLeft}px`;
      expect(indicator.style.transform).to.eq(`translate(${offsetLeft})`);
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).header.offsetWidth}px`
      );
    });

    it('selected indicator align with the selected tab (RTL)', async () => {
      element.dir = 'rtl';
      await elementUpdated(element);

      const indicator = element.shadowRoot?.querySelector(
        '[part="selected-indicator"] span'
      ) as HTMLElement;

      let activeTabHeader = getSelectedTab(element).header;
      let activeTabOffesetLeft = activeTabHeader.offsetLeft;
      let activeTabWidth = activeTabHeader.getBoundingClientRect().width;
      const scrollContainerWidth =
        getScrollContainer(element).getBoundingClientRect().width;

      expect(indicator.style.transform).to.eq(
        `translate(${activeTabOffesetLeft - scrollContainerWidth + activeTabWidth}px)`
      );

      expect(indicator.style.width).to.eq(`${activeTabWidth}px`);

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('third');
      await elementUpdated(element);

      activeTabHeader = getSelectedTab(element).header;
      activeTabOffesetLeft = activeTabHeader.offsetLeft;
      activeTabWidth = activeTabHeader.getBoundingClientRect().width;

      expect(indicator.style.transform).to.eq(
        `translate(${activeTabOffesetLeft - scrollContainerWidth + activeTabWidth}px)`
      );

      expect(indicator.style.width).to.eq(`${activeTabWidth}px`);
    });

    it('emits `igcChange` when selecting item via mouse click', async () => {
      const eventSpy = spy(element, 'emitEvent');

      getTabs(element)[3].header.click();
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: getSelectedTab(element),
      });
    });

    it('emits `igcChange` when selecting item via arrow key press', async () => {
      const eventSpy = spy(element, 'emitEvent');

      getTabs(element)[1].header.dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: getSelectedTab(element),
      });
    });

    // it('aligns tab headers properly when `alignment` is set to justify', async () => {
    //   element.alignment = 'justify';
    //   await elementUpdated(element);

    //   const diffs: number[] = [];
    //   const expectedWidth = Math.round(
    //     getScrollContainer(element).offsetWidth / getTabs(element).length
    //   );
    //   getTabs(element).map((elem) =>
    //     diffs.push(elem.header.offsetWidth - expectedWidth)
    //   );

    //   const result = diffs.reduce((a, b) => a - b);
    //   expect(result).to.eq(0);
    // });

    // it('aligns tab headers properly when `alignment` is set to start', async () => {
    //   const widths: number[] = [];
    //   getTabs(element).map((elem) => widths.push(elem.header.offsetWidth));

    //   const result = widths.reduce((a, b) => a + b);
    //   const noTabsAreaWidth = getScrollContainer(element).offsetWidth - result;
    //   const offsetRight =
    //     getScrollContainer(element).offsetWidth -
    //     getTabs(element)[3].header.offsetLeft -
    //     getTabs(element)[3].header.offsetWidth;

    //   expect(getTabs(element)[0].header.offsetLeft).to.eq(0);
    //   expect(offsetRight - noTabsAreaWidth).to.eq(0);
    //   expect(Math.abs(90 - widths[0])).to.eq(0);
    //   expect(Math.abs(90 - widths[1])).to.eq(0);
    //   expect(Math.abs(90 - widths[2])).to.eq(0);
    //   expect(Math.abs(90 - widths[3])).to.eq(0);
    // });

    // it('aligns tab headers properly when `alignment` is set to center', async () => {
    //   element.alignment = 'center';
    //   await elementUpdated(element);

    //   const widths: number[] = [];
    //   getTabs(element).map((elem) => widths.push(elem.header.offsetWidth));

    //   const result = widths.reduce((a, b) => a + b);
    //   const noTabsAreaWidth = getScrollContainer(element).offsetWidth - result;
    //   const offsetRight =
    //     getScrollContainer(element).offsetWidth -
    //     getTabs(element)[3].header.offsetLeft -
    //     getTabs(element)[3].header.offsetWidth;

    //   expect(
    //     Math.round(noTabsAreaWidth / 2) - getTabs(element)[0].header.offsetLeft
    //   ).to.eq(0);
    //   expect(offsetRight - getTabs(element)[0].header.offsetLeft).to.eq(0);
    //   expect(Math.abs(90 - widths[0])).to.eq(0);
    //   expect(Math.abs(90 - widths[1])).to.eq(0);
    //   expect(Math.abs(90 - widths[2])).to.eq(0);
    //   expect(Math.abs(90 - widths[3])).to.eq(0);
    // });

    it('updates selection through tab element `selected` attribute', async () => {
      getTabs(element).at(2)!.selected = true;
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);
    });

    it('updates selection state when removing selected tab', async () => {
      element.select('third');
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);
      getSelectedTab(element).remove();
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[1]);
    });

    it('keeps current selection when removing other tabs', async () => {
      element.select('third');
      await elementUpdated(element);

      getTabs(element)
        .slice(0, 2)
        .forEach((el) => el.remove());
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[0]);
    });

    it('updates selected state when adding tabs at runtime', async () => {
      let tab = document.createElement(IgcTabComponent.tagName);
      element.insertBefore(tab, element.children[1]);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      tab = document.createElement(IgcTabComponent.tagName);
      element.appendChild(tab);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      tab = await fixture<IgcTabComponent>(html`<igc-tab>New Tab</igc-tab>`);
      tab.selected = true;
      element.insertBefore(tab, element.children[2]);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[2]);

      tab = await fixture<IgcTabComponent>(html`<igc-tab>New Tab</igc-tab>`);
      tab.selected = true;
      element.appendChild(tab);
      await elementUpdated(element);

      verifySelection(element, getTabs(element)[7]);
    });
  });

  describe('Scrolling', () => {
    beforeEach(async () => {
      const tabs: TemplateResult[] = [];
      for (let i = 1; i <= 18; i++) {
        tabs.push(
          html`<igc-tab id=${i} .label=${`Item ${i}`} .disabled=${i === 3}
            >Content ${i}</igc-tab
          >`
        );
      }
      element = await fixture<IgcTabsComponent>(
        html`<igc-tabs>${tabs}</igc-tabs>`
      );
    });

    const startScrollButton = (el: IgcTabsComponent) =>
      el.shadowRoot?.querySelector(
        'igc-icon-button[part="start-scroll-button"]'
      ) as IgcIconButtonComponent;

    const endScrollButton = (el: IgcTabsComponent) =>
      el.shadowRoot?.querySelector(
        'igc-icon-button[part="end-scroll-button"]'
      ) as IgcIconButtonComponent;

    it('displays scroll buttons', async () => {
      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;

      element.select('18');
      await elementUpdated(element);

      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;

      element.select('9');
      await elementUpdated(element);
      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;
    });

    it('does display scroll buttons if alignment is justify', async () => {
      element.alignment = 'justify';
      await elementUpdated(element);

      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;
    });

    it('scrolls to start when start scroll button is clicked', async () => {
      element.select('18');
      await elementUpdated(element);

      await waitUntil(
        () => endScrollButton(element).disabled,
        'End scroll button is not disabled at end of scroll'
      );

      startScrollButton(element).click();
      await elementUpdated(element);

      await waitUntil(
        () => !endScrollButton(element).disabled,
        'End scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls to end when end scroll button is clicked', async () => {
      element.select('1');

      await elementUpdated(element);
      await waitUntil(
        () => startScrollButton(element).disabled,
        'Start scroll button is not disabled at end of scroll'
      );

      endScrollButton(element).click();

      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton(element).disabled,
        'Start scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls when tab is partially visible', async () => {
      const header = element.querySelector('igc-tab')!;
      header.label = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
      element.style.width = '300px';
      await elementUpdated(element);

      endScrollButton(element).click();
      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton(element).disabled,
        'Start scroll button is disabled on opposite scroll'
      );
    });

    it('displays scroll buttons (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;

      element.select('18');
      await elementUpdated(element);

      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;

      element.select('9');
      await elementUpdated(element);
      expect(startScrollButton(element)).to.not.be.null;
      expect(endScrollButton(element)).to.not.be.null;
    });

    it('scrolls to start when start scroll button is clicked (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      element.select('18');

      await elementUpdated(element);
      await waitUntil(
        () => endScrollButton(element).disabled,
        'End scroll button is not disabled at end of scroll'
      );

      startScrollButton(element).click();

      await elementUpdated(element);
      await waitUntil(
        () => !endScrollButton(element).disabled,
        'End scroll button is disabled on opposite scroll'
      );
    });

    it('scrolls to end when end scroll button is clicked (RTL)', async () => {
      element.setAttribute('dir', 'rtl');
      await elementUpdated(element);

      element.select('1');

      await elementUpdated(element);
      await waitUntil(
        () => startScrollButton(element).disabled,
        'Start scroll button is not disabled at end of scroll'
      );

      endScrollButton(element).click();

      await elementUpdated(element);
      await waitUntil(
        () => !startScrollButton(element).disabled,
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
});
