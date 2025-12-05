import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { spy } from 'sinon';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { roundPrecise } from '../common/util.js';
import {
  simulateKeyboard,
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
      const startPart = getSplitterPart(splitter, 'start-pane');
      const endPart = getSplitterPart(splitter, 'end-pane');
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
      const expanderStart = getSplitterPart(splitter, 'start-expander');
      const barHandle = getSplitterPart(splitter, 'handle');
      const expanderEnd = getSplitterPart(splitter, 'end-expander');

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

    //TODO: this is the behavior in Angular - to discuss
    it('should reset sizes when pane is initially collapsed.', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createSplitterWithCollapsedPane()
      );
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(splitter.endSize).to.equal('auto');
    });

    it('should reset sizes when pane is runtime collapsed.', async () => {
      splitter.startSize = '200px';
      splitter.endSize = '30%';
      await elementUpdated(splitter);

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(splitter.endSize).to.equal('auto');
    });
  });

  describe('Properties', () => {
    it('should reset pane sizes when orientation changes', async () => {
      splitter.startSize = '200px';
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, 'start-pane');
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

      const startPart = getSplitterPart(splitter, 'start-pane');
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

      const startPane = getSplitterPart(splitter, 'start-pane');
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

      const startPane = getSplitterPart(splitter, 'start-pane');
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

      const startPane = getSplitterPart(splitter, 'start-pane');
      const style1 = getComputedStyle(startPane);

      const endPane = getSplitterPart(splitter, 'end-pane');
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
      const expanderStart = getSplitterPart(splitter, 'start-expander');
      const expanderEnd = getSplitterPart(splitter, 'end-expander');

      simulatePointerDown(expanderEnd, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.true;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.true;

      simulatePointerDown(expanderStart, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });

    it('should toggle the previous pane when the bar expander-start is clicked', async () => {
      const expanderStart = getSplitterPart(splitter, 'start-expander');
      const expanderEnd = getSplitterPart(splitter, 'end-expander');

      simulatePointerDown(expanderStart, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.true;
      expect(expanderEnd.hidden).to.be.false;

      simulatePointerDown(expanderEnd, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
      expect(expanderStart.hidden).to.be.false;
      expect(expanderEnd.hidden).to.be.false;
    });

    it('should resize horizontally in both directions', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const previousSizes = getPanesSizes(splitter, 'width');
      let deltaX = 100;

      await resize(splitter, deltaX, 0);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaX);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaX);
      checkResizeEvents(eventSpy);

      deltaX *= -1;
      await resize(splitter, deltaX, 0);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);
      checkResizeEvents(eventSpy);
    });

    it('should resize vertically in both directions', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      const previousSizes = getPanesSizes(splitter, 'height');
      let deltaY = 100;

      await resize(splitter, 0, deltaY);

      let currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaY);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaY);
      checkResizeEvents(eventSpy);

      deltaY *= -1;
      await resize(splitter, 0, deltaY);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);
      checkResizeEvents(eventSpy);
    });

    it('should resize horizontally by 10px delta with left/right arrow keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, 'bar');
      let previousSizes = getPanesSizes(splitter, 'width');
      const resizeDelta = 10;

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta
      );
      checkResizeEvents(eventSpy);

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta * 2
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta * 2
      );
      checkResizeEvents(eventSpy);

      previousSizes = getPanesSizes(splitter, 'width');
      simulateKeyboard(bar, arrowLeft);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize - resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize + resizeDelta
      );
      checkResizeEvents(eventSpy);
    });

    it('should resize vertically by 10px delta with up/down arrow keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, 'bar');
      let previousSizes = getPanesSizes(splitter, 'height');
      const resizeDelta = 10;

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowDown);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta
      );
      checkResizeEvents(eventSpy);

      simulateKeyboard(bar, arrowDown);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta * 2
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta * 2
      );
      checkResizeEvents(eventSpy);

      previousSizes = getPanesSizes(splitter, 'height');
      simulateKeyboard(bar, arrowUp);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize - resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize + resizeDelta
      );
      checkResizeEvents(eventSpy);
    });

    it('should not resize with left/right keys when in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, 'bar');
      const previousSizes = getPanesSizes(splitter, 'height');

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowLeft);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes).to.deep.equal(previousSizes);

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes).to.deep.equal(previousSizes);
      expect(eventSpy.called).to.be.false;
    });

    it('should not resize with up/down keys when in horizontal orientation', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, 'bar');
      const previousSizes = getPanesSizes(splitter, 'width');

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowUp);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);

      simulateKeyboard(bar, arrowDown);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);
      expect(eventSpy.called).to.be.false;
    });

    // TODO: should there be events on expand/collapse?
    it('should expand/collapse panes with Ctrl + left/right arrow keys in horizontal orientation', async () => {
      const bar = getSplitterPart(splitter, 'bar');
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      const splitterSize = splitter.getBoundingClientRect().width;
      const barSize = bar.getBoundingClientRect().width;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
    });

    it('should expand/collapse panes with Ctrl + up/down arrow keys in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, 'bar');
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'height');
      const splitterSize = splitter.getBoundingClientRect().height;
      const barSize = bar.getBoundingClientRect().height;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
    });

    it('should not resize when nonResizable is true', async () => {
      splitter.nonResizable = true;
      await elementUpdated(splitter);

      const eventSpy = spy(splitter, 'emitEvent');
      let previousSizes = getPanesSizes(splitter, 'width');
      const bar = getSplitterPart(splitter, 'bar');

      await resize(splitter, 100, 0);

      let currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);
      await nextFrame();

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);
      expect(eventSpy.called).to.be.false;

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      previousSizes = getPanesSizes(splitter, 'height');

      await resize(splitter, 0, 100);

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes).to.deep.equal(previousSizes);

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowDown);
      await elementUpdated(splitter);
      await nextFrame();

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes).to.deep.equal(previousSizes);

      expect(eventSpy.called).to.be.false;
    });

    it('should not expand/collapse panes with Ctrl + arrow keys when nonCollapsible is true', async () => {
      splitter.nonCollapsible = true;
      await elementUpdated(splitter);

      expect(splitter.nonCollapsible).to.be.true;
      expect(splitter.hasAttribute('non-collapsible')).to.be.true;

      const bar = getSplitterPart(splitter, 'bar');
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;
    });

    it('should not be able to resize a pane when it is collapsed', async () => {
      splitter.toggle('start');
      await elementUpdated(splitter);
      const previousSizes = getPanesSizes(splitter, 'width');

      await resize(splitter, 100, 0);
      const currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);
    });
  });

  // TODO: test when the slots have assigned sizes/min sizes + edge cases
  describe('Resizing with constraints and edge cases', () => {
    describe('Horizontal orientation', () => {
      it('should honor minSize and maxSize constraints when resizing, constraints in px', async () => {
        const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            startSize: '200px',
            startMinSize: '100px',
            startMaxSize: '300px',
            endSize: '200px',
            endMinSize: '100px',
            endMaxSize: '300px',
          })
        );
        await elementUpdated(mixedConstraintSplitter);

        let deltaX = 1000;
        await resize(mixedConstraintSplitter, deltaX, 0);

        let sizes = getPanesSizes(mixedConstraintSplitter, 'width');
        expect(sizes.startSize).to.equal(300);

        deltaX = -1000;
        await resize(mixedConstraintSplitter, deltaX, 0);

        sizes = getPanesSizes(mixedConstraintSplitter, 'width');
        expect(sizes.startSize).to.equal(100);

        deltaX = 1000;
        await resize(mixedConstraintSplitter, deltaX, 0);

        sizes = getPanesSizes(mixedConstraintSplitter, 'width');
        expect(sizes.endSize).to.equal(100);

        deltaX = -1000;
        await resize(mixedConstraintSplitter, deltaX, 0);

        sizes = getPanesSizes(mixedConstraintSplitter, 'width');
        expect(sizes.endSize).to.equal(300);
      });

      it('should respect both panes constraints when they conflict during resize in px', async () => {
        const constraintSplitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            startSize: '200px',
            startMinSize: '100px',
            startMaxSize: '400px',
            endSize: '200px',
            endMinSize: '150px',
            endMaxSize: '350px',
          })
        );
        await elementUpdated(constraintSplitter);

        const bar = getSplitterPart(constraintSplitter, 'bar');
        const barSize = bar.getBoundingClientRect().width;
        const totalAvailable = 500 - barSize;
        expect(totalAvailable).to.equal(495);

        const initialSizes = getPanesSizes(constraintSplitter, 'width');
        const initialCombinedSize =
          initialSizes.startSize + initialSizes.endSize;

        // Try to grow start pane to max, but end pane has min (150px)
        // Result: Start pane can only grow as much as end pane allows
        const deltaX = 1000;
        await resize(constraintSplitter, deltaX, 0);

        const sizes = getPanesSizes(constraintSplitter, 'width');

        // Start pane can only grow until end pane hits its minSize
        // Within the initial combined size of 400px - because of flex basis
        expect(sizes.startSize).to.equal(250);
        expect(sizes.endSize).to.equal(150);

        expect(sizes.startSize + sizes.endSize).to.equal(initialCombinedSize);
        expect(sizes.startSize + sizes.endSize).to.be.at.most(totalAvailable);
      });

      // TODO: very broken scenario (same in Angular)
      xit('should honor minSize and maxSize constraints when resizing, constraints in %', async () => {
        const constraintSplitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            startSize: '30%',
            startMinSize: '10%',
            startMaxSize: '80%',
            endSize: '70%',
            endMinSize: '20%',
            endMaxSize: '90%',
          })
        );
        await elementUpdated(constraintSplitter);

        const bar = getSplitterPart(constraintSplitter, 'bar');
        const barSize = bar.getBoundingClientRect().width;
        const totalAvailable = 500 - barSize;
        expect(totalAvailable).to.equal(495);

        let deltaX = 1000;
        await resize(constraintSplitter, deltaX, 0);

        let sizes = getPanesSizes(constraintSplitter, 'width');
        const expectedStartMax = Math.round((totalAvailable * 80) / 100);
        expect(sizes.startSize).to.be.closeTo(expectedStartMax, 2);

        deltaX = -1000;
        await resize(constraintSplitter, deltaX, 0);

        sizes = getPanesSizes(constraintSplitter, 'width');
        const expectedStartMin = Math.round((totalAvailable * 10) / 100);
        expect(sizes.startSize).to.be.closeTo(expectedStartMin, 2);

        deltaX = 1000;
        await resize(constraintSplitter, deltaX, 0);

        sizes = getPanesSizes(constraintSplitter, 'width');
        const expectedEndMin = Math.round((totalAvailable * 20) / 100);
        expect(sizes.endSize).to.be.closeTo(expectedEndMin, 2);

        deltaX = -1000;
        await resize(constraintSplitter, deltaX, 0);

        sizes = getPanesSizes(constraintSplitter, 'width');
        const expectedEndMax = Math.round((totalAvailable * 90) / 100);
        expect(sizes.endSize).to.be.closeTo(expectedEndMax, 2);
      });
    });

    describe('Vertical orientation', () => {
      it('should honor minSize and maxSize constraints when resizing - constraints in px', async () => {
        const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            orientation: 'vertical',
            startSize: '200px',
            startMinSize: '100px',
            startMaxSize: '300px',
            endSize: '200px',
            endMinSize: '100px',
            endMaxSize: '300px',
          })
        );
        await elementUpdated(mixedConstraintSplitter);

        let deltaY = 1000;
        await resize(mixedConstraintSplitter, 0, deltaY);

        let sizes = getPanesSizes(mixedConstraintSplitter, 'height');
        expect(sizes.startSize).to.equal(300);

        deltaY = -1000;
        await resize(mixedConstraintSplitter, 0, deltaY);

        sizes = getPanesSizes(mixedConstraintSplitter, 'height');
        expect(sizes.startSize).to.equal(100);

        deltaY = 1000;
        await resize(mixedConstraintSplitter, 0, deltaY);
        sizes = getPanesSizes(mixedConstraintSplitter, 'height');
        expect(sizes.endSize).to.equal(100);

        deltaY = -1000;
        await resize(mixedConstraintSplitter, 0, deltaY);

        sizes = getPanesSizes(mixedConstraintSplitter, 'height');
        expect(sizes.endSize).to.equal(300);
      });
    });

    it('should result in % sizes after resize when the panes size is auto', () => {
      //TODO
    });

    it('should handle mixed px and % constraints - start in px; end in %', async () => {
      const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '100px',
          startMaxSize: '50%',
        })
      );
      await elementUpdated(mixedConstraintSplitter);

      const startPane = getSplitterPart(mixedConstraintSplitter, 'start-pane');
      const style = getComputedStyle(startPane);

      expect(mixedConstraintSplitter.startMinSize).to.equal('100px');
      expect(mixedConstraintSplitter.startMaxSize).to.equal('50%');
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('50%');

      // TODO: test with drag
    });

    it('should handle mixed % and auto size', async () => {
      // TODO
    });

    it('should handle mixed px and auto size', async () => {
      // TODO
    });

    it('panes should not exceed splitter size when set in px and horizontally resizing to end', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '500px',
          endSize: '500px',
        })
      );
      const totalSplitterSize = 800;
      splitter.style.width = `${totalSplitterSize}px`;
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, 'bar');
      const barSize = bar.getBoundingClientRect().width;
      const previousSizes = getPanesSizes(splitter, 'width');
      const deltaX = 100;

      await resize(splitter, deltaX, 0);

      const currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaX);
      // end pane size should be decreased to fit the splitter width
      expect(currentSizes.endSize).to.equal(
        totalSplitterSize - barSize - currentSizes.startSize
      );
      checkPanesAreWithingBounds(
        splitter,
        currentSizes.startSize,
        currentSizes.endSize,
        'x'
      );
    });

    it('panes should not exceed splitter size when set in px and vertically resizing to end', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation: 'vertical',
          startSize: '500px',
          endSize: '500px',
        })
      );
      const totalSplitterSize = 800;
      splitter.style.height = `${totalSplitterSize}px`;
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, 'bar');
      const barSize = bar.getBoundingClientRect().height;
      const previousSizes = getPanesSizes(splitter, 'height');
      const deltaY = 100;

      await resize(splitter, 0, deltaY);

      const currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaY);
      // end pane size should be decreased to fit the splitter height
      expect(currentSizes.endSize).to.equal(
        totalSplitterSize - barSize - currentSizes.startSize
      );
      checkPanesAreWithingBounds(
        splitter,
        currentSizes.startSize,
        currentSizes.endSize,
        'y'
      );
    });
  });

  describe('Behavior on window resize', () => {
    it('should maintain panes sizes in px on window resize', async () => {
      //TODO
    });

    it('should maintain panes sizes in % on window resize', async () => {
      //TODO
    });

    //TODO: others
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
      style="width: 500px; height: 500px;"
      .orientation=${config.orientation ?? 'horizontal'}
      .startSize=${config.startSize}
      .endSize=${config.endSize}
      .startMinSize=${config.startMinSize}
      .startMaxSize=${config.startMaxSize}
      .endMinSize=${config.endMinSize}
      .endMaxSize=${config.endMaxSize}
    >
      <div slot="start">Pane 1</div>
      <div slot="end">Pane 2</div>
    </igc-splitter>
  `;
}

function createSplitterWithCollapsedPane() {
  return html`
    <igc-splitter
      start-collapsed
      start-size="100px"
      end-size="100px"
      style="width: 500px; height: 500px;"
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
  | 'start-pane'
  | 'end-pane'
  | 'bar'
  | 'base'
  | 'start-expander'
  | 'end-expander'
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

function getPanesSizes(
  splitter: IgcSplitterComponent,
  dimension: 'width' | 'height' = 'width'
) {
  const startPane = getSplitterPart(splitter, 'start-pane');
  const endPane = getSplitterPart(splitter, 'end-pane');

  return {
    startSize: roundPrecise(startPane.getBoundingClientRect()[dimension]),
    endSize: roundPrecise(endPane.getBoundingClientRect()[dimension]),
  };
}

function checkResizeEvents(eventSpy: sinon.SinonSpy) {
  expect(eventSpy.calledWith('igcResizeStart')).to.be.true;
  expect(eventSpy.calledWith('igcResizing')).to.be.true;
  expect(eventSpy.calledWith('igcResizeEnd')).to.be.true;
  eventSpy.resetHistory();
}

function checkPanesAreWithingBounds(
  splitter: IgcSplitterComponent,
  startSize: number,
  endSize: number,
  dimension: 'x' | 'y'
) {
  const splitterSize =
    splitter.getBoundingClientRect()[dimension === 'x' ? 'width' : 'height'];
  expect(startSize + endSize).to.be.at.most(splitterSize);
}
