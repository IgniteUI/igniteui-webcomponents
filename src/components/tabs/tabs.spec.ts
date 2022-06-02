import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
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
      element = await fixture<IgcTabsComponent>(html`<igc-tabs>
        <igc-tab panel="1">Item 1</igc-tab>
        <igc-tab panel="2">Item 2</igc-tab>
        <igc-tab panel="3" disabled>Item 3</igc-tab>
        <igc-tab panel="4">Item 4</igc-tab>
        <igc-tab panel="5">Item 5</igc-tab>
        <igc-tab panel="6">Item 6</igc-tab>
        <igc-tab panel="7">Item 7</igc-tab>
        <igc-tab panel="8">Item 8</igc-tab>
        <igc-tab panel="9">Item 9</igc-tab>
        <igc-tab panel="10">Item 10</igc-tab>
        <igc-tab panel="11">Item 11</igc-tab>
        <igc-tab panel="12">Item 12</igc-tab>
        <igc-tab panel="13">Item 13</igc-tab>
        <igc-tab panel="14">Item 14</igc-tab>
        <igc-tab panel="15">Item 15</igc-tab>
        <igc-tab panel="16">Item 16</igc-tab>
        <igc-tab panel="17">Item 17</igc-tab>
        <igc-tab panel="18">Item 18</igc-tab>
        <igc-tab-panel slot="panel" name="1">Content 1</igc-tab-panel>
        <igc-tab-panel slot="panel" name="2">Content 2</igc-tab-panel>
        <igc-tab-panel slot="panel" name="3">Content 3</igc-tab-panel>
        <igc-tab-panel slot="panel" name="4">Content 4</igc-tab-panel>
        <igc-tab-panel slot="panel" name="5">Content 5</igc-tab-panel>
        <igc-tab-panel slot="panel" name="6">Content 6</igc-tab-panel>
        <igc-tab-panel slot="panel" name="7">Content 7</igc-tab-panel>
        <igc-tab-panel slot="panel" name="8">Content 8</igc-tab-panel>
        <igc-tab-panel slot="panel" name="9">Content 9</igc-tab-panel>
        <igc-tab-panel slot="panel" name="10">Content 10</igc-tab-panel>
        <igc-tab-panel slot="panel" name="11">Content 11</igc-tab-panel>
        <igc-tab-panel slot="panel" name="12">Content 12</igc-tab-panel>
        <igc-tab-panel slot="panel" name="13">Content 13</igc-tab-panel>
        <igc-tab-panel slot="panel" name="14">Content 14</igc-tab-panel>
        <igc-tab-panel slot="panel" name="15">Content 15</igc-tab-panel>
        <igc-tab-panel slot="panel" name="16">Content 16</igc-tab-panel>
        <igc-tab-panel slot="panel" name="17">Content 17</igc-tab-panel>
        <igc-tab-panel slot="panel" name="18">Content 18</igc-tab-panel>
      </igc-tabs>`);
    });

    const startScrollButton = (el: IgcTabsComponent) =>
      el.shadowRoot?.querySelector(
        'igc-icon-button[part="start-scroll-button"]'
      ) as HTMLElement;

    const endScrollButton = (el: IgcTabsComponent) =>
      el.shadowRoot?.querySelector(
        'igc-icon-button[part="end-scroll-button"]'
      ) as HTMLElement;

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
      expect(endScrollButton(element)).to.not.be.null;
      expect((endScrollButton(element) as IgcIconButtonComponent).disabled).to
        .be.true;

      startScrollButton(element).click();
      await elementUpdated(element);

      expect(endScrollButton(element)).to.not.be.null;
      expect((endScrollButton(element) as IgcIconButtonComponent).disabled).to
        .be.false;
    });

    it('scrolls to end when end scroll button is clicked', async () => {
      element.select('1');
      await elementUpdated(element);
      expect(startScrollButton(element)).to.not.be.null;
      expect((startScrollButton(element) as IgcIconButtonComponent).disabled).to
        .be.true;

      endScrollButton(element).click();
      await elementUpdated(element);

      expect(startScrollButton(element)).to.not.be.null;
      expect((startScrollButton(element) as IgcIconButtonComponent).disabled).to
        .be.false;
    });
  });
});
