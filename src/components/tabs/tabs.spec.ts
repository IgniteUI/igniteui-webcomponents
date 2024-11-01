import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';

import {
  type IgcIconButtonComponent,
  IgcTabComponent,
  IgcTabPanelComponent,
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
import { first, last } from '../common/util.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';

describe('Tabs component', () => {
  // Helper functions
  const getTabs = (tabs: IgcTabsComponent) =>
    Array.from(
      tabs.querySelectorAll<IgcTabComponent>(
        `:scope > ${IgcTabComponent.tagName}`
      )
    );

  const getPanels = (tabs: IgcTabsComponent) =>
    Array.from(tabs.querySelectorAll(IgcTabPanelComponent.tagName));

  const getSelectedTab = (tabs: IgcTabsComponent) => {
    const collection = getTabs(tabs).filter((tab) => tab.selected);
    expect(collection.length).to.equal(1);
    return collection.at(0) as IgcTabComponent;
  };

  const getSelectedPanel = (tabs: IgcTabsComponent) => {
    const collection = getPanels(tabs).filter(
      (panel) => panel.hasAttribute('hidden') === false
    );
    expect(collection.length).to.equal(1);
    return collection.at(0) as IgcTabPanelComponent;
  };

  const getScrollContainer = (tabs: IgcTabsComponent) =>
    tabs.renderRoot.querySelector('[part="headers-scroll"]') as HTMLElement;

  const fireKeyboardEvent = (key: string) =>
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true });

  const verifySelection = (element: IgcTabsComponent, selection: string) => {
    expect(element.selected).to.equal(selection);
    expect(getSelectedTab(element).panel).to.equal(selection);
    expect(getSelectedPanel(element).id).to.equal(selection);
  };

  before(() => {
    defineComponents(IgcTabsComponent, IgcTabComponent, IgcTabPanelComponent);
  });

  let element: IgcTabsComponent;

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`<igc-tabs></igc-tabs>`);
    });

    it('is initialized with the proper default values', async () => {
      expect(document.querySelector('igc-tabs')).to.exist;
      expect(element.selected).to.be.empty;
      expect(element.alignment).to.eq('start');
      expect(element.activation).to.eq('auto');
    });
  });

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(
        html`<igc-tabs>
          <igc-tab panel="first" disabled>Tab 1</igc-tab>
          <igc-tab panel="second">Tab 2</igc-tab>
          <igc-tab panel="third">Tab 3</igc-tab>
          <igc-tab panel="forth">Tab 4</igc-tab>
          <igc-tab-panel id="first">Content 1</igc-tab-panel>
          <igc-tab-panel id="second">Content 2</igc-tab-panel>
          <igc-tab-panel id="third">Content 2</igc-tab-panel>
        </igc-tabs>`
      );
    });

    it('is accessible', async () => {
      await expect(element).to.be.accessible();
    });

    it('selects the first enabled tab when nothing else is specified', async () => {
      verifySelection(element, 'second');
    });

    it('selects the tab with selected attribute in the template', async () => {
      const tab = await fixture<IgcTabsComponent>(
        html`<igc-tabs>
          <igc-tab panel="first">Tab 1</igc-tab>
          <igc-tab panel="second" selected>Tab 2</igc-tab>
          <igc-tab panel="third">Tab 3</igc-tab>
          <igc-tab-panel id="first">Content 1</igc-tab-panel>
          <igc-tab-panel id="second">Content 2</igc-tab-panel>
          <igc-tab-panel id="third">Content 3</igc-tab-panel>
        </igc-tabs>`
      );
      verifySelection(tab, 'second');
      expect(
        (tab as any).panels.map((panel: any) => panel.hasAttribute('hidden'))
      ).deep.equal([true, false, true]);
    });

    it('selects a tab on mouse click if it is not disabled', async () => {
      getTabs(element)[0].click();
      await elementUpdated(element);

      verifySelection(element, 'second');

      getTabs(element)[2].click();
      await elementUpdated(element);

      verifySelection(element, 'third');
    });

    it('`select` method selects the specified tab', async () => {
      element.select('third');
      await elementUpdated(element);

      verifySelection(element, 'third');

      element.select(getTabs(element)[1].panel);
      await elementUpdated(element);

      verifySelection(element, 'second');
    });

    it('`select` method does not change currently selected tab if the specified value does not exist.', async () => {
      element.select('test');
      await elementUpdated(element);

      verifySelection(element, 'second');
    });

    it('selects next/previous tab when pressing right/left arrow', async () => {
      const container = getScrollContainer(element);

      simulateClick(getTabs(element)[1]);
      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      verifySelection(element, 'third');

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      verifySelection(element, 'second');

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTab(element).panel).to.eq('forth');
    });

    it('selects next/previous tab when pressing right/left arrow (RTL)', async () => {
      const container = getScrollContainer(element);

      element.dir = 'rtl';
      getTabs(element)[1].focus();
      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTab(element).panel).to.eq('forth');

      simulateKeyboard(container, arrowRight);
      await elementUpdated(element);

      expect(element.selected).to.eq('third');
      expect(getSelectedTab(element).panel).to.eq('third');

      simulateKeyboard(container, arrowLeft);
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTab(element).panel).to.eq('forth');
    });

    it('selects first/last enabled tab when pressing home/end keys', async () => {
      const container = getScrollContainer(element);
      simulateKeyboard(container, endKey);
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTab(element).panel).to.eq('forth');

      simulateKeyboard(container, homeKey);
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTab(element).panel).to.eq('second');
    });

    it('only focuses the corresponding tab when activation is manual and navigating with keyboard', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      simulateKeyboard(getScrollContainer(element), endKey);
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(element.querySelectorAll('igc-tab')[3]).to.eq(
        document.activeElement
      );
    });

    it('selects the focused tab when activation is set to `manual` and space/enter is pressed', async () => {
      const container = getScrollContainer(element);

      element.activation = 'manual';
      simulateKeyboard(container, endKey);
      await elementUpdated(element);

      expect(element.selected).to.eq('second');

      simulateKeyboard(container, spaceBar);
      await elementUpdated(element);

      expect(getSelectedTab(element).panel).to.eq('forth');
      expect(element.selected).to.eq('forth');

      simulateKeyboard(container, homeKey);
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');

      simulateKeyboard(container, enterKey);
      await elementUpdated(element);

      expect(getSelectedTab(element).panel).to.eq('second');
      expect(element.selected).to.eq('second');
    });

    it('selected indicator align with the selected tab', async () => {
      const indicator = element.shadowRoot?.querySelector(
        '[part = "selected-indicator"]'
      ) as HTMLElement;

      expect(indicator.style.transform).to.eq('translate(90px)');
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).offsetWidth}px`
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('forth');
      await elementUpdated(element);

      const offsetLeft = `${getSelectedTab(element).offsetLeft}px`;
      expect(indicator.style.transform).to.eq(`translate(${offsetLeft})`);
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).offsetWidth}px`
      );
    });

    it('selected indicator align with the selected tab (RTL)', async () => {
      element.dir = 'rtl';
      await elementUpdated(element);

      const indicator = element.shadowRoot?.querySelector(
        '[part = "selected-indicator"]'
      ) as HTMLElement;

      expect(indicator.style.transform).to.eq('translate(90px)');
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).offsetWidth}px`
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('forth');
      await elementUpdated(element);

      const offsetLeft = `${
        getSelectedTab(element).offsetLeft +
        getSelectedTab(element).offsetWidth -
        element.clientWidth
      }px`;
      expect(indicator.style.transform).to.eq(`translate(${offsetLeft})`);
      expect(indicator.style.width).to.eq(
        `${getSelectedTab(element).offsetWidth}px`
      );
    });

    it('emits `igcChange` when selecting item via mouse click', async () => {
      const eventSpy = spy(element, 'emitEvent');

      getTabs(element)[3].click();
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: getSelectedTab(element),
      });
    });

    it('emits `igcChange` when selecting item via arrow key press', async () => {
      const eventSpy = spy(element, 'emitEvent');

      getScrollContainer(element).dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', {
        detail: getSelectedTab(element),
      });
    });

    it('does not display scroll buttons if alignment is justify', async () => {
      const startScrollButton = element.shadowRoot?.querySelector(
        'igc-icon-button[part="start-scroll-button"]'
      );

      const endScrollButton = element.shadowRoot?.querySelector(
        'igc-icon-button[part="end-scroll-button"]'
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      expect(startScrollButton).to.be.null;
      expect(endScrollButton).to.be.null;
    });

    it('aligns tab headers properly when `alignment` is set to justify', async () => {
      element.alignment = 'justify';
      await elementUpdated(element);

      const diffs: number[] = [];
      const expectedWidth = Math.round(
        getScrollContainer(element).offsetWidth / getTabs(element).length
      );
      getTabs(element).map((elem) =>
        diffs.push(elem.offsetWidth - expectedWidth)
      );
      const result = diffs.reduce((a, b) => a - b);
      expect(result).to.eq(0);
    });

    it('aligns tab headers properly when `alignment` is set to start', async () => {
      element.alignment = 'start';
      await elementUpdated(element);

      const widths: number[] = [];
      getTabs(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth = getScrollContainer(element).offsetWidth - result;
      const offsetRight =
        getScrollContainer(element).offsetWidth -
        getTabs(element)[3].offsetLeft -
        getTabs(element)[3].offsetWidth;

      expect(getTabs(element)[0].offsetLeft).to.eq(0);
      expect(offsetRight - noTabsAreaWidth).to.eq(0);
      expect(Math.abs(90 - widths[0])).to.eq(0);
      expect(Math.abs(90 - widths[1])).to.eq(0);
      expect(Math.abs(90 - widths[2])).to.eq(0);
      expect(Math.abs(90 - widths[3])).to.eq(0);
    });

    it('aligns tab headers properly when `alignment` is set to center', async () => {
      element.alignment = 'center';
      await elementUpdated(element);

      const widths: number[] = [];
      getTabs(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth = getScrollContainer(element).offsetWidth - result;
      const offsetRight =
        getScrollContainer(element).offsetWidth -
        getTabs(element)[3].offsetLeft -
        getTabs(element)[3].offsetWidth;

      expect(
        Math.round(noTabsAreaWidth / 2) - getTabs(element)[0].offsetLeft
      ).to.eq(0);
      expect(offsetRight - getTabs(element)[0].offsetLeft).to.eq(0);
      expect(Math.abs(90 - widths[0])).to.eq(0);
      expect(Math.abs(90 - widths[1])).to.eq(0);
      expect(Math.abs(90 - widths[2])).to.eq(0);
      expect(Math.abs(90 - widths[3])).to.eq(0);
    });

    it('aligns tab headers properly when `alignment` is set to end', async () => {
      element.alignment = 'end';
      await elementUpdated(element);

      const widths: number[] = [];
      getTabs(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth = getScrollContainer(element).offsetWidth - result;
      const offsetRight =
        getScrollContainer(element).offsetWidth -
        getTabs(element)[3].offsetLeft -
        getTabs(element)[3].offsetWidth;

      expect(offsetRight).to.eq(0);
      expect(getTabs(element)[0].offsetLeft - noTabsAreaWidth).to.eq(0);
      expect(Math.abs(90 - widths[0])).to.eq(0);
      expect(Math.abs(90 - widths[1])).to.eq(0);
      expect(Math.abs(90 - widths[2])).to.eq(0);
      expect(Math.abs(90 - widths[3])).to.eq(0);
    });

    it('updates selection through tab element `selected` attribute', async () => {
      getTabs(element).at(2)!.selected = true;
      await elementUpdated(element);

      expect(element.selected).to.eq(getTabs(element)[2].panel);
    });

    it('updates selection state when removing selected tab', async () => {
      element.select('third');
      await elementUpdated(element);

      getSelectedTab(element).remove();
      await elementUpdated(element);

      expect(element.selected).to.equal('');
      expect(
        element.querySelectorAll(`${IgcTabComponent.tagName}[selected]`).length
      ).to.equal(0);
    });

    it('updates selected state when adding tabs at runtime', async () => {
      let tab = document.createElement(IgcTabComponent.tagName);
      tab.panel = 'new-selection';
      tab.selected = true;

      element.appendChild(tab);
      await elementUpdated(element);

      expect(element.selected).to.eq(tab.panel);

      tab = document.createElement(IgcTabComponent.tagName);
      tab.panel = 'new-selection-2';

      element.appendChild(tab);
      await elementUpdated(element);

      expect(element.selected).not.to.eq(tab.panel);
    });

    it('keeps current selection when removing other tabs', async () => {
      element.select('third');
      await elementUpdated(element);

      getTabs(element)
        .slice(0, 2)
        .forEach((el) => el.remove());
      await elementUpdated(element);

      expect(element.selected).to.equal('third');
      expect(getSelectedTab(element).panel).to.equal(element.selected);
    });
  });

  describe('Scrolling', () => {
    beforeEach(async () => {
      const headers: TemplateResult[] = [];
      const panels: TemplateResult[] = [];
      for (let i = 1; i <= 18; i++) {
        headers.push(
          html`<igc-tab panel=${i} .disabled=${i === 3}>Item ${i}</igc-tab>`
        );
        panels.push(html`<igc-tab-panel id=${i}>Content ${i}</igc-tab-panel>`);
      }
      element = await fixture<IgcTabsComponent>(
        html`<igc-tabs>${headers}${panels}</igc-tabs>`
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
      header.textContent =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
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

  describe('', () => {
    beforeEach(async () => {
      element = await fixture<IgcTabsComponent>(html`
        <igc-tabs>
          <igc-tab></igc-tab>
          <igc-tab></igc-tab>
          <igc-tab panel="special-offer"></igc-tab>
          <igc-tab></igc-tab>
          <igc-tab></igc-tab>

          <igc-tab-panel></igc-tab-panel>
          <igc-tab-panel></igc-tab-panel>
          <igc-tab-panel id="special-offer"></igc-tab-panel>
          <igc-tab-panel id="discounts"></igc-tab-panel>
        </igc-tabs>
      `);
    });

    it('correctly wires tab to panel relations based on provided attributes', async () => {
      const [tabs, panels] = [getTabs(element), getPanels(element)];

      // Check all but the last since it has no panel
      tabs.slice(0, -1).forEach((tab, index) => {
        expect(tab.panel).to.equal(panels.at(index)!.id);
      });

      // Check the last one for auto-generated `panel` prop.
      expect(tabs.at(-1)?.panel).to.not.equal('');
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
          <igc-tab>1</igc-tab>
          <igc-tab>2</igc-tab>
          <igc-tab-panel>
            Panel 1
            <igc-tabs>
              <igc-tab>1.1</igc-tab>
              <igc-tab selected>1.2</igc-tab>
              <igc-tab-panel>Panel 1.1</igc-tab-panel>
              <igc-tab-panel>Panel 1.2</igc-tab-panel>
            </igc-tabs>
          </igc-tab-panel>
          <igc-tab-panel>Panel 2</igc-tab-panel>
        </igc-tabs>
      `);

      const nestedTabs = tabs.querySelector(IgcTabsComponent.tagName)!;

      expect(getSelectedTab(tabs).textContent).to.equal('1');
      expect(getSelectedTab(nestedTabs).textContent).to.equal('1.2');

      simulateClick(first(getTabs(nestedTabs)));
      await elementUpdated(tabs);

      expect(getSelectedTab(tabs).textContent).to.equal('1');
      expect(getSelectedTab(nestedTabs).textContent).to.equal('1.1');

      simulateClick(last(getTabs(tabs)));
      await elementUpdated(tabs);

      expect(getSelectedTab(tabs).textContent).to.equal('2');
      expect(getSelectedTab(nestedTabs).textContent).to.equal('1.1');
    });
  });
});
