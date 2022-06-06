import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { TemplateResult } from 'lit';
import sinon from 'sinon';
import {
  defineComponents,
  IgcTabsComponent,
  IgcTabComponent,
  IgcTabPanelComponent,
  IgcIconButtonComponent,
} from '../../index.js';

describe('Tabs component', () => {
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
      element = await fixture<IgcTabsComponent>(html`<igc-tabs>
        <igc-tab panel="first" disabled>Tab 1</igc-tab>
        <igc-tab panel="second">Tab 2</igc-tab>
        <igc-tab panel="third">Tab 3</igc-tab>
        <igc-tab panel="forth">Tab 4</igc-tab>
        <igc-tab-panel slot="panel" name="first">Content 1</igc-tab-panel>
        <igc-tab-panel slot="panel" name="second">Content 2</igc-tab-panel>
        <igc-tab-panel slot="panel" name="third">Content 2</igc-tab-panel>
      </igc-tabs>`);
    });

    const getSelectedTabs = () => {
      return [
        ...tabsHeaders(element).filter((i) =>
          i.attributes.getNamedItem('selected')
        ),
      ];
    };
    const getSelectedPanels = () => {
      return [
        ...tabsPanels(element).filter((i) => i.style.display === 'block'),
      ];
    };
    const tabsHeaders = (el: IgcTabsComponent) =>
      [...el.querySelectorAll('igc-tab')] as IgcTabComponent[];
    const tabsPanels = (el: IgcTabsComponent) =>
      [...el.querySelectorAll('igc-tab-panel')] as IgcTabPanelComponent[];
    const fireKeyboardEvent = (key: string) =>
      new KeyboardEvent('keydown', { key, bubbles: true, composed: true });
    const headersScrollContainer = (el: IgcTabsComponent) =>
      el.shadowRoot!.querySelector('[part="headers-scroll"]') as HTMLElement;

    it('is accessible', async () => {
      await expect(element).to.be.accessible();
    });

    it('selects the first enabled tab when nothing else is specified', async () => {
      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('second');
    });

    it('selects a tab on mouse click if it is not disabled', async () => {
      tabsHeaders(element)[0].click();
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('second');

      tabsHeaders(element)[2].click();
      await elementUpdated(element);

      expect(element.selected).to.eq('third');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('third');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('third');
    });

    it('`select` method selects the specified tab', async () => {
      element.select('third');
      await elementUpdated(element);

      expect(element.selected).to.eq('third');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('third');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('third');

      element.select(tabsHeaders(element)[1]);
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('second');
    });

    it('`select` method does not change currently selected tab if the specified value does not exist.', async () => {
      element.select('test');
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(getSelectedPanels().length).to.eq(1);
      expect(getSelectedPanels()[0].name).to.eq('second');
    });

    it('selects next/previous tab when pressing right/left arrow', async () => {
      tabsHeaders(element)[1].click();
      headersScrollContainer(element).dispatchEvent(
        fireKeyboardEvent('ArrowRight')
      );
      await elementUpdated(element);
      expect(element.selected).to.eq('third');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('third');

      headersScrollContainer(element).dispatchEvent(
        fireKeyboardEvent('ArrowLeft')
      );
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');

      headersScrollContainer(element).dispatchEvent(
        fireKeyboardEvent('ArrowLeft')
      );
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('forth');
    });

    it('selects first/last enabled tab when pressing home/end keys', async () => {
      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('End'));
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('forth');

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('Home'));
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
    });

    it('only focuses the corresponding tab when activation is manual and navigating with keyboard', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('End'));
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(element.querySelectorAll('igc-tab')[3]).to.eq(
        document.activeElement
      );
    });

    it('selects the focused tab when activation is set to `manual` and space/enter is pressed', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('End'));

      expect(element.selected).to.eq('second');

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent(' '));
      await elementUpdated(element);

      expect(getSelectedTabs()[0].panel).to.eq('forth');
      expect(element.selected).to.eq('forth');

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('Home'));

      expect(element.selected).to.eq('forth');

      headersScrollContainer(element).dispatchEvent(fireKeyboardEvent('Enter'));
      await elementUpdated(element);

      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(element.selected).to.eq('second');
    });

    it('selected indicator align with the selected tab', async () => {
      const indicator = element.shadowRoot?.querySelector(
        '[part = "selected-indicator"]'
      ) as HTMLElement;

      expect(indicator.style.transform).to.eq('translate(90px)');
      expect(indicator.style.width).to.eq(
        getSelectedTabs()[0].offsetWidth + 'px'
      );

      element.alignment = 'justify';
      await elementUpdated(element);

      element.select('forth');
      await elementUpdated(element);

      const offsetLeft = getSelectedTabs()[0].offsetLeft + 'px';
      expect(indicator.style.transform).to.eq(`translate(${offsetLeft})`);
      expect(indicator.style.width).to.eq(
        getSelectedTabs()[0].offsetWidth + 'px'
      );
    });

    it('emits `igcChange` when selecting item via mouse click', async () => {
      const eventSpy = sinon.spy(element, 'emitEvent');

      tabsHeaders(element)[3].click();
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', { detail: 'forth' });
    });

    it('emits `igcChange` when selecting item via arrow key press', async () => {
      const eventSpy = sinon.spy(element, 'emitEvent');

      headersScrollContainer(element).dispatchEvent(
        fireKeyboardEvent('ArrowLeft')
      );
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', { detail: 'third' });
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
        headersScrollContainer(element).offsetWidth /
          tabsHeaders(element).length
      );
      tabsHeaders(element).map((elem) =>
        diffs.push(elem.offsetWidth - expectedWidth)
      );
      const result = diffs.reduce((a, b) => a - b);
      expect(result).to.eq(0);
    });

    it('aligns tab headers properly when `alignment` is set to start', async () => {
      element.alignment = 'start';
      await elementUpdated(element);

      const widths: number[] = [];
      tabsHeaders(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth =
        headersScrollContainer(element).offsetWidth - result;
      const offsetRight =
        headersScrollContainer(element).offsetWidth -
        tabsHeaders(element)[3].offsetLeft -
        tabsHeaders(element)[3].offsetWidth;

      expect(tabsHeaders(element)[0].offsetLeft).to.eq(0);
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
      tabsHeaders(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth =
        headersScrollContainer(element).offsetWidth - result;
      const offsetRight =
        headersScrollContainer(element).offsetWidth -
        tabsHeaders(element)[3].offsetLeft -
        tabsHeaders(element)[3].offsetWidth;

      expect(
        Math.round(noTabsAreaWidth / 2) - tabsHeaders(element)[0].offsetLeft
      ).to.eq(0);
      expect(offsetRight - tabsHeaders(element)[0].offsetLeft).to.eq(0);
      expect(Math.abs(90 - widths[0])).to.eq(0);
      expect(Math.abs(90 - widths[1])).to.eq(0);
      expect(Math.abs(90 - widths[2])).to.eq(0);
      expect(Math.abs(90 - widths[3])).to.eq(0);
    });

    it('aligns tab headers properly when `alignment` is set to end', async () => {
      element.alignment = 'end';
      await elementUpdated(element);

      const widths: number[] = [];
      tabsHeaders(element).map((elem) => widths.push(elem.offsetWidth));

      const result = widths.reduce((a, b) => a + b);
      const noTabsAreaWidth =
        headersScrollContainer(element).offsetWidth - result;
      const offsetRight =
        headersScrollContainer(element).offsetWidth -
        tabsHeaders(element)[3].offsetLeft -
        tabsHeaders(element)[3].offsetWidth;

      expect(offsetRight).to.eq(0);
      expect(tabsHeaders(element)[0].offsetLeft - noTabsAreaWidth).to.eq(0);
      expect(Math.abs(90 - widths[0])).to.eq(0);
      expect(Math.abs(90 - widths[1])).to.eq(0);
      expect(Math.abs(90 - widths[2])).to.eq(0);
      expect(Math.abs(90 - widths[3])).to.eq(0);
    });
  });

  describe('Scrolling', () => {
    beforeEach(async () => {
      const headers: TemplateResult[] = [];
      const panels: TemplateResult[] = [];
      for (let i = 1; i <= 18; i++) {
        headers.push(
          html`<igc-tab panel=${i} .disabled=${i === 3}>Item ${i}{</igc-tab>`
        );
        panels.push(
          html`<igc-tab-panel slot="panel" name=${i}
            >Content ${i}</igc-tab-panel
          >`
        );
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
});
