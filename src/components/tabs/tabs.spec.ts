import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import {
  defineComponents,
  IgcTabsComponent,
  IgcTabComponent,
  IgcTabPanelComponent,
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

    const tabsHeaders = (el: IgcTabsComponent) =>
      [...el.querySelectorAll('igc-tab')] as IgcTabComponent[];
    const tabsPanels = (el: IgcTabsComponent) =>
      [...el.querySelectorAll('igc-tab-panel')] as IgcTabPanelComponent[];
    const fireKeyboardEvent = (key: string) =>
      new KeyboardEvent('keydown', { key, bubbles: true, composed: true });

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
      element.dispatchEvent(fireKeyboardEvent('ArrowRight'));
      await elementUpdated(element);
      expect(element.selected).to.eq('third');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('third');

      element.dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');

      element.dispatchEvent(fireKeyboardEvent('ArrowLeft'));
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('forth');
    });

    it('selects first/last enabled tab when pressing home/end keys', async () => {
      element.dispatchEvent(fireKeyboardEvent('End'));
      await elementUpdated(element);

      expect(element.selected).to.eq('forth');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('forth');

      element.dispatchEvent(fireKeyboardEvent('Home'));
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(getSelectedTabs().length).to.eq(1);
      expect(getSelectedTabs()[0].panel).to.eq('second');
    });

    it('only focuses the corresponding tab when activation is manual and navigating with keyboard', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      element.dispatchEvent(fireKeyboardEvent('End'));
      await elementUpdated(element);

      expect(element.selected).to.eq('second');
      expect(element.querySelectorAll('igc-tab')[3]).to.eq(
        document.activeElement
      );
    });

    it('selects the focused tab when activation is set to `manual` and space/enter is pressed', async () => {
      element.activation = 'manual';
      await elementUpdated(element);

      element.dispatchEvent(fireKeyboardEvent('End'));

      expect(element.selected).to.eq('second');

      element.dispatchEvent(fireKeyboardEvent(' '));
      await elementUpdated(element);

      expect(getSelectedTabs()[0].panel).to.eq('forth');
      expect(element.selected).to.eq('forth');

      element.dispatchEvent(fireKeyboardEvent('Home'));

      expect(element.selected).to.eq('forth');

      element.dispatchEvent(fireKeyboardEvent('Enter'));
      await elementUpdated(element);

      expect(getSelectedTabs()[0].panel).to.eq('second');
      expect(element.selected).to.eq('second');
    });

    //TODO tab.selected = false does not update the tabs.selected prop
    // it('hide selected indicator when no tab is selected', async () => {
    //     const indicator = element.shadowRoot?.querySelector('[part = "selected-indicator"]') as HTMLElement;

    //     expect(indicator.style.visibility).to.eq('visible');

    //     getSelectedTabs()[0].selected = false;
    //     await elementUpdated(element);

    //     expect(getSelectedTabs().length).to.eq(0);
    //     expect(element.selected).to.eq('');
    //     expect(indicator.style.visibility).to.eq('hidden');
    // });

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

      tabsHeaders(element)[1].click();
      await elementUpdated(element);

      element.dispatchEvent(fireKeyboardEvent('ArrowRight'));
      await elementUpdated(element);

      expect(eventSpy).calledWithExactly('igcChange', { detail: 'third' });
    });

    //TODO
    it('aligns tab headers properly when `alignment` is set to start/end/center/justify', async () => {});

    //TODO
    it('scroll tabs with scroll buttons', async () => {});

    //TODO
    it('hides scroll buttons when `alignment` is justify.', async () => {});

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
  });
});
