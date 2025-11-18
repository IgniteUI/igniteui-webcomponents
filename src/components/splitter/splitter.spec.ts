import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { roundPrecise } from '../common/util.js';
import {
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterComponent from './splitter.js';

describe('Splitter', () => {
  before(() => {
    defineComponents(IgcSplitterComponent);
  });

  let splitter: IgcSplitterComponent;

  beforeEach(async () => {
    splitter = await fixture<IgcSplitterComponent>(createSplitter());
    await elementUpdated(splitter);
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

    it('should render start and end slots', async () => {
      let slot = getSplitterSlot(splitter, 'start');
      let elements = slot.assignedElements();
      expect(elements).to.have.lengthOf(1);
      expect(elements[0].textContent).to.equal('Pane 1');

      slot = getSplitterSlot(splitter, 'end');
      elements = slot.assignedElements();
      expect(elements).to.have.lengthOf(1);
      expect(elements[0].textContent).to.equal('Pane 2');
    });

    it('should render splitter bar between start and end parts', async () => {
      const base = getSplitterPart(splitter, 'base');
      const startPart = getSplitterPart(splitter, 'startPane');
      const endPart = getSplitterPart(splitter, 'endPane');
      const bar = getSplitterPart(splitter, 'bar');

      expect(base).to.exist;
      expect(startPart).to.exist;
      expect(endPart).to.exist;
      expect(bar).to.exist;

      expect(base.contains(startPart)).to.be.true;
      expect(base.contains(endPart)).to.be.true;
      expect(base.contains(bar)).to.be.true;

      expect(startPart.nextElementSibling).to.equal(bar);
      expect(bar.nextElementSibling).to.equal(endPart);
    });

    it('should render splitter bar parts', async () => {
      const bar = getSplitterPart(splitter, 'bar');
      const expanderStart = getSplitterPart(splitter, 'expander-start');
      const barHandle = getSplitterPart(splitter, 'handle');
      const expanderEnd = getSplitterPart(splitter, 'expander-end');

      expect(expanderStart).to.exist;
      expect(barHandle).to.exist;
      expect(expanderEnd).to.exist;

      expect(bar.contains(expanderStart)).to.be.true;
      expect(bar.contains(expanderEnd)).to.be.true;
      expect(bar.contains(barHandle)).to.be.true;

      expect(expanderStart.nextElementSibling).to.equal(barHandle);
      expect(barHandle.nextElementSibling).to.equal(expanderEnd);
    });

    it('should not display the bar elements if the splitter is nonCollapsible', async () => {
      splitter.nonCollapsible = true;
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, 'bar');
      expect(bar.children).to.have.lengthOf(0);
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

      const outerStartSlot = getSplitterSlot(nestedSplitter, 'start');
      const startElements = outerStartSlot.assignedElements();
      expect(startElements).to.have.lengthOf(1);
      expect(startElements[0].tagName.toLowerCase()).to.equal(
        IgcSplitterComponent.tagName.toLowerCase()
      );

      const outerEndSlot = getSplitterSlot(nestedSplitter, 'end');
      const endElements = outerEndSlot.assignedElements();
      expect(endElements).to.have.lengthOf(1);
      expect(endElements[0].tagName.toLowerCase()).to.equal(
        IgcSplitterComponent.tagName.toLowerCase()
      );

      const innerStartSlot1 = getSplitterSlot(
        startElements[0] as IgcSplitterComponent,
        'start'
      );
      expect(innerStartSlot1.assignedElements()[0].textContent).to.equal(
        'Top Left Pane'
      );

      const innerEndSlot1 = getSplitterSlot(
        startElements[0] as IgcSplitterComponent,
        'end'
      );
      expect(innerEndSlot1.assignedElements()[0].textContent).to.equal(
        'Bottom Left Pane'
      );

      const innerStartSlot2 = getSplitterSlot(
        endElements[0] as IgcSplitterComponent,
        'start'
      );
      expect(innerStartSlot2.assignedElements()[0].textContent).to.equal(
        'Top Right Pane'
      );

      const innerEndSlot2 = getSplitterSlot(
        endElements[0] as IgcSplitterComponent,
        'end'
      );
      expect(innerEndSlot2.assignedElements()[0].textContent).to.equal(
        'Bottom Right Pane'
      );
    });

    it('should set a default cursor on the bar in case splitter is not resizable or any pane is collapsed', async () => {
      const bar = getSplitterPart(splitter, 'bar');

      const style = getComputedStyle(bar);
      expect(style.cursor).to.equal('col-resize');

      splitter.nonResizable = true;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      splitter.nonResizable = false;
      splitter.endCollapsed = true;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      splitter.endCollapsed = false;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('col-resize');
    });

    it('should change the bar cursor based on the orientation', async () => {
      const bar = getSplitterPart(splitter, 'bar');

      const style = getComputedStyle(bar);
      expect(style.cursor).to.equal('col-resize');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('row-resize');
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
      splitter.startSize = '200px';
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, 'startPane');
      const style = getComputedStyle(startPart);
      expect(style.flex).to.equal('0 0 200px');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(style.flex).to.equal('1 1 auto');
    });

    // TODO: verify the attribute type, default value, reflection
    it('should properly set default min/max values when not specified', async () => {
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, 'startPane');
      const style = getComputedStyle(startPart);
      expect(style.flex).to.equal('1 1 auto');

      expect(splitter.startSize).to.equal('auto');
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
          startMinSize: '100px',
          startMaxSize: '500px',
        })
      );

      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, 'startPane');
      const style = getComputedStyle(startPane);
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('500px');
    });

    it('should apply minSize and maxSize to panes for vertical orientation', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '100px',
          startMaxSize: '500px',
          orientation: 'vertical',
        })
      );
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, 'startPane');
      const style = getComputedStyle(startPane);
      expect(style.minHeight).to.equal('100px');
      expect(style.maxHeight).to.equal('500px');
    });

    it('should handle percentage sizes', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '30%',
          endSize: '70%',
          startMinSize: '20%',
          startMaxSize: '80%',
        })
      );
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, 'startPane');
      const style1 = getComputedStyle(startPane);

      const endPane = getSplitterPart(splitter, 'endPane');
      const style2 = getComputedStyle(endPane);

      expect(splitter.startSize).to.equal('30%');
      expect(splitter.endSize).to.equal('70%');
      expect(style1.flex).to.equal('0 1 30%');
      expect(style2.flex).to.equal('0 1 70%');

      expect(splitter.startMinSize).to.equal('20%');
      expect(splitter.startMaxSize).to.equal('80%');
      expect(style1.minWidth).to.equal('20%');
      expect(style1.maxWidth).to.equal('80%');

      // TODO: test with drag; add constraints to second pane
    });

    it('should handle mixed px and % constraints', async () => {
      const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '100px',
          startMaxSize: '50%',
        })
      );
      await elementUpdated(mixedConstraintSplitter);

      const startPane = getSplitterPart(mixedConstraintSplitter, 'startPane');
      const style = getComputedStyle(startPane);

      expect(mixedConstraintSplitter.startMinSize).to.equal('100px');
      expect(mixedConstraintSplitter.startMaxSize).to.equal('50%');
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('50%');

      // TODO: test with drag
    });
  });

  describe('Methods, Events & Interactions', () => {
    it('should expand/collapse panes when toggle is invoked', async () => {
      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.startCollapsed).to.be.true;

      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.startCollapsed).to.be.false;

      splitter.toggle('end');
      await elementUpdated(splitter);
      expect(splitter.endCollapsed).to.be.true;

      // edge case: supports collapsing both at a time?
      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.true;
    });

    it('should toggle the next pane when the bar expander-end is clicked', async () => {
      const expanderStart = getSplitterPart(splitter, 'expander-start');
      const expanderEnd = getSplitterPart(splitter, 'expander-end');

      expanderEnd.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.true;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.true;

      expanderEnd.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });

    it('should toggle the previous pane when the bar expander-start is clicked', async () => {
      const expanderStart = getSplitterPart(splitter, 'expander-start');
      const expanderEnd = getSplitterPart(splitter, 'expander-end');

      expanderStart.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.true;
      expect(expanderEnd.hidden).to.be.false;

      expanderStart.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });

    it('should resize horizontally in both directions', async () => {
      const startPane = getSplitterPart(splitter, 'startPane');
      const endPane = getSplitterPart(splitter, 'endPane');
      const startSizeBefore = roundPrecise(
        startPane.getBoundingClientRect().width
      );
      const endSizeBefore = roundPrecise(endPane.getBoundingClientRect().width);
      let deltaX = 100;

      await resize(splitter, deltaX, 0);
      await elementUpdated(splitter);

      const startSizeAfter = roundPrecise(
        startPane.getBoundingClientRect().width
      );
      const endSizeAfter = roundPrecise(endPane.getBoundingClientRect().width);

      expect(startSizeAfter).to.equal(startSizeBefore + deltaX);
      expect(endSizeAfter).to.equal(endSizeBefore - deltaX);

      deltaX *= -1;
      await resize(splitter, deltaX, 0);

      const startSizeFinal = roundPrecise(
        startPane.getBoundingClientRect().width
      );
      const endSizeFinal = roundPrecise(endPane.getBoundingClientRect().width);

      expect(startSizeFinal).to.equal(startSizeBefore);
      expect(endSizeFinal).to.equal(endSizeBefore);
    });

    it('should resize vertically in both directions', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, 'startPane');
      const endPane = getSplitterPart(splitter, 'endPane');
      const startSizeBefore = roundPrecise(
        startPane.getBoundingClientRect().height
      );
      const endSizeBefore = roundPrecise(
        endPane.getBoundingClientRect().height
      );
      let deltaY = 100;

      await resize(splitter, 0, deltaY);

      const startSizeAfter = roundPrecise(
        startPane.getBoundingClientRect().height
      );
      const endSizeAfter = roundPrecise(endPane.getBoundingClientRect().height);

      expect(startSizeAfter).to.equal(startSizeBefore + deltaY);
      expect(endSizeAfter).to.equal(endSizeBefore - deltaY);

      deltaY *= -1;
      await resize(splitter, 0, deltaY);

      const startSizeFinal = roundPrecise(
        startPane.getBoundingClientRect().height
      );
      const endSizeFinal = roundPrecise(endPane.getBoundingClientRect().height);

      expect(startSizeFinal).to.equal(startSizeBefore);
      expect(endSizeFinal).to.equal(endSizeBefore);
    });
    // TODO: test when the slots have assigned sizes/min sizes + edge cases
    // currently observing issue when resizing to the end and panes have fixed px sizes
  });
});

function createSplitter() {
  return html`
    <igc-splitter style="width: 500px; height: 500px;">
      <div slot="start">Pane 1</div>
      <div slot="end">Pane 2</div>
    </igc-splitter>
  `;
}

function createNestedSplitter() {
  return html`
    <igc-splitter orientation="horizontal">
      <igc-splitter slot="start" orientation="vertical">
        <div slot="start">Top Left Pane</div>
        <div slot="end">Bottom Left Pane</div>
      </igc-splitter>
      <igc-splitter slot="end" orientation="vertical">
        <div slot="start">Top Right Pane</div>
        <div slot="end">Bottom Right Pane</div>
      </igc-splitter>
    </igc-splitter>
  `;
}

type SplitterTestSizesAndConstraints = {
  startSize?: string;
  endSize?: string;
  startMinSize?: string;
  startMaxSize?: string;
  endMinSize?: string;
  endMaxSize?: string;
  orientation?: SplitterOrientation;
};

function createTwoPanesWithSizesAndConstraints(
  config: SplitterTestSizesAndConstraints
) {
  return html`
    <igc-splitter
      .orientation=${config.orientation ?? 'horizontal'}
      .startSize=${config.startSize ?? 'auto'}
      .endSize=${config.endSize ?? 'auto'}
      .startMinSize=${config.startMinSize ?? '0px'}
      .startMaxSize=${config.startMaxSize ?? '100%'}
      .endMinSize=${config.endMinSize ?? '0px'}
      .endMaxSize=${config.endMaxSize ?? '100%'}
    >
      <div slot="start">Pane 1</div>
      <div slot="end">Pane 2</div>
    </igc-splitter>
  `;
}

function getSplitterSlot(
  splitter: IgcSplitterComponent,
  which: 'start' | 'end'
) {
  return splitter.renderRoot.querySelector(
    `slot[name="${which}"]`
  ) as HTMLSlotElement;
}

// TODO: more parts and names?
type SplitterParts =
  | 'startPane'
  | 'endPane'
  | 'bar'
  | 'base'
  | 'expander-start'
  | 'expander-end'
  | 'handle';

function getSplitterPart(splitter: IgcSplitterComponent, which: SplitterParts) {
  return splitter.shadowRoot!.querySelector(
    `[part~="${which}"]`
  ) as HTMLElement;
}

async function resize(
  splitter: IgcSplitterComponent,
  deltaX: number,
  deltaY: number
) {
  const bar = getSplitterPart(splitter, 'bar');
  const barRect = bar.getBoundingClientRect();

  simulatePointerDown(bar, {
    clientX: barRect.left,
    clientY: barRect.top,
  });
  await elementUpdated(splitter);

  simulatePointerMove(
    bar,
    {
      clientX: barRect.left,
      clientY: barRect.top,
    },
    { x: deltaX, y: deltaY }
  );
  await elementUpdated(splitter);

  simulateLostPointerCapture(bar);
  await elementUpdated(splitter);
  await nextFrame();
}

// function checkPanesAreWithingBounds(
//   splitter: IgcSplitterComponent,
//   startSize: number,
//   endSize: number,
//   dimension: 'x' | 'y'
// ) {
//   const splitterSize =
//     splitter.getBoundingClientRect()[dimension === 'x' ? 'width' : 'height'];
//   expect(startSize + endSize).to.be.at.most(splitterSize);
// }
