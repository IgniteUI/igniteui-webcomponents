import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy, stub } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { suppressResizeObserverLoopError } from '../common/utils.spec.js';
import type { VirtualScrollItemContext, VirtualScrollState } from './types.js';
import IgcVirtualScrollComponent, {
  type VirtualScrollItemTemplate,
} from './virtualization.js';

describe('VirtualScroll', () => {
  before(() => {
    defineComponents(IgcVirtualScrollComponent);
    suppressResizeObserverLoopError();
  });

  function createItems(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Item ${i}`);
  }

  const itemTemplate: VirtualScrollItemTemplate<string> = (
    ctx: VirtualScrollItemContext<string>
  ) => html`<span>${ctx.value}</span>`;

  describe('Accessibility', () => {
    it('passes the a11y audit', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(10)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await expect(el).lightDom.to.be.accessible();
    });
  });

  describe('Default values', () => {
    let el: IgcVirtualScrollComponent<string>;

    beforeEach(async () => {
      el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll></igc-virtual-scroll>`
      );
    });

    it('initializes with correct defaults', () => {
      expect(el.data).to.deep.equal([]);
      expect(el.orientation).to.equal('vertical');
      expect(el.overScan).to.equal(2);
      expect(el.estimatedItemSize).to.equal(50);
      expect(el.itemTemplate).to.be.null;
    });
  });

  describe('Orientation', () => {
    it('reflects orientation attribute', async () => {
      const el = await fixture<IgcVirtualScrollComponent>(
        html`<igc-virtual-scroll orientation="horizontal"></igc-virtual-scroll>`
      );

      expect(el.orientation).to.equal('horizontal');
      expect(el.getAttribute('orientation')).to.equal('horizontal');
    });

    it('defaults orientation to vertical', async () => {
      const el = await fixture<IgcVirtualScrollComponent>(
        html`<igc-virtual-scroll></igc-virtual-scroll>`
      );

      expect(el.getAttribute('orientation')).to.equal('vertical');
    });

    it('re-reads the scroll offset from the new axis when it changes', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          orientation="horizontal"
          style="width: 300px; height: 100px"
          .data=${createItems(1000)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      el.scrollLeft = 500;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      const renderedIndices = () =>
        Array.from(
          el.querySelectorAll<HTMLElement>('[data-vs-index]'),
          (item) => Number(item.dataset.vsIndex)
        );

      expect(Math.min(...renderedIndices())).to.be.greaterThan(0);

      // The vertical axis was never scrolled, so switching to it must render
      // from the top rather than reuse the horizontal offset.
      el.orientation = 'vertical';
      await elementUpdated(el);

      expect(Math.min(...renderedIndices())).to.equal(0);
    });
  });

  describe('Rendering', () => {
    it('renders nothing without an itemTemplate', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(5)}
        ></igc-virtual-scroll>`
      );

      const content = el.querySelector('[part="virtualization-content"]');
      expect(content).to.be.null;
    });

    it('renders the track and content divs when itemTemplate is set', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(10)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      expect(el.querySelector('[part="virtualization-track"]')).to.not.be.null;
      expect(el.querySelector('[part="virtualization-content"]')).to.not.be
        .null;
    });
  });

  describe('Events', () => {
    it('emits igcStateChange after render with data and itemTemplate', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll style="height: 300px"></igc-virtual-scroll>`
      );

      const eventSpy = spy(el, 'emitEvent');

      el.data = createItems(50);
      el.itemTemplate = itemTemplate;
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcStateChange');
    });

    it('emits igcDataRequest when scrolled near the end of data', async () => {
      const items = createItems(8);
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${items}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      const eventSpy = spy(el, 'emitEvent');

      // Trigger a re-render by updating data to a count that puts end near threshold
      el.data = createItems(4);
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcDataRequest');
    });

    it('does not re-emit igcStateChange when the window is unchanged', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(500)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const eventSpy = spy(el, 'emitEvent');

      el.requestUpdate();
      await elementUpdated(el);

      expect(eventSpy).to.not.have.been.calledWith('igcStateChange');

      el.scrollTop = 1000;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcStateChange');
    });

    it('does not re-request the same items when data is reassigned without growing', async () => {
      const items = createItems(4);
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${items}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const eventSpy = spy(el, 'emitEvent');

      // A consumer whose source is exhausted, but which still reassigns in
      // response to the request it can't fulfil. Without the guard this loops
      // for as long as the consumer keeps answering.
      el.data = items.slice();
      await elementUpdated(el);
      el.data = items.slice();
      await elementUpdated(el);

      expect(eventSpy).to.not.have.been.calledWith('igcDataRequest');
    });

    it('requests again once data actually grows', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(4)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const eventSpy = spy(el, 'emitEvent');

      el.data = createItems(8);
      await elementUpdated(el);

      expect(eventSpy).calledWith('igcDataRequest');
    });
  });

  describe('Scroll handling', () => {
    it('does not render for a scroll that stays within the same window', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          estimated-item-size="50"
          over-scan="0"
          .data=${createItems(500)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const updateSpy = spy(el, 'requestUpdate');

      // Items are 50px tall and the over-scan is off, so anything below the
      // first item boundary renders exactly the same window.
      el.scrollTop = 10;
      el.dispatchEvent(new Event('scroll'));

      expect(updateSpy).to.not.have.been.called;

      el.scrollTop = 400;
      el.dispatchEvent(new Event('scroll'));

      expect(updateSpy).calledOnce;
    });

    it('re-registers its scroll handling after being reconnected', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(500)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const parent = el.parentElement!;
      el.remove();
      parent.append(el);
      await el.layoutComplete;

      el.scrollTop = 2000;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      const rendered = Array.from(el.querySelectorAll('[data-vs-index]'));
      expect(rendered).to.not.be.empty;
      expect(
        Number(rendered[0].getAttribute('data-vs-index'))
      ).to.be.greaterThan(0);
    });
  });

  describe('Public API', () => {
    it('scrollToIndex sets scrollTop for vertical orientation', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(1000)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await elementUpdated(el);
      await el.scrollToIndex(100);

      expect(el.scrollTop).to.be.greaterThan(0);
    });

    it('scrollToIndex sets scrollLeft for horizontal orientation', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          orientation="horizontal"
          style="width: 300px; height: 100px"
          .data=${createItems(1000)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await elementUpdated(el);
      await el.scrollToIndex(100);

      expect(el.scrollLeft).to.be.greaterThan(0);
    });

    it('settles at the last index instead of waiting out the scroll timeout', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(1000)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await elementUpdated(el);

      // The aligned offset for the final item lies past the reachable scroll
      // range; unclamped, every correction pass would wait for a `scrollend`
      // that the browser never fires.
      await el.scrollToIndex(999, { block: 'end' });

      expect(el.scrollTop).to.equal(el.scrollHeight - el.clientHeight);
    });

    it('does not scroll for block: nearest when the item is already in view', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(1000)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      const scrollToSpy = spy(el, 'scrollTo');
      await el.scrollToIndex(1, { block: 'nearest' });

      expect(scrollToSpy).to.not.have.been.called;
      expect(el.scrollTop).to.equal(0);
    });

    it('keeps the requested index aligned once real item sizes differ from the estimate', async () => {
      const count = 500;
      const realItemSize = 30; // smaller than the default estimatedItemSize (50)
      const sizedTemplate: VirtualScrollItemTemplate<string> = (ctx) =>
        html`<span style="display: block; height: ${realItemSize}px;"
          >${ctx.value}</span
        >`;

      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(count)}
          .itemTemplate=${sizedTemplate}
        ></igc-virtual-scroll>`
      );

      await elementUpdated(el);

      const targetIndex = 250;
      await el.scrollToIndex(targetIndex);

      const content = el.querySelector<HTMLElement>(
        '[part="virtualization-content"]'
      )!;
      const renderedIndices = Array.from(
        content.querySelectorAll<HTMLElement>('[data-vs-index]')
      ).map((item) => Number(item.dataset.vsIndex));

      expect(Math.min(...renderedIndices)).to.equal(
        Math.max(0, targetIndex - el.overScan)
      );
    });

    it('keeps a far-away, smooth-scrolled index aligned in a large list', async () => {
      const count = 5000;
      const realItemSize = 32; // smaller than the default estimatedItemSize (50)
      const sizedTemplate: VirtualScrollItemTemplate<string> = (ctx) =>
        html`<span style="display: block; height: ${realItemSize}px;"
          >${ctx.value}</span
        >`;

      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(count)}
          .itemTemplate=${sizedTemplate}
        ></igc-virtual-scroll>`
      );

      await elementUpdated(el);

      const targetIndex = 2500;
      await el.scrollToIndex(targetIndex, { behavior: 'smooth' });

      const content2 = el.querySelector<HTMLElement>(
        '[part="virtualization-content"]'
      )!;
      const renderedIndices2 = Array.from(
        content2.querySelectorAll<HTMLElement>('[data-vs-index]')
      ).map((item) => Number(item.dataset.vsIndex));

      expect(Math.min(...renderedIndices2)).to.equal(
        Math.max(0, targetIndex - el.overScan)
      );
    });

    it('scrollToIndex with nearest leaves an item that already fills the viewport alone', async () => {
      const tallTemplate: VirtualScrollItemTemplate<string> = (ctx) =>
        html`<span style="display: block; height: 400px;">${ctx.value}</span>`;

      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          estimated-item-size="400"
          .data=${createItems(20)}
          .itemTemplate=${tallTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      // Item 0 spans 0-400px; the viewport is 50-350px, so the item covers it
      // end to end. It can never *fit* inside the viewport, but there is
      // nothing to scroll to either.
      el.scrollTop = 50;
      el.dispatchEvent(new Event('scroll'));
      await el.layoutComplete;

      const scrollToSpy = spy(el, 'scrollTo');
      await el.scrollToIndex(0, { block: 'nearest' });

      expect(scrollToSpy).to.not.have.been.called;
      expect(el.scrollTop).to.equal(50);
    });

    it('layoutComplete settles when no animation frames are served', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(100)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;

      // A hidden tab or a disconnected element is never served frames. If
      // `layoutComplete` waited on one unconditionally, this would hang and
      // the test would time out.
      const rafStub = stub(window, 'requestAnimationFrame').returns(0);

      try {
        el.data = createItems(200);
        await el.layoutComplete;
      } finally {
        rafStub.restore();
      }

      expect(rafStub).to.have.been.called;
    });
  });

  describe('Engine integration', () => {
    it('resizes track when data changes', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          .data=${createItems(10)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      const trackBefore = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      );
      expect(trackBefore?.style.height).to.equal(`${10 * 50}px`);

      el.data = createItems(20);
      await elementUpdated(el);

      const trackAfter = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      );
      expect(trackAfter?.style.height).to.equal(`${20 * 50}px`);
    });

    it('applies a new estimatedItemSize when the item count is unchanged', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          .data=${createItems(10)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      const trackBefore = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      );
      expect(trackBefore?.style.height).to.equal(`${10 * 50}px`);

      el.estimatedItemSize = 80;
      await elementUpdated(el);

      const trackAfter = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      );
      expect(trackAfter?.style.height).to.equal(`${10 * 80}px`);
    });

    it('retains measurements on append and discards them on replacement', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 100px"
          .data=${createItems(20)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      const resizeSpy = spy(el['_engine'], 'resize');

      // Appending leaves the identity of every existing index intact, so all
      // 20 measurements are retained.
      el.data = [...el.data, ...createItems(5)];
      await elementUpdated(el);

      expect(resizeSpy.lastCall.args).to.eql([25, 50, 20]);

      // Replacing the collection invalidates every index from the first
      // difference on - here, from the very beginning.
      el.data = el.data.map((item) => `${item}!`);
      await elementUpdated(el);

      expect(resizeSpy.lastCall.args).to.eql([25, 50, 0]);
    });

    it('discards stale measurements when data of the same length is swapped', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 100px"
          .data=${createItems(20)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );

      const resizeSpy = spy(el['_engine'], 'resize');

      // An identical item count used to make `resize` a no-op, stranding the
      // previous data's measurements on the new items.
      el.data = createItems(20).map((item) => `${item}!`);
      await elementUpdated(el);

      expect(resizeSpy.lastCall.args).to.eql([20, 50, 0]);
    });

    it('does not override the size of items already measured in the DOM', async () => {
      const realItemSize = 30;
      const sizedTemplate: VirtualScrollItemTemplate<string> = (ctx) =>
        html`<span style="display: block; height: ${realItemSize}px;"
          >${ctx.value}</span
        >`;

      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 100px"
          .data=${createItems(20)}
          .itemTemplate=${sizedTemplate}
        ></igc-virtual-scroll>`
      );

      // Let the ResizeObserver measure the initially rendered items. A
      // measurement pass can itself schedule a follow-up render, so wait
      // for `layoutComplete` to settle twice to be sure nothing is left
      // pending.
      await el.layoutComplete;
      await el.layoutComplete;

      const content = el.querySelector<HTMLElement>(
        '[part="virtualization-content"]'
      )!;
      const measuredCount = content.querySelectorAll('[data-vs-index]').length;

      el.estimatedItemSize = 200;
      await elementUpdated(el);

      const track = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      );
      const expectedHeight =
        measuredCount * realItemSize + (20 - measuredCount) * 200;

      expect(track?.style.height).to.equal(`${expectedHeight}px`);
    });
  });

  describe('RTL', () => {
    async function createRTLScroll(
      count = 1000
    ): Promise<IgcVirtualScrollComponent<string>> {
      return fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          dir="rtl"
          orientation="horizontal"
          style="width: 300px; height: 100px"
          .data=${createItems(count)}
          .itemTemplate=${itemTemplate}
        ></igc-virtual-scroll>`
      );
    }

    it('scrollToIndex passes a negative left value to scrollTo in RTL', async () => {
      const el = await createRTLScroll();
      await elementUpdated(el);

      const scrollToSpy = spy(el, 'scrollTo');
      el.scrollToIndex(100);

      expect(scrollToSpy.calledOnce).to.be.true;
      expect(scrollToSpy.firstCall.args[0])
        .to.have.property('left')
        .lessThan(0);
    });

    it('normalizes negative scrollLeft to a positive engine offset in RTL', async () => {
      const el = await createRTLScroll();
      await elementUpdated(el);

      const eventSpy = spy(el, 'emitEvent');

      // In RTL, browsers report scrollLeft as a negative value. Simulate that
      // by setting scrollLeft then firing a synthetic scroll event.
      el.scrollLeft = -500;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      const stateCalls = eventSpy
        .getCalls()
        .filter((c) => c.args[0] === 'igcStateChange');

      expect(stateCalls).to.not.be.empty;
      // A normalized positive offset of 500px with estimatedItemSize=50 puts
      // the start index at item 10 or nearby (depending on over-scan).
      const lastStateCall = stateCalls.at(-1);
      expect(lastStateCall).to.exist;
      const state = (lastStateCall!.args[1] as { detail: VirtualScrollState })
        .detail;
      expect(state.startIndex).to.be.greaterThan(0);
    });

    it('applies a negative translateX on the content div when scrolled in RTL', async () => {
      const el = await createRTLScroll();
      await elementUpdated(el);

      // Simulate an RTL scroll offset.
      el.scrollLeft = -300;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      const content = el.querySelector<HTMLElement>(
        '[part="virtualization-content"]'
      );
      expect(content?.style.transform).to.match(/translateX\(-\d+(\.\d+)?px\)/);
    });

    it('emits igcStateChange with valid indices in RTL horizontal mode', async () => {
      const el = await createRTLScroll();

      const eventSpy = spy(el, 'emitEvent');

      // A different item count, so that the window genuinely changes - an
      // equivalent one is deduplicated and emits nothing.
      el.data = createItems(500);
      await elementUpdated(el);

      const stateCalls = eventSpy
        .getCalls()
        .filter((c) => c.args[0] === 'igcStateChange');

      expect(stateCalls).to.not.be.empty;
      const lastStateCall = stateCalls.at(-1);
      expect(lastStateCall).to.exist;
      const { startIndex, endIndex } = (
        lastStateCall!.args[1] as { detail: VirtualScrollState }
      ).detail;
      expect(startIndex).to.equal(0);
      expect(endIndex).to.be.greaterThanOrEqual(startIndex);
    });

    it('renders the first data item as the right-most item in RTL', async () => {
      const el = await createRTLScroll();
      await elementUpdated(el);

      const content = el.querySelector<HTMLElement>(
        '[part="virtualization-content"]'
      )!;
      const items = Array.from(
        content.querySelectorAll<HTMLElement>('[data-vs-index]')
      );

      expect(items.length).to.be.greaterThan(1);

      const firstIndex = Number(items[0].dataset.vsIndex);
      const secondIndex = Number(items[1].dataset.vsIndex);

      // DOM order is ascending by data index ...
      expect(firstIndex).to.be.lessThan(secondIndex);

      // ... but visually the first (lowest) index sits to the right of the next.
      const firstRect = items[0].getBoundingClientRect();
      const secondRect = items[1].getBoundingClientRect();
      expect(firstRect.left).to.be.greaterThan(secondRect.left);
    });
  });
});
