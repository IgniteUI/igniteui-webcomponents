import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterComponent from './splitter.js';
import IgcSplitterBarComponent from './splitter-bar.js';
import IgcSplitterPaneComponent from './splitter-pane.js';

describe('Splitter', () => {
  before(() => {
    defineComponents(
      IgcSplitterComponent,
      IgcSplitterPaneComponent,
      IgcSplitterBarComponent
    );
  });

  let splitter: IgcSplitterComponent;

  beforeEach(async () => {
    splitter = await fixture<IgcSplitterComponent>(createSplitter());
  });

  describe('Rendering', () => {
    it('should render', () => {
      expect(splitter).to.exist;
      expect(splitter).to.be.instanceOf(IgcSplitterComponent);
    });

    it('is accessible', async () => {
      await expect(splitter).to.be.accessible();
      await expect(splitter).shadowDom.to.be.accessible();
    });

    it('should render a split bar for each splitter pane except the last one', async () => {
      await elementUpdated(splitter);

      expect(splitter.panes).to.have.lengthOf(3);

      const bars = getSplitterBars(splitter);
      expect(bars).to.have.lengthOf(2);

      bars.forEach((bar, index) => {
        const pane = splitter.panes[index];
        const paneBase = getSplitterPaneBase(pane) as HTMLElement;
        expect(bar.previousElementSibling).to.equal(paneBase);
      });
    });

    it('should have default horizontal orientation', () => {
      expect(splitter.orientation).to.equal('horizontal');
      expect(splitter.hasAttribute('orientation')).to.be.true;
      expect(splitter.getAttribute('orientation')).to.equal('horizontal');
    });

    it('should change orientation to vertical', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(splitter.orientation).to.equal('vertical');
      expect(splitter.getAttribute('orientation')).to.equal('vertical');
    });

    it('should render nested splitters correctly', async () => {
      const nestedSplitter = await fixture<IgcSplitterComponent>(
        createNestedSplitter()
      );
      await elementUpdated(nestedSplitter);

      expect(nestedSplitter.panes).to.have.lengthOf(2);
      expect(nestedSplitter.orientation).to.equal('horizontal');

      const outerBars = getSplitterBars(nestedSplitter);
      expect(outerBars).to.have.lengthOf(1);

      const firstPane = nestedSplitter.panes[0];
      const leftSplitter = firstPane.querySelector(
        IgcSplitterComponent.tagName
      ) as IgcSplitterComponent;

      expect(leftSplitter).to.exist;
      expect(leftSplitter.orientation).to.equal('vertical');

      expect(leftSplitter.panes).to.have.lengthOf(2);

      const leftBars = getSplitterBars(leftSplitter);
      expect(leftBars).to.have.lengthOf(1);

      const secondPane = nestedSplitter.panes[1];
      const rightSplitter = secondPane.querySelector(
        IgcSplitterComponent.tagName
      ) as IgcSplitterComponent;

      expect(rightSplitter).to.exist;
      expect(rightSplitter.orientation).to.equal('vertical');

      expect(rightSplitter.panes).to.have.lengthOf(2);

      const rightBars = getSplitterBars(rightSplitter);
      expect(rightBars).to.have.lengthOf(1);
    });

    it('should not display the bar elements if the splitter is nonCollapsible', async () => {
      splitter.nonCollapsible = true;
      await elementUpdated(splitter);

      const bars = getSplitterBars(splitter);
      bars.forEach((bar) => {
        const base = bar.shadowRoot!.querySelector(
          '[part~="base"]'
        ) as HTMLElement;
        expect(base.children).to.have.lengthOf(0);
      });
    });

    it('should set a default cursor on the bar in case any of its siblings is not resizable or collapsed', async () => {
      const firstPane = splitter.panes[0];
      const secondPane = splitter.panes[1];
      const bars = getSplitterBars(splitter);
      const firstBar = bars[0].shadowRoot!.querySelector(
        '[part~="base"]'
      ) as HTMLElement;

      const style = getComputedStyle(firstBar);
      expect(style.cursor).to.equal('col-resize');

      firstPane.resizable = false;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      firstPane.resizable = true;
      secondPane.collapsed = true;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      secondPane.collapsed = false;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('col-resize');
    });
  });

  describe('Properties', () => {
    it('should set nonCollapsible property', async () => {
      splitter.nonCollapsible = true;
      await elementUpdated(splitter);

      expect(splitter.nonCollapsible).to.be.true;
      expect(splitter.hasAttribute('non-collapsible')).to.be.true;
    });

    it('should reset pane sizes when orientation changes', async () => {
      const pane = splitter.panes[0];
      pane.size = '200px';
      await elementUpdated(splitter);

      const base = getSplitterPaneBase(pane) as HTMLElement;
      const style = getComputedStyle(base);
      expect(style.flex).to.equal('0 0 200px');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(pane.size).to.equal('auto');
    });

    it('should use default min/max values when not specified', async () => {
      await elementUpdated(splitter);

      const pane = splitter.panes[0];
      const base = getSplitterPaneBase(pane) as HTMLElement;
      const style = getComputedStyle(base);
      expect(style.flex).to.equal('1 1 auto');

      expect(pane.size).to.equal('auto');

      expect(style.minWidth).to.equal('0px');
      expect(style.maxWidth).to.equal('100%');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(style.minHeight).to.equal('0px');
      expect(style.maxHeight).to.equal('100%');
    });

    it('should apply minSize and maxSize to panes for horizontal orientation', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          minSize1: '100px',
          maxSize1: '500px',
        })
      );

      await elementUpdated(splitter);

      const pane = splitter.panes[0];
      const base = getSplitterPaneBase(pane) as HTMLElement;
      const style = getComputedStyle(base);
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('500px');
    });

    it('should apply minSize and maxSize to panes for vertical orientation', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          minSize1: '100px',
          maxSize1: '500px',
          orientation: 'vertical',
        })
      );
      await elementUpdated(splitter);

      const pane = splitter.panes[0];
      const base = getSplitterPaneBase(pane) as HTMLElement;
      const style = getComputedStyle(base);
      expect(style.minHeight).to.equal('100px');
      expect(style.maxHeight).to.equal('500px');
    });

    it('should handle percentage sizes', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          size1: '30%',
          size2: '70%',
          minSize1: '20%',
          maxSize1: '80%',
        })
      );
      await elementUpdated(splitter);

      const pane1 = splitter.panes[0];
      const base1 = getSplitterPaneBase(pane1) as HTMLElement;
      const style1 = getComputedStyle(base1);

      const pane2 = splitter.panes[1];
      const base2 = getSplitterPaneBase(pane2) as HTMLElement;
      const style2 = getComputedStyle(base2);

      expect(splitter.panes[0].size).to.equal('30%');
      expect(splitter.panes[1].size).to.equal('70%');
      expect(style1.flex).to.equal('1 1 30%');
      expect(style2.flex).to.equal('1 1 70%');

      expect(pane1.minSize).to.equal('20%');
      expect(pane1.maxSize).to.equal('80%');
      expect(style1.minWidth).to.equal('20%');
      expect(style1.maxWidth).to.equal('80%');

      // TODO: test with drag; add constraints to second pane
    });

    it('should handle mixed px and % constraints', async () => {
      const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          minSize1: '100px',
          maxSize1: '50%',
        })
      );
      await elementUpdated(mixedConstraintSplitter);

      const pane = mixedConstraintSplitter.panes[0];
      const base1 = getSplitterPaneBase(pane) as HTMLElement;
      const style = getComputedStyle(base1);

      expect(pane.minSize).to.equal('100px');
      expect(pane.maxSize).to.equal('50%');
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('50%');

      // TODO: test with drag
    });

    it('should dynamically update when panes are added', async () => {
      expect(splitter.panes).to.have.lengthOf(3);

      const newPane = document.createElement(
        'igc-splitter-pane'
      ) as IgcSplitterPaneComponent;
      newPane.textContent = 'New Pane';
      splitter.appendChild(newPane);

      await elementUpdated(splitter);

      expect(splitter.panes).to.have.lengthOf(4);
    });

    it('should dynamically update when panes are removed', async () => {
      expect(splitter.panes).to.have.lengthOf(3);

      const paneToRemove = splitter.panes[1];
      paneToRemove.remove();

      await elementUpdated(splitter);

      expect(splitter.panes).to.have.lengthOf(2);
    });
  });

  describe('Methods, Events & Interactions', () => {
    it('should expand/collapse panes when toggle is invoked', async () => {
      const pane = splitter.panes[0];
      expect(pane.collapsed).to.be.false;

      pane.toggle();
      await elementUpdated(splitter);

      expect(pane.collapsed).to.be.true;

      pane.toggle();
      await elementUpdated(splitter);

      expect(pane.collapsed).to.be.false;
    });

    it('should toggle the previous pane when the bar expander-end is clicked', async () => {
      const bars = getSplitterBars(splitter);
      const firstBar = bars[0];
      const firstPane = splitter.panes[0];
      const secondPane = splitter.panes[1];

      expect(firstPane.collapsed).to.be.false;

      const expanderStart = getExpander(firstBar, 'start');
      const expanderEnd = getExpander(firstBar, 'end');

      expanderEnd.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(firstPane.collapsed).to.be.true;
      expect(secondPane.collapsed).to.be.false;
      expect(expanderStart.hidden).to.be.true;
      expect(expanderEnd.hidden).to.be.false;

      expanderEnd.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(firstPane.collapsed).to.be.false;
      expect(secondPane.collapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });

    it('should toggle the next pane when the bar expander-start is clicked', async () => {
      const bars = getSplitterBars(splitter);
      const firstBar = bars[0];
      const firstPane = splitter.panes[0];
      const secondPane = splitter.panes[1];

      expect(secondPane.collapsed).to.be.false;

      const expanderStart = getExpander(firstBar, 'start');
      const expanderEnd = getExpander(firstBar, 'end');

      expanderStart.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(secondPane.collapsed).to.be.true;
      expect(firstPane.collapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.true;

      expanderStart.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(firstPane.collapsed).to.be.false;
      expect(secondPane.collapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });
  });
});

function createSplitter() {
  return html`
    <igc-splitter>
      <igc-splitter-pane>Pane 1</igc-splitter-pane>
      <igc-splitter-pane>Pane 2</igc-splitter-pane>
      <igc-splitter-pane>Pane 3</igc-splitter-pane>
    </igc-splitter>
  `;
}

function createNestedSplitter() {
  return html`
    <igc-splitter orientation="horizontal">
      <igc-splitter-pane>
        <igc-splitter orientation="vertical">
          <igc-splitter-pane>Top Left Pane</igc-splitter-pane>
          <igc-splitter-pane>Bottom Left Pane</igc-splitter-pane>
        </igc-splitter>
      </igc-splitter-pane>
      <igc-splitter-pane>
        <igc-splitter orientation="vertical">
          <igc-splitter-pane>Top Right Pane</igc-splitter-pane>
          <igc-splitter-pane>Bottom Right Pane</igc-splitter-pane>
        </igc-splitter>
      </igc-splitter-pane>
    </igc-splitter>
  `;
}

type SplitterTestSizesAndConstraints = {
  size1?: string;
  size2?: string;
  minSize1?: string;
  maxSize1?: string;
  minSize2?: string;
  maxSize2?: string;
  orientation?: SplitterOrientation;
};

function createTwoPanesWithSizesAndConstraints(
  config: SplitterTestSizesAndConstraints
) {
  return html`
    <igc-splitter .orientation=${config.orientation ?? 'horizontal'}>
      <igc-splitter-pane
        .size=${config.size1 ?? 'auto'}
        .minSize=${config.minSize1}
        .maxSize=${config.maxSize1}
      >
        Pane 1
      </igc-splitter-pane>
      <igc-splitter-pane
        .size=${config.size2 ?? 'auto'}
        .minSize=${config.minSize2}
        .maxSize=${config.maxSize2}
      >
        Pane 2
      </igc-splitter-pane>
    </igc-splitter>
  `;
}

function getSplitterPaneBase(pane: IgcSplitterPaneComponent) {
  return pane.shadowRoot!.querySelector('div[part~="base"]');
}

function getSplitterBars(splitter: IgcSplitterComponent) {
  const bars: IgcSplitterBarComponent[] = [];

  splitter.panes.forEach((pane) => {
    const bar = pane.shadowRoot!.querySelector(IgcSplitterBarComponent.tagName);
    if (bar) {
      bars.push(bar);
    }
  });
  return bars;
}

function getExpander(bar: IgcSplitterBarComponent, which: 'start' | 'end') {
  return bar.shadowRoot!.querySelector(
    `[part="expander-${which}"]`
  ) as HTMLElement;
}
