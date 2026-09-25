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
  endKey,
  homeKey,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { finishAnimationsFor } from '#internals/testing/helpers.spec.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
  simulatePointerUp,
} from '#internals/testing/simulate.spec.js';
import { asPercent, roundPrecise } from '#internals/utils/math.js';
import IgcTreeItemComponent from '../tree/tree-item.js';
import IgcTreeComponent from '../tree/tree.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterComponent, {
  type IgcSplitterResizeEventArgs,
} from './splitter.js';

const BAR_PART = 'splitter-bar';
const START_PART = 'start-pane';
const END_PART = 'end-pane';
const START_EXPANDER_PART = 'start-expand-btn';
const END_EXPANDER_PART = 'end-expand-btn';
const START_COLLAPSE_PART = 'start-collapse-btn';
const END_COLLAPSE_PART = 'end-collapse-btn';
const DRAG_HANDLE_PART = 'drag-handle';

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

      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar.getAttribute('role')).to.equal('separator');

      // The name states what the separator does; the collapsed/expanded state
      // is a description, so the name does not change as panes collapse.
      const label = splitter.shadowRoot!.querySelector('#splitter-label')!;
      const state = splitter.shadowRoot!.querySelector('#splitter-state')!;

      expect(bar.getAttribute('aria-labelledby')).to.equal('splitter-label');
      expect(bar.getAttribute('aria-describedby')).to.equal('splitter-state');
      expect(label.textContent?.trim()).to.equal('Resize panes');
      expect(state.textContent).to.contain('Start pane expanded');

      expect(bar.getAttribute('aria-valuetext')).to.equal(
        `${bar.getAttribute('aria-valuenow')}%`
      );

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(label.textContent?.trim()).to.equal('Resize panes');
      expect(state.textContent).to.contain('Start pane collapsed');
    });

    it('should render both panes with equal sizes if no explicit sizes set', async () => {
      const startPart = getSplitterPart(splitter, START_PART);
      const endPart = getSplitterPart(splitter, END_PART);

      const startStyle = getComputedStyle(startPart);
      const endStyle = getComputedStyle(endPart);

      const totalWidth = getTotalSize(splitter, 'width');
      const startWidth = Number.parseFloat(startStyle.width);
      const endWidth = Number.parseFloat(endStyle.width);

      expect(startWidth).to.be.closeTo(totalWidth / 2, 1);
      expect(endWidth).to.be.closeTo(totalWidth / 2, 1);
    });

    it('should render both panes with equal sizes if no explicit sizes set - vertical', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, START_PART);
      const endPart = getSplitterPart(splitter, END_PART);

      const startStyle = getComputedStyle(startPart);
      const endStyle = getComputedStyle(endPart);

      const totalHeight = getTotalSize(splitter, 'height');
      const startHeight = Number.parseFloat(startStyle.height);
      const endHeight = Number.parseFloat(endStyle.height);

      expect(startHeight).to.be.closeTo(totalHeight / 2, 1);
      expect(endHeight).to.be.closeTo(totalHeight / 2, 1);
    });

    it('should render splitter bar between start and end parts', async () => {
      const base = getSplitterPart(splitter, 'base');
      const startPart = getSplitterPart(splitter, START_PART);
      const endPart = getSplitterPart(splitter, END_PART);
      const bar = getSplitterPart(splitter, BAR_PART);

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
      const bar = getSplitterPart(splitter, BAR_PART);
      const expanderStartCollapseBtn = getSplitterPart(
        splitter,
        START_COLLAPSE_PART
      );
      const barHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);
      const expanderEndCollapseBtn = getSplitterPart(
        splitter,
        END_COLLAPSE_PART
      );

      expect(expanderStartCollapseBtn).to.exist;
      expect(barHandle).to.exist;
      expect(expanderEndCollapseBtn).to.exist;

      expect(bar.contains(expanderStartCollapseBtn)).to.be.true;
      expect(bar.contains(expanderEndCollapseBtn)).to.be.true;
      expect(bar.contains(barHandle)).to.be.true;

      expect(expanderStartCollapseBtn.nextElementSibling).to.equal(barHandle);
      expect(barHandle.nextElementSibling).to.equal(expanderEndCollapseBtn);
    });

    it('should not display the collapse/expand button parts if disableCollapse is true', async () => {
      splitter.disableCollapse = true;
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar.children).to.have.lengthOf(3);

      let startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      let endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      let dragHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);

      expect(startCollapseBtn.hidden).to.be.true;
      expect(endCollapseBtn.hidden).to.be.true;
      expect(dragHandle.hidden).to.be.false;

      // verify this with programmatic expand/collapse as well
      splitter.toggle('start');
      await elementUpdated(splitter);

      startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      dragHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);

      const startExpandButton = getSplitterPart(splitter, START_EXPANDER_PART);

      expect(startExpandButton.hidden).to.be.true;
      expect(startCollapseBtn.hidden).to.be.true;
      expect(endCollapseBtn).to.be.null;
      expect(dragHandle.hidden).to.be.false;
    });

    it('should not display the collapse/expand button parts if hideCollapseButtons is true', async () => {
      splitter.hideCollapseButtons = true;
      await elementUpdated(splitter);
      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar.children).to.have.lengthOf(3);

      let startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      let endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      let dragHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);

      expect(startCollapseBtn.hidden).to.be.true;
      expect(endCollapseBtn.hidden).to.be.true;
      expect(dragHandle.hidden).to.be.false;

      splitter.toggle('end');
      await elementUpdated(splitter);

      startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      dragHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);

      const startExpandButton = getSplitterPart(splitter, START_EXPANDER_PART);

      expect(startExpandButton).to.be.null;
      expect(startCollapseBtn).to.be.null;
      expect(endCollapseBtn.hidden).to.be.true;
      expect(dragHandle.hidden).to.be.false;
    });

    it('should not display bar handle if disableResize is true', async () => {
      splitter.disableResize = true;
      await elementUpdated(splitter);

      const barHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);
      const startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      const endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      expect(barHandle.hidden).to.be.true;
      expect(startCollapseBtn.hidden).to.be.false;
      expect(endCollapseBtn.hidden).to.be.false;
    });

    it('should not display bar handle if hideDragHandle is true', async () => {
      splitter.hideDragHandle = true;
      await elementUpdated(splitter);

      const barHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);
      const startCollapseBtn = getSplitterPart(splitter, START_COLLAPSE_PART);
      const endCollapseBtn = getSplitterPart(splitter, END_COLLAPSE_PART);
      expect(barHandle.hidden).to.be.true;
      expect(startCollapseBtn.hidden).to.be.false;
      expect(endCollapseBtn.hidden).to.be.false;

      // Splitter bar is still focusable
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      expect(splitter.shadowRoot!.activeElement).to.equal(bar);

      const previousSizes = getPanesSizes(splitter, 'width');
      const resizeDelta = 10;

      // Splitter bar is still interactive for resizing
      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      const currentSizes = getPanesSizes(splitter, 'width');
      const newStart = previousSizes.startSize + resizeDelta;
      const newEnd = previousSizes.endSize - resizeDelta;
      expect(currentSizes.startSize).to.equal(newStart);
      expect(currentSizes.endSize).to.equal(newEnd);
    });

    it('should have default horizontal orientation', () => {
      expect(splitter.orientation).to.equal('horizontal');
      expect(splitter.hasAttribute('orientation')).to.be.true;
      expect(splitter.getAttribute('orientation')).to.equal('horizontal');

      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar.getAttribute('aria-orientation')).to.equal('horizontal');
    });

    it('should change orientation to vertical', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(splitter.orientation).to.equal('vertical');
      expect(splitter.getAttribute('orientation')).to.equal('vertical');

      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar.getAttribute('aria-orientation')).to.equal('vertical');
    });

    it('should set a default cursor on the bar in case splitter is not resizable or any pane is collapsed', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);

      const style = getComputedStyle(bar);
      expect(style.cursor).to.equal('col-resize');

      splitter.disableResize = true;
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      splitter.disableResize = false;
      splitter.toggle('end');
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('default');

      splitter.toggle('end');
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('col-resize');
    });

    it('should change the bar cursor based on the orientation', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);

      const style = getComputedStyle(bar);
      expect(style.cursor).to.equal('col-resize');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await nextFrame();

      expect(style.cursor).to.equal('row-resize');
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

  describe('Slotted content', () => {
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

    it('should update content when slot content changes', async () => {
      let slot = getSplitterSlot(splitter, 'start');
      let elements = slot.assignedElements();
      expect(elements[0].textContent).to.equal('Pane 1');

      elements[0].textContent = 'Updated Pane 1';
      await elementUpdated(splitter);

      slot = getSplitterSlot(splitter, 'start');
      elements = slot.assignedElements();
      expect(elements[0].textContent).to.equal('Updated Pane 1');
    });

    it('should render complex content (forms, tables, etc.) correctly', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createSplitterWithComplexContent()
      );
      await elementUpdated(splitter);

      const startSlot = getSplitterSlot(splitter, 'start');
      let elements = startSlot.assignedElements();
      let slottedDiv = elements.find(
        (el) => el.tagName.toLowerCase() === 'div'
      )!;
      let children = slottedDiv.children!;
      expect(children).to.have.lengthOf(3);
      expect(children[0].tagName.toLowerCase()).to.equal('h1');
      expect(children[1].tagName.toLowerCase()).to.equal('form');
      const formElements = children[1].children;
      expect(formElements).to.have.lengthOf(2);
      expect(formElements[0].tagName.toLowerCase()).to.equal('input');
      expect(formElements[1].tagName.toLowerCase()).to.equal('button');
      expect(children[2].tagName.toLowerCase()).to.equal('button');

      const endSlot = getSplitterSlot(splitter, 'end');
      elements = endSlot.assignedElements();
      slottedDiv = elements.find((el) => el.tagName.toLowerCase() === 'div')!;
      children = slottedDiv.children!;
      expect(children).to.have.lengthOf(2);
      expect(children[0].tagName.toLowerCase()).to.equal('h1');
      expect(children[1].tagName.toLowerCase()).to.equal('igc-tree');
    });
  });

  describe('Properties', () => {
    it('should reset pane sizes when orientation changes', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation: 'horizontal',
          startSize: '200px',
          startMinSize: '100px',
          startMaxSize: '300px',
          endSize: '100px',
          endMinSize: '100px',
          endMaxSize: '300px',
        })
      );
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, START_PART);
      const style = getComputedStyle(startPart);
      expect(style.flex).to.equal('0 1 200px');

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(style.flex).to.equal('1 1 0px');

      expect(splitter.startMinSize).to.be.undefined;
      expect(splitter.startMaxSize).to.be.undefined;

      // The DOM must not keep asserting sizes the component no longer holds
      for (const attribute of [
        'start-size',
        'start-min-size',
        'start-max-size',
        'end-size',
        'end-min-size',
        'end-max-size',
      ]) {
        expect(splitter.hasAttribute(attribute), attribute).to.be.false;
      }

      expect(style.minHeight).to.equal('0px');
      expect(style.maxHeight).to.equal('100%');
      expect(style.minWidth).to.equal('0px');
      expect(style.maxWidth).to.equal('100%');
    });

    it('should set pane sizes to alternative CSS units such as em, rem, etc.', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '5em',
          endSize: '2rem',
          splitterWidth: '1000px',
        })
      );
      await elementUpdated(splitter);

      document.body.style.fontSize = '16px';
      splitter.style.fontSize = '10px';
      // reflect changes in the document body styles
      splitter.requestUpdate();
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, START_PART);
      const style = getComputedStyle(startPart);

      const expectedStartSizeInPixels = 5 * 10; // 5em with font size of 10px
      expect(style.flex).to.equal(
        `0 1 ${expectedStartSizeInPixels.toString()}px`
      );

      const endPart = getSplitterPart(splitter, END_PART);
      const style2 = getComputedStyle(endPart);

      const expectedEndSizeInPixels = 2 * 16; // 2rem with root font size of 16px
      expect(style2.flex).to.equal(
        `0 1 ${expectedEndSizeInPixels.toString()}px`
      );

      // ARIA values should reflect the resolved pixel sizes as percentages
      const bar = getSplitterPart(splitter, BAR_PART);
      const totalSize = getTotalSize(splitter, 'width');
      const expectedAriaValueNow = roundPrecise(
        (expectedStartSizeInPixels / totalSize) * 100,
        0
      );
      expect(bar.getAttribute('aria-valuenow')).to.equal(
        expectedAriaValueNow.toString()
      );
    });

    it('should properly set default min/max values when not specified', async () => {
      await elementUpdated(splitter);

      const startPart = getSplitterPart(splitter, START_PART);
      const style = getComputedStyle(startPart);
      expect(style.flex).to.equal('1 1 0px');

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

      const startPane = getSplitterPart(splitter, START_PART);
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

      const startPane = getSplitterPart(splitter, START_PART);
      const style = getComputedStyle(startPane);
      expect(style.minHeight).to.equal('100px');
      expect(style.maxHeight).to.equal('500px');
    });

    it('should handle percentage sizes - horizontal and vertical', async () => {
      const testPercentageSizes = async (orientation: SplitterOrientation) => {
        const splitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            orientation,
            startSize: '30%',
            endSize: '70%',
            startMinSize: '20%',
            startMaxSize: '80%',
            splitterWidth: '1000px',
          })
        );
        await elementUpdated(splitter);

        const totalAvailable = getTotalSize(
          splitter,
          orientation === 'horizontal' ? 'width' : 'height'
        );
        const startPane = getSplitterPart(splitter, START_PART);
        const style1 = getComputedStyle(startPane);

        const endPane = getSplitterPart(splitter, END_PART);
        const style2 = getComputedStyle(endPane);
        const sizes = getPanesSizes(
          splitter,
          orientation === 'horizontal' ? 'width' : 'height'
        );

        expect(sizes.startSize).to.be.closeTo(totalAvailable * 0.3, 2);
        expect(sizes.endSize).to.be.closeTo(totalAvailable * 0.7, 2);

        expect(splitter.startSize).to.equal('30%');
        expect(splitter.endSize).to.equal('70%');
        expect(style1.flex).to.equal('0 1 30%');
        expect(style2.flex).to.equal('0 1 70%');

        expect(splitter.startMinSize).to.equal('20%');
        expect(splitter.startMaxSize).to.equal('80%');

        const bar = getSplitterPart(splitter, BAR_PART);
        expect(bar.getAttribute('aria-valuenow')).to.equal('30');
        expect(bar.getAttribute('aria-valuemin')).to.equal('20');
        expect(bar.getAttribute('aria-valuemax')).to.equal('80');

        const minProp = orientation === 'horizontal' ? 'minWidth' : 'minHeight';
        expect(style1[minProp]).to.equal('20%');
        const maxProp = orientation === 'horizontal' ? 'maxWidth' : 'maxHeight';
        expect(style1[maxProp]).to.equal('80%');
      };

      await testPercentageSizes('horizontal');
      await testPercentageSizes('vertical');
    });

    it('should handle mixed % and auto size - horizontal and vertical', async () => {
      const testMixedSizes = async (orientation: SplitterOrientation) => {
        const splitter = await fixture<IgcSplitterComponent>(
          createTwoPanesWithSizesAndConstraints({
            orientation,
            endSize: '30%',
            splitterWidth: '1000px',
          })
        );
        await elementUpdated(splitter);

        const totalAvailable = getTotalSize(
          splitter,
          orientation === 'horizontal' ? 'width' : 'height'
        );

        const startPart = getSplitterPart(splitter, START_PART);
        const style = getComputedStyle(startPart);
        expect(style.flex).to.equal('1 1 0px');

        const sizes = getPanesSizes(
          splitter,
          orientation === 'horizontal' ? 'width' : 'height'
        );
        const expectedEndSize = roundPrecise((30 / 100) * totalAvailable, 2);
        expect(sizes.endSize).to.be.closeTo(expectedEndSize, 2);

        // When only one size is set, the other panel fills remaining space
        expect(sizes.startSize).to.be.closeTo(
          totalAvailable - expectedEndSize,
          2
        );

        const endPart = getSplitterPart(splitter, END_PART);
        const styleEnd = getComputedStyle(endPart);
        expect(styleEnd.flex).to.equal('0 1 30%');
      };
      await testMixedSizes('horizontal');
      await testMixedSizes('vertical');
    });

    it('should get/set startCollapsed and endCollapsed', async () => {
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.false;

      splitter.startCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      splitter.startCollapsed = false;
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;

      splitter.endCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.endCollapsed).to.be.true;
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;
    });

    it('should enforce mutual exclusivity when setting startCollapsed/endCollapsed directly', async () => {
      splitter.endCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.endCollapsed).to.be.true;

      splitter.startCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;
    });

    it('should be a no-op when setting startCollapsed/endCollapsed to their current value', async () => {
      const eventSpy = spy(splitter, 'emitEvent');

      splitter.startCollapsed = false;
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.false;
      expect(eventSpy.called).to.be.false;

      splitter.startCollapsed = true;
      await elementUpdated(splitter);
      eventSpy.resetHistory();

      splitter.startCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.true;
      expect(eventSpy.called).to.be.false;
    });

    it('should reflect startCollapsed/endCollapsed as attributes', async () => {
      splitter.startCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.hasAttribute('start-collapsed')).to.be.true;
      expect(splitter.hasAttribute('end-collapsed')).to.be.false;

      splitter.startCollapsed = false;
      splitter.endCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.hasAttribute('start-collapsed')).to.be.false;
      expect(splitter.hasAttribute('end-collapsed')).to.be.true;
    });
  });

  describe('Methods, Events & Interactions', () => {
    it('should expand/collapse panes when toggle is invoked', async () => {
      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;

      splitter.toggle('end');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;

      // Single collapsed pane constraint
      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;

      splitter.toggle('end');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;

      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;
    });

    it('should update startCollapsed/endCollapsed when toggle is invoked, without emitting igcLayoutChanged', async () => {
      const eventSpy = spy(splitter, 'emitEvent');

      splitter.toggle('start');
      await elementUpdated(splitter);
      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.endCollapsed).to.be.false;

      splitter.toggle('end');
      await elementUpdated(splitter);
      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.endCollapsed).to.be.true;

      expect(eventSpy.calledWith('igcLayoutChanged')).to.be.false;
    });

    it('should restore pane sizes as percentages after collapse then expand', async () => {
      splitter.startSize = '200px';
      splitter.endSize = '30%';
      await elementUpdated(splitter);
      const containerSize = getContainerSize(splitter, 'width');

      const { startSize: initialStart } = getPanesSizes(splitter, 'width');
      const expectedStartPercent = `${roundPrecise((initialStart / containerSize) * 100, 2)}%`;

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(splitter.endSize).to.equal('auto');

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal(expectedStartPercent);

      const { endSize: currentEnd } = getPanesSizes(splitter, 'width');
      const expectedEndPercent = `${roundPrecise((currentEnd / containerSize) * 100, 2)}%`;

      splitter.toggle('end');
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('auto');
      expect(splitter.endSize).to.equal('auto');

      splitter.toggle('end');
      await elementUpdated(splitter);

      expect(splitter.endSize).to.equal(expectedEndPercent);
    });

    it('should not leave panes at a degenerate 0% size when expanding after a pane was collapsed via a property set before the first render', async () => {
      const preCollapsed = await fixture<IgcSplitterComponent>(html`
        <igc-splitter
          style="width: 500px; height: 500px;"
          .endCollapsed=${true}
        >
          <div slot="start">Pane 1</div>
          <div slot="end">Pane 2</div>
        </igc-splitter>
      `);
      await elementUpdated(preCollapsed);

      expect(preCollapsed.endCollapsed).to.be.true;

      preCollapsed.endCollapsed = false;
      await elementUpdated(preCollapsed);

      expect(preCollapsed.startSize).to.equal('auto');
      expect(preCollapsed.endSize).to.equal('auto');

      const sizes = getPanesSizes(preCollapsed, 'width');
      expect(sizes.startSize).to.be.greaterThan(0);
      expect(sizes.endSize).to.be.greaterThan(0);
    });

    it('should toggle the next pane when the bar expander-end parts are clicked', async () => {
      let parts = getButtonParts(splitter);

      simulatePointerDown(parts.endCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      parts = getButtonParts(splitter);

      expect(splitter.matches(':state(end-collapsed)')).to.be.true;
      expect(parts.startCollapseBtn).to.be.null;
      expect(parts.endCollapseBtn.hidden).to.be.true;
      expect(parts.startExpander).to.be.null;
      expect(parts.endExpander.hidden).to.be.false;

      simulatePointerDown(parts.endExpander, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      parts = getButtonParts(splitter);
      expect(parts.startCollapseBtn.hidden).to.be.false;
      expect(parts.endCollapseBtn.hidden).to.be.false;
      expect(parts.startExpander).to.be.null;
      expect(parts.endExpander).to.be.null;
    });

    it('should toggle the previous pane when the bar expander-start parts are clicked', async () => {
      let parts = getButtonParts(splitter);

      simulatePointerDown(parts.startCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      parts = getButtonParts(splitter);

      expect(splitter.matches(':state(start-collapsed)')).to.be.true;
      expect(parts.startCollapseBtn.hidden).to.be.true;
      expect(parts.startExpander.hidden).to.be.false;
      expect(parts.endCollapseBtn).to.be.null;
      expect(parts.endExpander).to.be.null;

      simulatePointerDown(parts.startExpander, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      parts = getButtonParts(splitter);

      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
      expect(parts.startCollapseBtn.hidden).to.be.false;
      expect(parts.endCollapseBtn.hidden).to.be.false;
      expect(parts.startExpander).to.be.null;
      expect(parts.endExpander).to.be.null;
    });

    it('should emit igcLayoutChanged when a collapse/expand button is clicked', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const containerSize = getContainerSize(splitter, 'width');
      let parts = getButtonParts(splitter);

      let { startSize: preCollapseStart, endSize: preCollapseEnd } =
        getPanesSizes(splitter, 'width');
      let expectedStartPercent = `${roundPrecise((preCollapseStart / containerSize) * 100, 2)}%`;
      let expectedEndPercent = `${roundPrecise((preCollapseEnd / containerSize) * 100, 2)}%`;

      simulatePointerDown(parts.startCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: expectedStartPercent,
          endSize: expectedEndPercent,
          startCollapsed: true,
          endCollapsed: false,
        },
      });
      expect(splitter.startCollapsed).to.be.true;

      eventSpy.resetHistory();
      parts = getButtonParts(splitter);

      simulatePointerDown(parts.startExpander, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: splitter.startSize,
          endSize: splitter.endSize,
          startCollapsed: false,
          endCollapsed: false,
        },
      });
      expect(splitter.startCollapsed).to.be.false;

      eventSpy.resetHistory();
      parts = getButtonParts(splitter);

      ({ startSize: preCollapseStart, endSize: preCollapseEnd } = getPanesSizes(
        splitter,
        'width'
      ));
      expectedStartPercent = `${roundPrecise((preCollapseStart / containerSize) * 100, 2)}%`;
      expectedEndPercent = `${roundPrecise((preCollapseEnd / containerSize) * 100, 2)}%`;

      simulatePointerDown(parts.endCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: expectedStartPercent,
          endSize: expectedEndPercent,
          startCollapsed: false,
          endCollapsed: true,
        },
      });
      expect(splitter.endCollapsed).to.be.true;
    });

    it('should not emit igcLayoutChanged when startCollapsed/endCollapsed are set directly', async () => {
      const eventSpy = spy(splitter, 'emitEvent');

      splitter.startCollapsed = true;
      await elementUpdated(splitter);
      splitter.startCollapsed = false;
      await elementUpdated(splitter);
      splitter.endCollapsed = true;
      await elementUpdated(splitter);

      expect(eventSpy.calledWith('igcLayoutChanged')).to.be.false;
    });

    it('should set tabindex correctly on the bar based on interactivity', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);

      expect(bar.getAttribute('tabindex')).to.equal('0');

      splitter.disableResize = true;
      await elementUpdated(splitter);
      expect(bar.getAttribute('tabindex')).to.equal('0');

      splitter.disableResize = false;
      splitter.disableCollapse = true;
      await elementUpdated(splitter);
      expect(bar.getAttribute('tabindex')).to.equal('0');

      splitter.disableResize = true;
      await elementUpdated(splitter);
      expect(bar.getAttribute('tabindex')).to.equal('-1');
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

      const newStart = previousSizes.startSize + deltaX;
      const newEnd = previousSizes.endSize - deltaX;

      let startArgs = {
        startPanelSize: previousSizes.startSize,
        endPanelSize: previousSizes.endSize,
      };
      let resizingArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
        delta: deltaX,
      };
      let endArgs = resizingArgs;

      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);

      deltaX *= -1;
      await resize(splitter, deltaX, 0);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);

      startArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
      };
      resizingArgs = {
        startPanelSize: currentSizes.startSize,
        endPanelSize: currentSizes.endSize,
        delta: deltaX,
      };
      endArgs = resizingArgs;

      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);
    });

    it('should resize vertically in both directions', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await finishAnimationsFor(splitter.shadowRoot!);

      const previousSizes = getPanesSizes(splitter, 'height');
      let deltaY = 100;

      await resize(splitter, 0, deltaY);

      let currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaY);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaY);

      const newStart = previousSizes.startSize + deltaY;
      const newEnd = previousSizes.endSize - deltaY;

      let startArgs = {
        startPanelSize: previousSizes.startSize,
        endPanelSize: previousSizes.endSize,
      };
      let resizingArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
        delta: deltaY,
      };
      let endArgs = resizingArgs;

      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);

      deltaY *= -1;
      await resize(splitter, 0, deltaY);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);
      startArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
      };
      resizingArgs = {
        startPanelSize: currentSizes.startSize,
        endPanelSize: previousSizes.endSize,
        delta: deltaY,
      };
      endArgs = resizingArgs;
      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);
    });

    it('should still emit igcResizeEnd and igcLayoutChanged when a drag ends with zero net delta', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const previousSizes = getPanesSizes(splitter, 'width');

      await resize(splitter, 0, 0);

      expect(eventSpy).calledWith('igcResizeEnd', {
        detail: {
          startPanelSize: previousSizes.startSize,
          endPanelSize: previousSizes.endSize,
          delta: 0,
        },
      });
      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: splitter.startSize,
          endSize: splitter.endSize,
          startCollapsed: false,
          endCollapsed: false,
        },
      });

      const currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes).to.deep.equal(previousSizes);
    });

    it('should respect minSize and maxSize constraints when resizing with arrows', async () => {
      splitter.style.width = '1000px';
      splitter.startMinSize = '100px';
      splitter.startMaxSize = '400px';
      splitter.endMinSize = '50px';
      splitter.startSize = '250px';
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      // resize below minSize
      for (let i = 0; i < 20; i++) {
        simulateKeyboard(bar, arrowLeft);
        await elementUpdated(splitter);
      }

      let currentSizes = getPanesSizes(splitter, 'width');
      // should stop at minSize (100px)
      expect(currentSizes.startSize).to.be.closeTo(100, 1);

      splitter.startSize = '250px';
      await elementUpdated(splitter);

      // resize beyond maxSize
      for (let i = 0; i < 20; i++) {
        simulateKeyboard(bar, arrowRight);
        await elementUpdated(splitter);
      }

      currentSizes = getPanesSizes(splitter, 'width');
      // should stop exactly at maxSize (400px) - the pane sizes now sum to the
      // available space, so flex-shrink no longer eats into the constraint
      expect(currentSizes.startSize).to.be.closeTo(400, 2);

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      splitter.startMinSize = '150px';
      splitter.startMaxSize = '350px';
      splitter.endMinSize = '50px';
      splitter.style.height = '1000px';
      splitter.startSize = '250px';
      await elementUpdated(splitter);

      bar.focus();
      await elementUpdated(splitter);

      for (let i = 0; i < 15; i++) {
        simulateKeyboard(bar, arrowUp);
        await elementUpdated(splitter);
      }

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.be.closeTo(150, 2);

      splitter.startSize = '250px';
      await elementUpdated(splitter);

      for (let i = 0; i < 15; i++) {
        simulateKeyboard(bar, arrowDown);
        await elementUpdated(splitter);
      }

      currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.be.closeTo(350, 2);
    });

    it('should resize horizontally by 10px delta with left/right arrow keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
      let previousSizes = getPanesSizes(splitter, 'width');
      const resizeDelta = 10;

      bar.focus();
      await elementUpdated(splitter);

      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      let newStart = previousSizes.startSize + resizeDelta;
      let newEnd = previousSizes.endSize - resizeDelta;
      expect(currentSizes.startSize).to.equal(newStart);
      expect(currentSizes.endSize).to.equal(newEnd);

      // Focus is not lost during resize
      expect(bar.getAttribute('tabindex')).to.equal('0');

      let startArgs = {
        startPanelSize: previousSizes.startSize,
        endPanelSize: previousSizes.endSize,
      };
      let resizingArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
        delta: resizeDelta,
      };
      let endArgs = resizingArgs;

      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);

      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');
      newStart = previousSizes.startSize + resizeDelta * 2;
      newEnd = previousSizes.endSize - resizeDelta * 2;
      expect(currentSizes.startSize).to.equal(newStart);
      expect(currentSizes.endSize).to.equal(newEnd);

      expect(bar.getAttribute('tabindex')).to.equal('0');

      startArgs = {
        startPanelSize: previousSizes.startSize + resizeDelta,
        endPanelSize: previousSizes.endSize - resizeDelta,
      };
      resizingArgs = {
        startPanelSize: newStart,
        endPanelSize: newEnd,
        delta: resizeDelta,
      };
      endArgs = resizingArgs;
      checkResizeEvents(eventSpy, startArgs, resizingArgs, endArgs);

      previousSizes = getPanesSizes(splitter, 'width');
      simulateKeyboard(bar, arrowLeft);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      newStart = previousSizes.startSize - resizeDelta;
      newEnd = previousSizes.endSize + resizeDelta;
      expect(currentSizes.startSize).to.equal(newStart);
      expect(currentSizes.endSize).to.equal(newEnd);

      checkResizeEvents(eventSpy);
    });

    it('should resize vertically by 10px delta with up/down arrow keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await finishAnimationsFor(splitter.shadowRoot!);

      const bar = getSplitterPart(splitter, BAR_PART);
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

    it('should set start pane size to minSize/maxSize with Home/End key in horizontal orientation', async () => {
      splitter.startMinSize = '100px';
      splitter.startMaxSize = '80%';
      await elementUpdated(splitter);

      const containerSize = getContainerSize(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, homeKey);
      await elementUpdated(splitter);

      // Home/End go through the same pipeline as a drag, so the resulting unit
      // follows the pane it is applied to - both were `auto`, hence percentages.
      const minPercent = roundPrecise(asPercent(100, containerSize), 2);
      expect(splitter.startSize).to.equal(`${minPercent}%`);
      expect(splitter.endSize).to.equal(
        `${roundPrecise(asPercent(totalAvailable - 100, containerSize), 2)}%`
      );

      expect(bar.getAttribute('aria-valuenow')).to.equal(
        Math.round(minPercent).toString()
      );

      simulateKeyboard(bar, endKey);
      await elementUpdated(splitter);

      // 80% of the container is the max; the end pane keeps what is left of
      // the space the panes actually share.
      expect(splitter.startSize).to.equal('80%');
      expect(splitter.endSize).to.equal(
        `${roundPrecise(asPercent(totalAvailable - 0.8 * containerSize, containerSize), 2)}%`
      );

      expect(bar.getAttribute('aria-valuenow')).to.equal('80');
      expect(bar.getAttribute('aria-valuemax')).to.equal('80');
    });

    it('should set start pane size to minSize/maxSize with Home/End key in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await finishAnimationsFor(splitter.shadowRoot!);

      const containerSize = getContainerSize(splitter, 'height');
      const totalAvailable = getTotalSize(splitter, 'height');
      const allOfIt = `${roundPrecise(asPercent(totalAvailable, containerSize), 2)}%`;
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, homeKey);
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('0%');
      expect(splitter.endSize).to.equal(allOfIt);

      simulateKeyboard(bar, endKey);
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal(allOfIt);
      expect(splitter.endSize).to.equal('0%');
    });

    it('should emit resize and layout changed events with Home/End keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      const previousSizes = getPanesSizes(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');

      simulateKeyboard(bar, homeKey);
      await elementUpdated(splitter);

      let delta = 0 - previousSizes.startSize;
      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: splitter.startSize,
          endSize: splitter.endSize,
          startCollapsed: false,
          endCollapsed: false,
        },
      });
      checkResizeEvents(
        eventSpy,
        {
          startPanelSize: previousSizes.startSize,
          endPanelSize: previousSizes.endSize,
        },
        { startPanelSize: 0, endPanelSize: totalAvailable, delta },
        { startPanelSize: 0, endPanelSize: totalAvailable, delta }
      );

      simulateKeyboard(bar, endKey);
      await elementUpdated(splitter);

      delta = totalAvailable;
      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: splitter.startSize,
          endSize: splitter.endSize,
          startCollapsed: false,
          endCollapsed: false,
        },
      });
      checkResizeEvents(
        eventSpy,
        { startPanelSize: 0, endPanelSize: totalAvailable },
        { startPanelSize: totalAvailable, endPanelSize: 0, delta },
        { startPanelSize: totalAvailable, endPanelSize: 0, delta }
      );
    });

    it('should not resize with left/right keys when in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await finishAnimationsFor(splitter.shadowRoot!);

      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
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
      const bar = getSplitterPart(splitter, BAR_PART);
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

    it('should expand/collapse panes with Ctrl + left/right arrow keys in horizontal orientation', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      const splitterSize = splitter.getBoundingClientRect().width;
      const barSize = bar.getBoundingClientRect().width;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      // Focus is not lost during collapse
      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;
      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
      expect(bar.getAttribute('tabindex')).to.equal('0');
    });

    it('should emit igcLayoutChanged when collapsing/expanding via Ctrl + arrow keys', async () => {
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      const containerSize = getContainerSize(splitter, 'width');
      const { startSize: preCollapseStart, endSize: preCollapseEnd } =
        getPanesSizes(splitter, 'width');
      const expectedStartPercent = `${roundPrecise((preCollapseStart / containerSize) * 100, 2)}%`;
      const expectedEndPercent = `${roundPrecise((preCollapseEnd / containerSize) * 100, 2)}%`;

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: expectedStartPercent,
          endSize: expectedEndPercent,
          startCollapsed: true,
          endCollapsed: false,
        },
      });

      eventSpy.resetHistory();
      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      expect(eventSpy).calledWith('igcLayoutChanged', {
        detail: {
          startSize: splitter.startSize,
          endSize: splitter.endSize,
          startCollapsed: false,
          endCollapsed: false,
        },
      });
    });

    it('should expand/collapse panes with Ctrl + up/down arrow keys in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);
      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'height');
      const splitterSize = splitter.getBoundingClientRect().height;
      const barSize = bar.getBoundingClientRect().height;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;
      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;
      expect(bar.getAttribute('tabindex')).to.equal('0');

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
    });

    it('should not resize when disableResize is true', async () => {
      splitter.disableResize = true;
      await elementUpdated(splitter);

      const eventSpy = spy(splitter, 'emitEvent');
      let previousSizes = getPanesSizes(splitter, 'width');
      const bar = getSplitterPart(splitter, BAR_PART);
      // Splitter bar is still visible but non-interactive
      expect(bar).to.exist;
      expect(bar.hidden).to.be.false;
      // Bar handle is hidden
      const barHandle = getSplitterPart(splitter, DRAG_HANDLE_PART);
      expect(barHandle).to.exist;
      expect(barHandle.hidden).to.be.true;

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

    it('should not expand/collapse panes with Ctrl + arrow keys when disableCollapse is true', async () => {
      splitter.disableCollapse = true;
      await elementUpdated(splitter);

      expect(splitter.disableCollapse).to.be.true;
      expect(splitter.hasAttribute('disable-collapse')).to.be.true;

      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);
      await nextFrame();

      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
    });

    it('should expand/collapse panes via keyboard and API when hideCollapseButtons is true', async () => {
      splitter.hideCollapseButtons = true;
      await elementUpdated(splitter);

      expect(splitter.hideCollapseButtons).to.be.true;
      expect(splitter.hasAttribute('hide-collapse-buttons')).to.be.true;

      const bar = getSplitterPart(splitter, BAR_PART);

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      const splitterSize = splitter.getBoundingClientRect().width;
      const barSize = bar.getBoundingClientRect().width;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      splitter.toggle('start');
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;
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

  describe('Resizing with constraints', () => {
    const testMinMaxConstraintsPx = async (
      orientation: SplitterOrientation
    ) => {
      const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          startSize: '200px',
          startMinSize: '100px',
          startMaxSize: '300px',
          endSize: '200px',
          endMinSize: '100px',
          endMaxSize: '300px',
        })
      );
      await elementUpdated(mixedConstraintSplitter);

      const isX = orientation === 'horizontal';
      let delta = 1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      let sizes = getPanesSizes(
        mixedConstraintSplitter,
        isX ? 'width' : 'height'
      );
      expect(sizes.startSize).to.equal(300);

      delta = -1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      sizes = getPanesSizes(mixedConstraintSplitter, isX ? 'width' : 'height');
      expect(sizes.startSize).to.equal(100);

      delta = 1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);
      sizes = getPanesSizes(mixedConstraintSplitter, isX ? 'width' : 'height');
      expect(sizes.endSize).to.equal(100);

      delta = -1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      sizes = getPanesSizes(mixedConstraintSplitter, isX ? 'width' : 'height');
      expect(sizes.endSize).to.equal(300);
    };

    const testMinMaxConstraintsInPercentage = async (
      orientation: SplitterOrientation
    ) => {
      const constraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          startSize: '30%',
          startMinSize: '10%',
          startMaxSize: '80%',
          endSize: '70%',
          endMinSize: '20%',
          endMaxSize: '90%',
        })
      );
      await elementUpdated(constraintSplitter);

      const isX = orientation === 'horizontal';

      const totalAvailable = getTotalSize(
        constraintSplitter,
        isX ? 'width' : 'height'
      );

      let delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      let sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');
      const expectedStartMax = Math.round((totalAvailable * 80) / 100);
      expect(sizes.startSize).to.be.closeTo(expectedStartMax, 2);

      delta = -1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');
      const expectedStartMin = Math.round((totalAvailable * 10) / 100);
      expect(sizes.startSize).to.be.closeTo(expectedStartMin, 2);

      delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');
      const expectedEndMin = Math.round((totalAvailable * 20) / 100);
      expect(sizes.endSize).to.be.closeTo(expectedEndMin, 2);

      delta = -1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');
      const expectedEndMax = Math.round((totalAvailable * 90) / 100);
      expect(sizes.endSize).to.be.closeTo(expectedEndMax, 2);
    };

    const testConflictingConstraintsInPx = async (
      orientation: SplitterOrientation
    ) => {
      const constraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          startSize: '200px',
          startMinSize: '100px',
          startMaxSize: '400px',
          endSize: '200px',
          endMinSize: '150px',
          endMaxSize: '350px',
        })
      );
      await elementUpdated(constraintSplitter);

      const isX = orientation === 'horizontal';

      const totalAvailable = getTotalSize(
        constraintSplitter,
        isX ? 'width' : 'height'
      );

      const initialSizes = getPanesSizes(
        constraintSplitter,
        isX ? 'width' : 'height'
      );
      const initialCombinedSize = initialSizes.startSize + initialSizes.endSize;

      // Try to grow start pane to max, but end pane has min (150px)
      // Result: Start pane can only grow as much as end pane allows
      const delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');

      // Start pane can only grow until end pane hits its minSize
      // Within the initial combined size of 400px - because of flex basis
      expect(sizes.startSize).to.equal(250);
      expect(sizes.endSize).to.equal(150);

      expect(sizes.startSize + sizes.endSize).to.equal(initialCombinedSize);
      expect(sizes.startSize + sizes.endSize).to.be.at.most(totalAvailable);
    };

    const testConflictingConstraintsInPercentage = async (
      orientation: SplitterOrientation
    ) => {
      const constraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          startSize: '40%',
          startMinSize: '20%',
          startMaxSize: '80%',
          endSize: '60%',
          endMinSize: '30%',
          endMaxSize: '70%',
        })
      );
      await elementUpdated(constraintSplitter);

      const isX = orientation === 'horizontal';
      const totalAvailable = getTotalSize(
        constraintSplitter,
        isX ? 'width' : 'height'
      );

      const initialSizes = getPanesSizes(
        constraintSplitter,
        isX ? 'width' : 'height'
      );
      const initialCombinedSize = initialSizes.startSize + initialSizes.endSize;

      // Try to grow start pane to max (80%), but end pane has min (30%)
      // Result: Start pane can only grow as much as end pane allows
      const delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');

      // Start pane can only grow until end pane hits its minSize (30% of 495px)
      // Within the initial combined size - because of flex basis
      const expectedEndMin = Math.round((totalAvailable * 30) / 100);
      const expectedStartAfterResize = initialCombinedSize - expectedEndMin;

      expect(sizes.startSize).to.be.closeTo(expectedStartAfterResize, 2);
      expect(sizes.endSize).to.be.closeTo(expectedEndMin, 2);

      expect(sizes.startSize + sizes.endSize).to.be.closeTo(
        initialCombinedSize,
        2
      );
      expect(sizes.startSize + sizes.endSize).to.be.at.most(totalAvailable);
    };

    const testMixedConstraintsPxAndPercentage = async (
      orientation: SplitterOrientation
    ) => {
      const mixedConstraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          startMinSize: '100px',
          startMaxSize: '50%',
        })
      );
      await elementUpdated(mixedConstraintSplitter);

      const startPane = getSplitterPart(mixedConstraintSplitter, START_PART);
      const style = getComputedStyle(startPane);

      expect(mixedConstraintSplitter.startMinSize).to.equal('100px');
      expect(mixedConstraintSplitter.startMaxSize).to.equal('50%');
      const targetMinProp =
        orientation === 'horizontal' ? 'minWidth' : 'minHeight';
      const targetMaxProp =
        orientation === 'horizontal' ? 'maxWidth' : 'maxHeight';
      expect(style[targetMinProp]).to.equal('100px');
      expect(style[targetMaxProp]).to.equal('50%');

      const isX = orientation === 'horizontal';
      const axis = isX ? 'width' : 'height';
      const totalAvailable = getTotalSize(mixedConstraintSplitter, axis);
      // `max-width: 50%` resolves against the container in CSS, and the drag
      // math now uses that same basis.
      const expectedStartMax = Math.round(
        (getContainerSize(mixedConstraintSplitter, axis) * 50) / 100
      );

      let delta = 1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizes = getPanesSizes(mixedConstraintSplitter, axis);
      expect(sizes.startSize).to.be.closeTo(expectedStartMax, 2);
      expect(sizes.endSize).to.be.closeTo(totalAvailable - expectedStartMax, 2);

      delta = -1000;
      await resize(mixedConstraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizesAfterSecondResize = getPanesSizes(
        mixedConstraintSplitter,
        isX ? 'width' : 'height'
      );
      expect(sizesAfterSecondResize.startSize).to.equal(100);
      expect(sizesAfterSecondResize.endSize).to.equal(totalAvailable - 100);
    };

    const testConstraintsPxAndAutoSizes = async (
      orientation: SplitterOrientation
    ) => {
      const startMaxSize = 400;
      const startMinSize = 100;
      const endMaxSize = 350;
      const endMinSize = 150;
      const constraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          endSize: '200px',
          startMinSize: `${startMinSize}px`,
          startMaxSize: `${startMaxSize}px`,
          endMinSize: `${endMinSize}px`,
          endMaxSize: `${endMaxSize}px`,
        })
      );
      await elementUpdated(constraintSplitter);

      const isX = orientation === 'horizontal';

      const totalAvailable = getTotalSize(
        constraintSplitter,
        isX ? 'width' : 'height'
      );

      const initialSizes = getPanesSizes(
        constraintSplitter,
        isX ? 'width' : 'height'
      );
      const initialCombinedSize = initialSizes.startSize + initialSizes.endSize;

      // Try to grow start pane to max, but end pane has min (150px)
      // Result: Start pane can only grow as much as end pane allows
      const delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');

      // Start pane can only grow until end pane hits its minSize
      expect(sizes.startSize).to.equal(totalAvailable - endMinSize);
      expect(sizes.endSize).to.equal(endMinSize);

      expect(sizes.startSize + sizes.endSize).to.equal(initialCombinedSize);
      expect(sizes.startSize + sizes.endSize).to.be.at.most(totalAvailable);
    };

    const testConstraintsPercentAndAutoSizes = async (
      orientation: SplitterOrientation
    ) => {
      const constraintSplitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation,
          endSize: '40%',
          startMinSize: '20%',
          startMaxSize: '80%',
          endMinSize: '30%',
          endMaxSize: '70%',
        })
      );
      await elementUpdated(constraintSplitter);

      const isX = orientation === 'horizontal';
      const totalAvailable = getTotalSize(
        constraintSplitter,
        isX ? 'width' : 'height'
      );

      const initialSizes = getPanesSizes(
        constraintSplitter,
        isX ? 'width' : 'height'
      );
      const initialCombinedSize = initialSizes.startSize + initialSizes.endSize;

      // Try to grow start pane to max (80%), but end pane has min (30%)
      // Result: Start pane can only grow as much as end pane allows
      const delta = 1000;
      await resize(constraintSplitter, isX ? delta : 0, isX ? 0 : delta);

      const sizes = getPanesSizes(constraintSplitter, isX ? 'width' : 'height');

      // Start pane can only grow until end pane hits its minSize (30% of total)
      const expectedEndMin = Math.round((totalAvailable * 30) / 100);
      const expectedStartAfterResize = totalAvailable - expectedEndMin;

      expect(sizes.startSize).to.be.closeTo(expectedStartAfterResize, 2);
      expect(sizes.endSize).to.be.closeTo(expectedEndMin, 2);

      expect(sizes.startSize + sizes.endSize).to.be.closeTo(
        initialCombinedSize,
        2
      );
      expect(sizes.startSize + sizes.endSize).to.be.at.most(totalAvailable);
    };

    describe('Horizontal orientation', () => {
      it('should honor minSize and maxSize constraints when resizing, constraints in px', async () => {
        await testMinMaxConstraintsPx('horizontal');
      });

      it('should honor minSize and maxSize constraints when resizing, constraints in %', async () => {
        await testMinMaxConstraintsInPercentage('horizontal');
      });

      it('should respect both panes constraints when they conflict during resize in px', async () => {
        await testConflictingConstraintsInPx('horizontal');
      });

      it('should respect both panes constraints when they conflict during resize in %', async () => {
        await testConflictingConstraintsInPercentage('horizontal');
      });

      it('should handle mixed px and % constraints - start in px; end in %', async () => {
        await testMixedConstraintsPxAndPercentage('horizontal');
      });

      it('should handle resize with mixed % and auto size', async () => {
        await testConstraintsPercentAndAutoSizes('horizontal');
      });

      it('should handle mixed px and auto size', async () => {
        await testConstraintsPxAndAutoSizes('horizontal');
      });
    });

    describe('Vertical orientation', () => {
      it('should honor minSize and maxSize constraints when resizing - constraints in px - vertical', async () => {
        await testMinMaxConstraintsPx('vertical');
      });

      it('should honor minSize and maxSize constraints when resizing, constraints in % - vertical', async () => {
        await testMinMaxConstraintsInPercentage('vertical');
      });

      it('should respect both panes constraints when they conflict during resize in px - vertical', async () => {
        await testConflictingConstraintsInPx('vertical');
      });

      it('should respect both panes constraints when they conflict during resize in % - vertical', async () => {
        await testConflictingConstraintsInPercentage('vertical');
      });

      it('should handle mixed px and % constraints - start in px; end in %', async () => {
        await testMixedConstraintsPxAndPercentage('vertical');
      });

      it('should handle resize with mixed % and auto size - vertical', async () => {
        await testConstraintsPercentAndAutoSizes('vertical');
      });

      it('should handle resize with mixed px and auto size - vertical', async () => {
        await testConstraintsPxAndAutoSizes('vertical');
      });
    });

    it('should result in % sizes after resize when the panes size is auto', async () => {
      const previousSizes = getPanesSizes(splitter, 'width');
      const deltaX = 100;

      await resize(splitter, deltaX, 0);
      await elementUpdated(splitter);

      const currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaX);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaX);
      expect(splitter.startSize).to.contain('%');
      expect(splitter.endSize).to.contain('%');
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

      const bar = getSplitterPart(splitter, BAR_PART);
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
      checkPanesAreWithinBounds(
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

      const bar = getSplitterPart(splitter, BAR_PART);
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
      checkPanesAreWithinBounds(
        splitter,
        currentSizes.startSize,
        currentSizes.endSize,
        'y'
      );
    });

    it('should properly resize after switching orientation (horizontal -> vertical -> horizontal) w/ constraints', async () => {
      splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          orientation: 'horizontal',
          startSize: '100px',
          startMinSize: '100px',
          startMaxSize: '300px',
          endSize: '100px',
          endMinSize: '100px',
          endMaxSize: '300px',
        })
      );
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);

      splitter.orientation = 'horizontal';
      await elementUpdated(splitter);

      const previousSizes = getPanesSizes(splitter, 'width');
      const deltaX = 100;

      await resize(splitter, deltaX, 0);
      await elementUpdated(splitter);

      const currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaX);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaX);
    });
  });

  describe('Behavior on splitter/container resize', () => {
    it('should maintain panes sizes in px on splitter resize', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '200px',
          endSize: '200px',
          splitterWidth: '600px',
        })
      );
      await elementUpdated(splitter);

      splitter.style.width = '800px';
      await elementUpdated(splitter);

      const newSizes = getPanesSizes(splitter, 'width');

      expect(newSizes.startSize).to.equal(200);
      expect(newSizes.endSize).to.equal(200);
    });

    it('should handle panes sizes in % on window resize', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '20%',
          endSize: '20%',
          splitterWidth: '1000px',
        })
      );
      await elementUpdated(splitter);

      splitter.style.width = '800px';
      await elementUpdated(splitter);

      const newSizes = getPanesSizes(splitter, 'width');

      expect(newSizes.startSize).to.equal(0.2 * 800);
      expect(newSizes.endSize).to.equal(0.2 * 800);
    });

    it('should handle panes sizes with mixed px and % on window resize', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '200px',
          endSize: '20%',
          splitterWidth: '1000px',
        })
      );
      await elementUpdated(splitter);

      splitter.style.width = '800px';
      await elementUpdated(splitter);

      const newSizes = getPanesSizes(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.startSize).to.equal(200);
      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.2, 2);
    });

    it('should handle sizes on window resize with auto and % sizes', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          endSize: '30%',
          splitterWidth: '1000px',
        })
      );
      await elementUpdated(splitter);

      splitter.style.width = '800px';
      await elementUpdated(splitter);

      const newSizes = getPanesSizes(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.3, 2);
      expect(newSizes.startSize).to.equal(totalAvailable - newSizes.endSize);
    });

    it('component adapts when container size changes', async () => {
      const container = await fixture<HTMLDivElement>(
        createSplitterInContainer({
          startSize: '300px',
          endSize: '40%',
          containerWidth: '800px',
        })
      );
      const splitter = container.querySelector(
        'igc-splitter'
      ) as IgcSplitterComponent;
      await elementUpdated(splitter);

      container.style.width = '1200px';
      await elementUpdated(splitter);

      let newSizes = getPanesSizes(splitter, 'width');
      let totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.startSize).to.equal(300);
      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.4, 3);

      container.style.width = '600px';
      await elementUpdated(splitter);

      newSizes = getPanesSizes(splitter, 'width');
      totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.startSize).to.equal(300);
      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.4, 3);
      expect(newSizes.startSize + newSizes.endSize).to.be.at.most(
        totalAvailable
      );
    });

    it('relative sizes (percentages) update correctly', async () => {
      const container = await fixture<HTMLDivElement>(
        createSplitterInContainer({
          startSize: '25%',
          endSize: '50%',
          containerWidth: '1000px',
        })
      );
      const splitter = container.querySelector(
        'igc-splitter'
      ) as IgcSplitterComponent;
      await elementUpdated(splitter);

      const initialSizes = getPanesSizes(splitter, 'width');
      const initialTotal = getTotalSize(splitter, 'width');

      // increase tolerance to 3px to account for rounding differences in percentage calculations across browsers
      expect(initialSizes.startSize).to.be.closeTo(initialTotal * 0.25, 3);
      expect(initialSizes.endSize).to.be.closeTo(initialTotal * 0.5, 3);

      container.style.width = '1600px';
      await elementUpdated(splitter);

      let newSizes = getPanesSizes(splitter, 'width');
      let totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.startSize).to.be.closeTo(totalAvailable * 0.25, 3);
      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.5, 3);

      container.style.width = '500px';
      await elementUpdated(splitter);

      newSizes = getPanesSizes(splitter, 'width');
      totalAvailable = getTotalSize(splitter, 'width');

      expect(newSizes.startSize).to.be.closeTo(totalAvailable * 0.25, 3);
      expect(newSizes.endSize).to.be.closeTo(totalAvailable * 0.5, 3);
    });

    it('absolute sizes are maintained when possible', async () => {
      const container = await fixture<HTMLDivElement>(
        createSplitterInContainer({
          startSize: '250px',
          endSize: '350px',
          containerWidth: '800px',
        })
      );
      const splitter = container.querySelector(
        'igc-splitter'
      ) as IgcSplitterComponent;
      await elementUpdated(splitter);

      const initialSizes = getPanesSizes(splitter, 'width');

      expect(initialSizes.startSize).to.equal(250);
      expect(initialSizes.endSize).to.equal(350);

      container.style.width = '1200px';
      await elementUpdated(splitter);

      let newSizes = getPanesSizes(splitter, 'width');

      expect(newSizes.startSize).to.equal(250);
      expect(newSizes.endSize).to.equal(350);

      container.style.width = '700px';
      await elementUpdated(splitter);

      newSizes = getPanesSizes(splitter, 'width');

      expect(newSizes.startSize).to.equal(250);
      expect(newSizes.endSize).to.equal(350);
    });
  });

  describe('RTL', () => {
    beforeEach(async () => {
      splitter.dir = 'rtl';
      await elementUpdated(splitter);
    });

    it('should resize correctly with pointer in RTL', async () => {
      const previousSizes = getPanesSizes(splitter, 'width');
      let deltaX = 100;

      await resize(splitter, deltaX, 0);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      // In RTL, moving pointer to the right (positive mouse delta) decreases start pane size
      expect(currentSizes.startSize).to.equal(previousSizes.startSize - deltaX);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize + deltaX);

      deltaX *= -1;
      await resize(splitter, deltaX, 0);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);
    });

    it('should resize correctly with keyboard in RTL', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);
      let previousSizes = getPanesSizes(splitter, 'width');
      const resizeDelta = 10;

      bar.focus();
      await elementUpdated(splitter);

      // arrowLeft should increase start pane size in RTL, as opposed to LTR, where arrowLeft decreases it
      simulateKeyboard(bar, arrowLeft);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta
      );

      simulateKeyboard(bar, arrowLeft);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta * 2
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta * 2
      );

      previousSizes = getPanesSizes(splitter, 'width');
      simulateKeyboard(bar, arrowRight);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize - resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize + resizeDelta
      );
    });

    it('should expand/collapse correctly with keyboard in RTL', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'width');
      const splitterSize = splitter.getBoundingClientRect().width;
      const barSize = bar.getBoundingClientRect().width;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      simulateKeyboard(bar, [ctrlKey, arrowLeft]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(splitterSize - barSize);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        splitterSize - barSize - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
    });

    it('should expand/collapse the correct pane through the expander buttons in RTL', async () => {
      let parts = getButtonParts(splitter);

      simulatePointerDown(parts.startCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      const totalAvailable = getTotalSize(splitter, 'width');
      let currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(totalAvailable);

      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      parts = getButtonParts(splitter);
      expect(parts.startCollapseBtn.hidden).to.be.true;
      expect(parts.startExpander.hidden).to.be.false;
      expect(parts.endCollapseBtn).to.be.null;
      expect(parts.endExpander).to.be.null;

      simulatePointerDown(parts.startExpander, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        totalAvailable - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      parts = getButtonParts(splitter);
      expect(parts.startCollapseBtn.hidden).to.be.false;
      expect(parts.startExpander).to.be.null;
      expect(parts.endCollapseBtn.hidden).to.be.false;
      expect(parts.endExpander).to.be.null;

      simulatePointerDown(parts.endCollapseBtn, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(totalAvailable);
      expect(currentSizes.endSize).to.equal(0);
      expect(splitter.matches(':state(end-collapsed)')).to.be.true;

      parts = getButtonParts(splitter);
      expect(parts.startCollapseBtn).to.be.null;
      expect(parts.startExpander).to.be.null;
      expect(parts.endCollapseBtn.hidden).to.be.true;
      expect(parts.endExpander.hidden).to.be.false;

      simulatePointerDown(parts.endExpander, { bubbles: true });
      await elementUpdated(splitter);
      await nextFrame();

      currentSizes = getPanesSizes(splitter, 'width');

      expect(currentSizes.startSize).to.equal(
        totalAvailable - currentSizes.endSize
      );
      expect(currentSizes.endSize).to.be.greaterThan(0);
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;

      parts = getButtonParts(splitter);
      expect(parts.startCollapseBtn.hidden).to.be.false;
      expect(parts.startExpander).to.be.null;
      expect(parts.endCollapseBtn.hidden).to.be.false;
      expect(parts.endExpander).to.be.null;
    });

    it('direction should not affect interactions in vertical orientation', async () => {
      splitter.orientation = 'vertical';
      await elementUpdated(splitter);
      await finishAnimationsFor(splitter.shadowRoot!);

      // 1. Resize with keyboard
      const bar = getSplitterPart(splitter, BAR_PART);
      let previousSizes = getPanesSizes(splitter, 'height');
      const resizeDelta = 10;

      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, arrowUp);
      await elementUpdated(splitter);

      let currentSizes = getPanesSizes(splitter, 'height');
      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize - resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize + resizeDelta
      );

      previousSizes = getPanesSizes(splitter, 'height');
      simulateKeyboard(bar, arrowDown);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(
        previousSizes.startSize + resizeDelta
      );
      expect(currentSizes.endSize).to.equal(
        previousSizes.endSize - resizeDelta
      );

      // 2. Resize with pointer
      previousSizes = getPanesSizes(splitter, 'height');
      let deltaY = 100;

      await resize(splitter, 0, deltaY);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize + deltaY);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize - deltaY);

      deltaY *= -1;
      await resize(splitter, 0, deltaY);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.equal(previousSizes.startSize);
      expect(currentSizes.endSize).to.equal(previousSizes.endSize);

      // 3. Expand/collapse with keyboard
      bar.focus();
      await elementUpdated(splitter);

      simulateKeyboard(bar, [ctrlKey, arrowUp]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');
      const splitterSize = splitter.getBoundingClientRect().height;
      const barSize = bar.getBoundingClientRect().height;

      expect(currentSizes.startSize).to.equal(0);
      expect(currentSizes.endSize).to.equal(splitterSize - barSize);
      expect(splitter.matches(':state(start-collapsed)')).to.be.true;

      simulateKeyboard(bar, [ctrlKey, arrowDown]);
      await elementUpdated(splitter);

      currentSizes = getPanesSizes(splitter, 'height');

      expect(currentSizes.startSize).to.be.greaterThan(0);
      expect(currentSizes.endSize).to.equal(
        splitterSize - barSize - currentSizes.startSize
      );
      expect(splitter.matches(':state(start-collapsed)')).to.be.false;
      expect(splitter.matches(':state(end-collapsed)')).to.be.false;
    });
  });

  describe('Nested Splitters', () => {
    let outerSplitter: IgcSplitterComponent;
    let leftInnerSplitter: IgcSplitterComponent;
    let rightInnerSplitter: IgcSplitterComponent;
    let outerStartSlot: HTMLSlotElement;
    let outerEndSlot: HTMLSlotElement;

    beforeEach(async () => {
      outerSplitter = await fixture<IgcSplitterComponent>(
        createNestedSplitter()
      );
      await elementUpdated(outerSplitter);

      outerStartSlot = getSplitterSlot(outerSplitter, 'start');
      outerEndSlot = getSplitterSlot(outerSplitter, 'end');
      leftInnerSplitter =
        outerStartSlot.assignedElements()[0] as IgcSplitterComponent;
      rightInnerSplitter =
        outerEndSlot.assignedElements()[0] as IgcSplitterComponent;

      await elementUpdated(leftInnerSplitter);
      await elementUpdated(rightInnerSplitter);
    });

    it('should render nested splitters correctly', async () => {
      const startElements = outerStartSlot.assignedElements();
      expect(startElements).to.have.lengthOf(1);
      expect(startElements[0].tagName.toLowerCase()).to.equal(
        IgcSplitterComponent.tagName.toLowerCase()
      );

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

    it('should maintain independent state in nested splitters', async () => {
      outerSplitter.startSize = '60%';
      leftInnerSplitter.startSize = '40%';
      rightInnerSplitter.startSize = '30%';

      await elementUpdated(outerSplitter);
      await elementUpdated(leftInnerSplitter);
      await elementUpdated(rightInnerSplitter);

      expect(outerSplitter.startSize).to.equal('60%');
      expect(outerSplitter.orientation).to.equal('horizontal');
      expect(leftInnerSplitter.startSize).to.equal('40%');
      expect(leftInnerSplitter.orientation).to.equal('vertical');
      expect(rightInnerSplitter.startSize).to.equal('30%');
      expect(rightInnerSplitter.orientation).to.equal('vertical');

      outerSplitter.toggle('start');
      await elementUpdated(outerSplitter);
      await elementUpdated(leftInnerSplitter);

      expect(outerSplitter.matches(':state(start-collapsed)')).to.be.true;
      expect(leftInnerSplitter.matches(':state(start-collapsed)')).to.be.false;
      expect(rightInnerSplitter.matches(':state(start-collapsed)')).to.be.false;

      leftInnerSplitter.toggle('start');
      await elementUpdated(leftInnerSplitter);

      expect(outerSplitter.matches(':state(start-collapsed)')).to.be.true;
      expect(leftInnerSplitter.matches(':state(start-collapsed)')).to.be.true;
      expect(rightInnerSplitter.matches(':state(start-collapsed)')).to.be.false;

      outerSplitter.toggle('start');
      await elementUpdated(outerSplitter);
      await elementUpdated(leftInnerSplitter);

      expect(outerSplitter.matches(':state(start-collapsed)')).to.be.false;
      expect(leftInnerSplitter.matches(':state(start-collapsed)')).to.be.true;
      expect(rightInnerSplitter.matches(':state(start-collapsed)')).to.be.false;
    });

    it('should not interfere with parent/child resize operations', async () => {
      const outerEventSpy = spy(outerSplitter, 'emitEvent');
      const innerEventSpy = spy(leftInnerSplitter, 'emitEvent');

      await resize(outerSplitter, 50, 0);

      checkResizeEvents(outerEventSpy);
      expect(innerEventSpy.called).to.be.false;

      await resize(leftInnerSplitter, 0, 30);

      checkResizeEvents(innerEventSpy);
      expect(outerEventSpy.called).to.be.false;
    });

    it('should handle focus management correctly with nested splitters', async () => {
      const outerBar = getSplitterPart(outerSplitter, BAR_PART);
      const innerBar = getSplitterPart(leftInnerSplitter, BAR_PART);
      const resizeDelta = 10;

      outerBar.focus();
      await elementUpdated(outerSplitter);

      expect(outerSplitter.shadowRoot!.activeElement).to.equal(outerBar);

      const outerPreviousSizes = getPanesSizes(outerSplitter, 'width');

      simulateKeyboard(outerBar, arrowRight);
      await elementUpdated(outerSplitter);

      const outerCurrentSizes = getPanesSizes(outerSplitter, 'width');
      expect(outerCurrentSizes.startSize).to.equal(
        outerPreviousSizes.startSize + resizeDelta
      );
      expect(outerSplitter.shadowRoot!.activeElement).to.equal(outerBar);

      innerBar.focus();
      await elementUpdated(leftInnerSplitter);

      expect(leftInnerSplitter.shadowRoot!.activeElement).to.equal(innerBar);

      const innerPreviousSizes = getPanesSizes(leftInnerSplitter, 'height');

      simulateKeyboard(innerBar, arrowDown);
      await elementUpdated(leftInnerSplitter);

      const innerCurrentSizes = getPanesSizes(leftInnerSplitter, 'height');
      expect(innerCurrentSizes.startSize).to.equal(
        innerPreviousSizes.startSize + resizeDelta
      );
      expect(leftInnerSplitter.shadowRoot!.activeElement).to.equal(innerBar);

      const outerFinalSizes = getPanesSizes(outerSplitter, 'width');
      expect(outerFinalSizes.startSize).to.equal(outerCurrentSizes.startSize);
    });

    it('should handle tabindex correctly for nested splitters', async () => {
      const outerBar = getSplitterPart(outerSplitter, BAR_PART);
      const leftInnerBar = getSplitterPart(leftInnerSplitter, BAR_PART);
      const rightInnerBar = getSplitterPart(rightInnerSplitter, BAR_PART);

      expect(outerBar.tabIndex).to.equal(0);
      expect(leftInnerBar.tabIndex).to.equal(0);
      expect(rightInnerBar.tabIndex).to.equal(0);

      outerSplitter.disableResize = true;
      outerSplitter.disableCollapse = true;
      await elementUpdated(outerSplitter);

      expect(outerBar.tabIndex).to.equal(-1);
      expect(leftInnerBar.tabIndex).to.equal(0);
      expect(rightInnerBar.tabIndex).to.equal(0);

      outerSplitter.disableResize = false;
      outerSplitter.disableCollapse = false;
      leftInnerSplitter.disableResize = true;
      leftInnerSplitter.disableCollapse = true;
      await elementUpdated(outerSplitter);
      await elementUpdated(leftInnerSplitter);

      expect(outerBar.tabIndex).to.equal(0);
      expect(leftInnerBar.tabIndex).to.equal(-1);
      expect(rightInnerBar.tabIndex).to.equal(0);
    });
  });

  describe('Collapsed state integrity', () => {
    it('should reflect the collapsed attributes for every collapse path', async () => {
      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.true;
      expect(splitter.hasAttribute('start-collapsed')).to.be.true;
      expect(splitter.hasAttribute('end-collapsed')).to.be.false;

      // Expander button
      simulatePointerDown(getButtonParts(splitter).startExpander, {
        bubbles: true,
      });
      await elementUpdated(splitter);

      expect(splitter.startCollapsed).to.be.false;
      expect(splitter.hasAttribute('start-collapsed')).to.be.false;

      // Keyboard
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();
      simulateKeyboard(bar, [ctrlKey, arrowRight]);
      await elementUpdated(splitter);

      expect(splitter.endCollapsed).to.be.true;
      expect(splitter.hasAttribute('end-collapsed')).to.be.true;
    });

    it('should not leave a stale attribute when switching the collapsed pane', async () => {
      splitter.endCollapsed = true;
      await elementUpdated(splitter);

      splitter.startCollapsed = true;
      await elementUpdated(splitter);

      expect(splitter.endCollapsed).to.be.false;
      expect(splitter.hasAttribute('end-collapsed')).to.be.false;
      expect(splitter.hasAttribute('start-collapsed')).to.be.true;

      // ...and the same through `toggle()`
      splitter.toggle('end');
      await elementUpdated(splitter);

      expect(splitter.hasAttribute('start-collapsed')).to.be.false;
      expect(splitter.hasAttribute('end-collapsed')).to.be.true;
    });

    it('should keep min/max constraints across a collapse/expand round trip', async () => {
      splitter.startMinSize = '100px';
      splitter.startMaxSize = '300px';
      splitter.endMinSize = '50px';
      await elementUpdated(splitter);

      splitter.toggle('start');
      await elementUpdated(splitter);

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startMinSize).to.equal('100px');
      expect(splitter.startMaxSize).to.equal('300px');
      expect(splitter.endMinSize).to.equal('50px');

      const style = getComputedStyle(getSplitterPart(splitter, START_PART));
      expect(style.minWidth).to.equal('100px');
      expect(style.maxWidth).to.equal('300px');
    });

    it('should honour a size authored while a pane is collapsed', async () => {
      splitter.startSize = '100px';
      await elementUpdated(splitter);

      splitter.toggle('start');
      await elementUpdated(splitter);

      splitter.startSize = '300px';
      await elementUpdated(splitter);

      splitter.toggle('start');
      await elementUpdated(splitter);

      expect(splitter.startSize).to.equal('300px');

      // The stale snapshot is dropped wholesale - keeping the end pane's share
      // would over-subscribe the container and shrink both panes.
      const sizes = getPanesSizes(splitter, 'width');
      expect(sizes.startSize).to.equal(300);
      expect(sizes.startSize + sizes.endSize).to.equal(
        getTotalSize(splitter, 'width')
      );
    });

    it('should not drift the divider across repeated collapse/expand cycles', async () => {
      const initial = getPanesSizes(splitter, 'width');

      for (let i = 0; i < 5; i++) {
        splitter.toggle('start');
        await elementUpdated(splitter);
        splitter.toggle('start');
        await elementUpdated(splitter);
      }

      const current = getPanesSizes(splitter, 'width');
      expect(current.startSize).to.be.closeTo(initial.startSize, 1);
      expect(current.endSize).to.be.closeTo(initial.endSize, 1);
    });
  });

  describe('Size and constraint values', () => {
    it('should reject values without an explicit unit', async () => {
      for (const invalid of ['200', '1.5', 'abc', 'calc(100% - 10px)', '']) {
        splitter.startSize = invalid;
        splitter.startMinSize = invalid;
        await elementUpdated(splitter);

        expect(splitter.startSize, invalid).to.equal('auto');
        expect(splitter.startMinSize, invalid).to.be.undefined;
      }
    });

    it('should accept a unitless zero, the one length that needs no unit', async () => {
      for (const zero of ['0', '0.0', '+0']) {
        splitter.startSize = zero;
        splitter.startMinSize = zero;
        await elementUpdated(splitter);

        expect(splitter.startSize, zero).to.equal(zero);
        expect(splitter.startMinSize, zero).to.equal(zero);
      }
    });

    it('should render a zero-sized pane for a unitless zero size', async () => {
      splitter.startSize = '0';
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, START_PART);
      expect(getComputedStyle(startPane).flex).to.equal('0 1 0px');

      const sizes = getPanesSizes(splitter, 'width');
      expect(sizes.startSize).to.equal(0);
      expect(sizes.endSize).to.equal(getTotalSize(splitter, 'width'));
    });

    it('should resolve font-relative constraints against their computed pixel size', async () => {
      splitter.style.width = '1000px';
      // The probe inherits the container context, so 5rem is 5 x the root size
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      splitter.startMinSize = '5rem';
      splitter.startSize = '400px';
      await elementUpdated(splitter);

      const expectedMinPx = 5 * rootFontSize;
      const containerSize = getContainerSize(splitter, 'width');
      const bar = getSplitterPart(splitter, BAR_PART);

      expect(bar.getAttribute('aria-valuemin')).to.equal(
        Math.round(asPercent(expectedMinPx, containerSize)).toString()
      );

      // Dragging far past the constraint stops on it, not on `5px`
      await resize(splitter, -1000, 0);

      expect(getPanesSizes(splitter, 'width').startSize).to.be.closeTo(
        expectedMinPx,
        1
      );
    });

    it('should clamp percentage constraints where CSS resolves them', async () => {
      splitter.startMinSize = '20%';
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, START_PART);
      const containerSize = getContainerSize(splitter, 'width');

      // CSS resolves `min-width: 20%` against the container...
      expect(getComputedStyle(startPane).minWidth).to.equal('20%');

      // ...and so does the drag math, so the two agree on the pixel value
      await resize(splitter, -1000, 0);

      expect(getPanesSizes(splitter, 'width').startSize).to.be.closeTo(
        0.2 * containerSize,
        1
      );
    });
  });

  describe('Gesture cancellation', () => {
    it('should revert the panes and report a no-op when the gesture is cancelled', async () => {
      const previousSizes = getPanesSizes(splitter, 'width');
      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
      const barRect = bar.getBoundingClientRect();

      simulatePointerDown(bar, {
        clientX: barRect.left,
        clientY: barRect.top,
        pointerId: 1,
      });
      await elementUpdated(splitter);

      simulatePointerMove(
        bar,
        { clientX: barRect.left, clientY: barRect.top, pointerId: 1 },
        { x: 100, y: 0 }
      );
      await elementUpdated(splitter);

      expect(getPanesSizes(splitter, 'width').startSize).to.equal(
        previousSizes.startSize + 100
      );

      bar.dispatchEvent(
        new PointerEvent('pointercancel', {
          bubbles: true,
          composed: true,
          pointerId: 1,
        })
      );
      await elementUpdated(splitter);
      await nextFrame();

      expect(getPanesSizes(splitter, 'width')).to.deep.equal(previousSizes);

      const endCalls = getResizeDetails(eventSpy, 'igcResizeEnd');
      expect(endCalls).to.have.lengthOf(1);
      expect(endCalls[0]).to.deep.equal({
        startPanelSize: previousSizes.startSize,
        endPanelSize: previousSizes.endSize,
        delta: 0,
      });
      expect(eventSpy.calledWith('igcLayoutChanged')).to.be.true;
    });

    it('should finalize a drag exactly once when pointer capture is lost after pointerup', async () => {
      const eventSpy = spy(splitter, 'emitEvent');

      await resize(splitter, 100, 0);

      const sizesAfterDrag = getPanesSizes(splitter, 'width');
      const bar = getSplitterPart(splitter, BAR_PART);

      simulateLostPointerCapture(bar, { pointerId: 1 });
      await elementUpdated(splitter);
      await nextFrame();

      expect(getResizeDetails(eventSpy, 'igcResizeEnd')).to.have.lengthOf(1);
      expect(getPanesSizes(splitter, 'width')).to.deep.equal(sizesAfterDrag);
    });

    it('should not resize after the component is disconnected mid-drag', async () => {
      const bar = getSplitterPart(splitter, BAR_PART);
      const barRect = bar.getBoundingClientRect();

      simulatePointerDown(bar, {
        clientX: barRect.left,
        clientY: barRect.top,
        pointerId: 1,
      });
      await elementUpdated(splitter);

      const parent = splitter.parentElement!;
      splitter.remove();
      parent.append(splitter);
      await elementUpdated(splitter);

      const sizes = getPanesSizes(splitter, 'width');

      simulatePointerMove(
        bar,
        { clientX: barRect.left, clientY: barRect.top, pointerId: 1 },
        { x: 100, y: 0 }
      );
      await elementUpdated(splitter);

      expect(getPanesSizes(splitter, 'width')).to.deep.equal(sizes);
    });
  });

  describe('Home/End with opposite pane constraints', () => {
    it('should leave no gap when the end pane has a max size', async () => {
      splitter.endMaxSize = '300px';
      await elementUpdated(splitter);

      const eventSpy = spy(splitter, 'emitEvent');
      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();

      simulateKeyboard(bar, homeKey);
      await elementUpdated(splitter);
      await nextFrame();

      const sizes = getPanesSizes(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');

      expect(sizes.startSize + sizes.endSize).to.be.closeTo(totalAvailable, 1);
      expect(sizes.endSize).to.be.closeTo(300, 1);

      // The reported sizes are the ones that actually got rendered
      const [endDetail] = getResizeDetails(eventSpy, 'igcResizeEnd');
      expect(endDetail.startPanelSize).to.be.closeTo(sizes.startSize, 1);
      expect(endDetail.endPanelSize).to.be.closeTo(sizes.endSize, 1);
    });

    it('should stop at the end pane min size on End', async () => {
      splitter.endMinSize = '200px';
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, BAR_PART);
      bar.focus();

      simulateKeyboard(bar, endKey);
      await elementUpdated(splitter);
      await nextFrame();

      const sizes = getPanesSizes(splitter, 'width');
      expect(sizes.endSize).to.be.closeTo(200, 1);
      expect(sizes.startSize + sizes.endSize).to.be.closeTo(
        getTotalSize(splitter, 'width'),
        1
      );
    });
  });

  describe('Edge scenarios', () => {
    it('invalid size values should fallback to "auto"', async () => {
      splitter.startSize = '-100px';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      splitter.endSize = '-20%';
      await elementUpdated(splitter);
      expect(splitter.endSize).to.equal('auto');

      splitter.startSize = 'abc';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      splitter.startSize = 'px100';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      splitter.startSize = '%%20';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      // percentages over 100% are also considered invalid
      splitter.startSize = '150%';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      splitter.endSize = '200%';
      await elementUpdated(splitter);
      expect(splitter.endSize).to.equal('auto');

      splitter.startSize = '';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('auto');

      splitter.endSize = '   ';
      await elementUpdated(splitter);
      expect(splitter.endSize).to.equal('auto');

      // values with spaces should be trimmed and accepted if numeric part is valid
      splitter.startSize = '  200px  ';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('200px');

      // 0% and 100% are valid
      splitter.startSize = '0%';
      await elementUpdated(splitter);
      expect(splitter.startSize).to.equal('0%');

      splitter.endSize = '100%';
      await elementUpdated(splitter);
      expect(splitter.endSize).to.equal('100%');
    });

    it('should fallback to undefined for invalid constraint values', async () => {
      splitter.startMinSize = '-50px';
      await elementUpdated(splitter);
      expect(splitter.startMinSize).to.be.undefined;

      splitter.endMaxSize = '-20%';
      await elementUpdated(splitter);
      expect(splitter.endMaxSize).to.be.undefined;

      splitter.startMaxSize = 'large';
      await elementUpdated(splitter);
      expect(splitter.startMaxSize).to.be.undefined;

      splitter.endMinSize = 'small';
      await elementUpdated(splitter);
      expect(splitter.endMinSize).to.be.undefined;

      splitter.startMaxSize = '150%';
      await elementUpdated(splitter);
      expect(splitter.startMaxSize).to.be.undefined;

      splitter.endMinSize = '200%';
      await elementUpdated(splitter);
      expect(splitter.endMinSize).to.be.undefined;

      splitter.startMinSize = '';
      await elementUpdated(splitter);
      expect(splitter.startMinSize).to.be.undefined;

      splitter.endMaxSize = '   ';
      await elementUpdated(splitter);
      expect(splitter.endMaxSize).to.be.undefined;
    });

    it('should predictably handle the case where min sizes exceed container', async () => {
      // combined mins exceed total (600 + 400 > 800)
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '600px',
          endMinSize: '400px',
          splitterWidth: '800px',
        })
      );
      await elementUpdated(splitter);

      // constraints exceed container, use auto sizing for both panes
      const startPane = getSplitterPart(splitter, START_PART);
      const endPane = getSplitterPart(splitter, END_PART);

      const startComputedStyle = getComputedStyle(startPane);
      const endComputedStyle = getComputedStyle(endPane);

      expect(startComputedStyle.minWidth).to.equal('0px');
      expect(endComputedStyle.minWidth).to.equal('0px');

      // component should remain functional
      expect(splitter).to.exist;
      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar).to.exist;

      // percentages exceeding 100% (70% + 60% > 100%)
      const splitter2 = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '70%',
          endMinSize: '60%',
          splitterWidth: '1000px',
        })
      );
      await elementUpdated(splitter2);

      const startPane2 = getSplitterPart(splitter2, START_PART);
      const endPane2 = getSplitterPart(splitter2, END_PART);

      const startComputedStyle2 = getComputedStyle(startPane2);
      const endComputedStyle2 = getComputedStyle(endPane2);

      expect(startComputedStyle2.minWidth).to.equal('0px');
      expect(endComputedStyle2.minWidth).to.equal('0px');

      // individual min exceeds total (900px > 800px)
      const splitter3 = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '900px',
          endMinSize: '100px',
          splitterWidth: '800px',
        })
      );
      await elementUpdated(splitter3);

      const startPane3 = getSplitterPart(splitter3, START_PART);
      const endPane3 = getSplitterPart(splitter3, END_PART);

      const startComputedStyle3 = getComputedStyle(startPane3);
      const endComputedStyle3 = getComputedStyle(endPane3);

      expect(startComputedStyle3.minWidth).to.equal('0px');
      expect(endComputedStyle3.minWidth).to.equal('0px');
    });

    it('minSizes outside the total available space should be respected once container grows', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startMinSize: '600px',
          endMinSize: '400px',
          splitterWidth: '800px',
        })
      );
      await elementUpdated(splitter);

      const startPane = getSplitterPart(splitter, START_PART);
      const endPane = getSplitterPart(splitter, END_PART);

      let startComputedStyle = getComputedStyle(startPane);
      let endComputedStyle = getComputedStyle(endPane);

      expect(startComputedStyle.minWidth).to.equal('0px');
      expect(endComputedStyle.minWidth).to.equal('0px');

      // grow the container to accommodate the constraints
      splitter.style.width = '1200px';
      await elementUpdated(splitter);
      await nextFrame();
      await nextFrame();

      startComputedStyle = getComputedStyle(startPane);
      endComputedStyle = getComputedStyle(endPane);

      expect(startComputedStyle.minWidth).to.equal('600px');
      expect(endComputedStyle.minWidth).to.equal('400px');

      // try to shrink start pane by 700px - should stop at minSize (600px)
      await resize(splitter, -700, 0);
      await elementUpdated(splitter);

      const currentSizes = getPanesSizes(splitter, 'width');
      // start pane should not go below its minSize of 600px
      expect(currentSizes.startSize).to.equal(600);
      expect(currentSizes.endSize).to.equal(
        getTotalSize(splitter, 'width') - 600
      );
    });

    it('should predictably handle the case where max sizes are smaller than container', async () => {
      const splitter = await fixture<IgcSplitterComponent>(
        createTwoPanesWithSizesAndConstraints({
          startSize: '250px',
          endSize: '350px',
          startMaxSize: '200px',
          endMaxSize: '300px',
          splitterWidth: '800px',
        })
      );
      await elementUpdated(splitter);

      const sizes = getPanesSizes(splitter, 'width');
      const totalAvailable = getTotalSize(splitter, 'width');

      expect(sizes.startSize).to.be.at.most(200);
      expect(sizes.endSize).to.be.at.most(300);

      expect(sizes.startSize + sizes.endSize).to.be.lessThan(totalAvailable);
    });

    it('invalid orientation values should fall back to default', async () => {
      splitter.orientation = 'diagonal' as unknown as SplitterOrientation;
      await elementUpdated(splitter);

      const bar = getSplitterPart(splitter, BAR_PART);
      expect(bar).to.exist;

      splitter.orientation = 'horizontal';
      await elementUpdated(splitter);
      expect(splitter.orientation).to.equal('horizontal');
      expect(splitter.getAttribute('orientation')).to.equal('horizontal');
    });

    it('missing slot content should not break rendering', async () => {
      const emptySplitter = await fixture<IgcSplitterComponent>(html`
        <igc-splitter style="width: 500px; height: 500px;"> </igc-splitter>
      `);
      await elementUpdated(emptySplitter);

      expect(emptySplitter).to.exist;

      const startPane = getSplitterPart(emptySplitter, START_PART);
      const endPane = getSplitterPart(emptySplitter, END_PART);
      const bar = getSplitterPart(emptySplitter, BAR_PART);

      expect(startPane).to.exist;
      expect(endPane).to.exist;
      expect(bar).to.exist;

      const partialSplitter = await fixture<IgcSplitterComponent>(html`
        <igc-splitter style="width: 500px; height: 500px;">
          <div slot="start">Only Start Pane</div>
        </igc-splitter>
      `);
      await elementUpdated(partialSplitter);

      expect(partialSplitter).to.exist;

      const partialStartPane = getSplitterPart(partialSplitter, START_PART);
      const partialEndPane = getSplitterPart(partialSplitter, END_PART);
      const partialBar = getSplitterPart(partialSplitter, BAR_PART);

      expect(partialStartPane).to.exist;
      expect(partialEndPane).to.exist;
      expect(partialBar).to.exist;

      partialSplitter.startSize = '300px';
      await elementUpdated(partialSplitter);

      expect(partialSplitter.startSize).to.equal('300px');
    });
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
    <igc-splitter orientation="horizontal" style="width: 500px; height: 500px;">
      <igc-splitter
        slot="start"
        orientation="vertical"
        style="width: 100%; height: 100%;"
      >
        <div slot="start">Top Left Pane</div>
        <div slot="end">Bottom Left Pane</div>
      </igc-splitter>
      <igc-splitter
        slot="end"
        orientation="vertical"
        style="width: 100%; height: 100%;"
      >
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
  splitterWidth?: string;
  splitterHeight?: string;
  containerWidth?: string;
  containerHeight?: string;
};

function createTwoPanesWithSizesAndConstraints(
  config: SplitterTestSizesAndConstraints
) {
  return html`
    <igc-splitter
      style=${`width: ${config.splitterWidth ?? '500px'}; height: ${config.splitterHeight ?? '500px'};`}
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

function createSplitterWithComplexContent() {
  defineComponents(IgcTreeComponent, IgcTreeItemComponent);
  return html`
    <igc-splitter style="width: 500px; height: 500px;">
      <div slot="start">
        <h1>Pane 1</h1>
        <form>
          <input type="text" placeholder="Input in Pane 1" />
          <button type="submit">Submit</button>
        </form>
        <button>Button in Pane 1</button>
      </div>
      <div slot="end">
        <h1>Pane 2</h1>
        <igc-tree>
          <igc-tree-item expanded
            >Item 1
            <igc-tree-item>Subitem 1.1</igc-tree-item>
            <igc-tree-item>Subitem 1.2</igc-tree-item>
          </igc-tree-item>
          <igc-tree-item
            >Item 2
            <igc-tree-item>Subitem 2.1</igc-tree-item>
          </igc-tree-item>
          <igc-tree-item>Item 3</igc-tree-item>
        </igc-tree>
      </div>
    </igc-splitter>
  `;
}

function createSplitterInContainer(
  config: SplitterTestSizesAndConstraints = {}
) {
  return html`
    <div
      style="width: ${
        config.containerWidth ?? '800px'
      }; height: ${config.containerHeight ?? '800px'};"
    >
      <igc-splitter
        style="width: 100%; height: 100%;"
        .orientation=${config.orientation ?? 'horizontal'}
        .startSize=${config.startSize ?? '300px'}
        .endSize=${config.endSize ?? '40%'}
        .startMinSize=${config.startMinSize}
        .startMaxSize=${config.startMaxSize}
        .endMinSize=${config.endMinSize}
        .endMaxSize=${config.endMaxSize}
      >
        <div slot="start">Pane 1</div>
        <div slot="end">Pane 2</div>
      </igc-splitter>
    </div>
  `;
}

type SplitterSlot = 'start' | 'end';

function getSplitterSlot(splitter: IgcSplitterComponent, which: SplitterSlot) {
  return splitter.renderRoot.querySelector(
    `slot[name="${which}"]`
  ) as HTMLSlotElement;
}

type SplitterParts =
  | 'base'
  | typeof START_PART
  | typeof END_PART
  | typeof BAR_PART
  | typeof START_EXPANDER_PART
  | typeof END_EXPANDER_PART
  | typeof START_COLLAPSE_PART
  | typeof END_COLLAPSE_PART
  | typeof DRAG_HANDLE_PART;

function getSplitterPart(splitter: IgcSplitterComponent, which: SplitterParts) {
  return splitter.shadowRoot!.querySelector(
    `[part~="${which}"]`
  ) as HTMLElement;
}

function getButtonParts(splitter: IgcSplitterComponent) {
  return {
    startExpander: getSplitterPart(splitter, START_EXPANDER_PART),
    endExpander: getSplitterPart(splitter, END_EXPANDER_PART),
    startCollapseBtn: getSplitterPart(splitter, START_COLLAPSE_PART),
    endCollapseBtn: getSplitterPart(splitter, END_COLLAPSE_PART),
  };
}

async function resize(
  splitter: IgcSplitterComponent,
  deltaX: number,
  deltaY: number
) {
  const bar = getSplitterPart(splitter, BAR_PART);
  const barRect = bar.getBoundingClientRect();

  simulatePointerDown(bar, {
    clientX: barRect.left,
    clientY: barRect.top,
    pointerId: 1,
  });
  await elementUpdated(splitter);

  simulatePointerMove(
    bar,
    {
      clientX: barRect.left,
      clientY: barRect.top,
      pointerId: 1,
    },
    { x: deltaX, y: deltaY }
  );
  await elementUpdated(splitter);

  simulatePointerUp(bar, {
    clientX: barRect.left + deltaX,
    clientY: barRect.top + deltaY,
    pointerId: 1,
  });
  await elementUpdated(splitter);
  await nextFrame();
}

function getPanesSizes(
  splitter: IgcSplitterComponent,
  dimension: 'width' | 'height' = 'width'
) {
  const startPane = getSplitterPart(splitter, START_PART);
  const endPane = getSplitterPart(splitter, END_PART);

  return {
    startSize: roundPrecise(startPane.getBoundingClientRect()[dimension]),
    endSize: roundPrecise(endPane.getBoundingClientRect()[dimension]),
  };
}

type ResizeEventName = 'igcResizeStart' | 'igcResizing' | 'igcResizeEnd';

function getResizeDetails(
  eventSpy: sinon.SinonSpy,
  name: ResizeEventName
): IgcSplitterResizeEventArgs[] {
  return eventSpy
    .withArgs(name)
    .args.map((args) => args[1].detail as IgcSplitterResizeEventArgs);
}

function checkResizeEvents(
  eventSpy: sinon.SinonSpy,
  startArgs?: IgcSplitterResizeEventArgs,
  resizingArgs?: IgcSplitterResizeEventArgs,
  endArgs?: IgcSplitterResizeEventArgs
) {
  expect(eventSpy.calledWith('igcResizeStart')).to.be.true;
  expect(eventSpy.calledWith('igcResizing')).to.be.true;
  expect(eventSpy.calledWith('igcResizeEnd')).to.be.true;

  if (startArgs) {
    expect(
      eventSpy.withArgs('igcResizeStart').lastCall.lastArg.detail
    ).to.deep.equal(startArgs);
  }
  if (resizingArgs) {
    expect(
      eventSpy.withArgs('igcResizing').lastCall.lastArg.detail
    ).to.deep.equal(resizingArgs);
  }
  if (endArgs) {
    expect(
      eventSpy.withArgs('igcResizeEnd').lastCall.lastArg.detail
    ).to.deep.equal(endArgs);
  }
  eventSpy.resetHistory();
}

function checkPanesAreWithinBounds(
  splitter: IgcSplitterComponent,
  startSize: number,
  endSize: number,
  dimension: 'x' | 'y'
) {
  const splitterSize =
    splitter.getBoundingClientRect()[dimension === 'x' ? 'width' : 'height'];
  expect(startSize + endSize).to.be.at.most(splitterSize);
}

/**
 * The basis the browser resolves percentage `flex-basis`/`min-*`/`max-*`
 * against: the content box of the flex container, bar included.
 */
function getContainerSize(
  splitter: IgcSplitterComponent,
  dimension: 'width' | 'height'
) {
  return splitter.getBoundingClientRect()[dimension];
}

/** The space left for the panes once the bar has taken its own. */
function getTotalSize(
  splitter: IgcSplitterComponent,
  dimension: 'width' | 'height'
) {
  const bar = getSplitterPart(splitter, BAR_PART);
  const barSize = bar.getBoundingClientRect()[dimension];
  const splitterSize = splitter.getBoundingClientRect()[dimension];
  const totalAvailable = splitterSize - barSize;
  return totalAvailable;
}
