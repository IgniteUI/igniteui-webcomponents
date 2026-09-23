import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy, stub } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { suppressResizeObserverLoopError } from '#internals/testing/helpers.spec.js';
import { simulateScroll } from '#internals/testing/simulate.spec.js';
import type { VirtualScrollState } from './types.js';
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

  const itemTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
    html`<span>${ctx.value}</span>`;

  const FIXED_SIZE = 30;
  const fixedTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
    html`<span style="display: block; height: ${FIXED_SIZE}px;"
      >${ctx.value}</span
    >`;

  /** A 300px scroll of 1000 items of `FIXED_SIZE`, with an exact estimate. */
  async function createFixedScroll(): Promise<
    IgcVirtualScrollComponent<string>
  > {
    const el = await fixture<IgcVirtualScrollComponent<string>>(
      html`<igc-virtual-scroll
        style="height: 300px"
        estimated-item-size=${FIXED_SIZE}
        .data=${createItems(1000)}
        .itemTemplate=${fixedTemplate}
      ></igc-virtual-scroll>`
    );
    await el.layoutComplete;
    return el;
  }

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

      // The vertical axis was never scrolled. A switch to it must render
      // from the top, not reuse the horizontal offset.
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

      // Trigger a re-render: set a data count that puts the end near the threshold.
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
      // response to the request it cannot fulfil. Without the guard, this
      // loops for as long as the consumer answers.
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

      // Items are 50px tall and the over-scan is off, so each offset below
      // the first item boundary renders the same window.
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
      // range. Without a clamp, each correction pass would wait for a
      // `scrollend` that the browser never fires.
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
      const sizedTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
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
      const sizedTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
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
      const tallTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
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

      // Item 0 spans 0-400px and the viewport is 50-350px, so the item
      // covers it fully. The item cannot fit inside the viewport, but there
      // is also nothing to scroll to.
      el.scrollTop = 50;
      el.dispatchEvent(new Event('scroll'));
      await el.layoutComplete;

      const scrollToSpy = spy(el, 'scrollTo');
      await el.scrollToIndex(0, { block: 'nearest' });

      expect(scrollToSpy).to.not.have.been.called;
      expect(el.scrollTop).to.equal(50);
    });

    describe('scrollToIndex with nearest', () => {
      it('scrolls by one item to reveal the item after the last visible one', async () => {
        const el = await createFixedScroll();

        // Items 0-9 fill the 300px viewport. Item 10 spans 300-330.
        await el.scrollToIndex(10, { block: 'nearest' });

        expect(el.scrollTop).to.equal(FIXED_SIZE);
      });

      it('aligns an item after the viewport to its end and one before it to its start', async () => {
        const el = await createFixedScroll();

        // Item 20 spans 600-630.
        await el.scrollToIndex(20, { block: 'nearest' });
        expect(el.scrollTop).to.equal(630 - 300);

        // Item 5 spans 150-180, above the viewport at 330-630.
        await el.scrollToIndex(5, { block: 'nearest' });
        expect(el.scrollTop).to.equal(150);
      });
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

      // A hidden tab or a disconnected element gets no frames. If
      // `layoutComplete` always waited on one, this would hang and the test
      // would time out.
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

      // An append keeps the identity of each existing index, so all 20
      // measurements are retained.
      el.data = [...el.data, ...createItems(5)];
      await elementUpdated(el);

      expect(resizeSpy.lastCall.args).to.eql([25, 50, 20]);

      // A replacement invalidates each index from the first difference on.
      // Here, that is the beginning.
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

      // An identical item count used to make `resize` a no-op. That left the
      // previous data's measurements on the new items.
      el.data = createItems(20).map((item) => `${item}!`);
      await elementUpdated(el);

      expect(resizeSpy.lastCall.args).to.eql([20, 50, 0]);
    });

    it('does not override the size of items already measured in the DOM', async () => {
      const realItemSize = 30;
      const sizedTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
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
      // measurement pass can schedule a follow-up render, so wait for
      // `layoutComplete` twice to make sure nothing is pending.
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

    it('re-measures reused item elements when they host a different index', async () => {
      const realItemSize = 30;
      const sizedTemplate: VirtualScrollItemTemplate<unknown> = (ctx) =>
        html`<span style="display: block; height: ${realItemSize}px;"
          >${ctx.value}</span
        >`;

      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 90px"
          .data=${createItems(50)}
          .itemTemplate=${sizedTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;
      await el.layoutComplete;

      // Jump to the end. Lit reuses the wrapper elements for the new indices
      // at an identical size, and the ResizeObserver does not report that.
      // Those indices used to keep their estimated size, which left a gap
      // between the last item and the end of the track. Measurements at the
      // bottom shrink the track, so apply the jump again until the scroll
      // height is stable.
      for (let i = 0; i < 10; i++) {
        const height = el.scrollHeight;
        el.scrollTop = el.scrollHeight;
        el.dispatchEvent(new Event('scroll'));

        await el.layoutComplete;
        await el.layoutComplete;

        if (el.scrollHeight === height) {
          break;
        }
      }

      const track = el.querySelector('[part="virtualization-track"]')!;
      const items = el.querySelectorAll<HTMLElement>('[data-vs-index]');
      const last = items[items.length - 1];

      expect(last.dataset.vsIndex).to.equal('49');
      expect(last.getBoundingClientRect().bottom).to.equal(
        track.getBoundingClientRect().bottom
      );
    });

    it('adapts the estimate of unmeasured items to the measured size', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(1000)}
          .itemTemplate=${fixedTemplate}
        ></igc-virtual-scroll>`
      );

      await el.layoutComplete;
      await el.layoutComplete;

      const track = el.querySelector<HTMLElement>(
        '[part="virtualization-track"]'
      )!;

      // Only the ~20 rendered items are measured.
      expect(track.style.height).to.equal(`${1000 * FIXED_SIZE}px`);
      expect(el.estimatedItemSize).to.equal(50);
    });
  });

  describe('Item elements', () => {
    function wrappers(el: IgcVirtualScrollComponent<string>): HTMLElement[] {
      return Array.from(el.querySelectorAll<HTMLElement>('[data-vs-index]'));
    }

    function wrapperByIndex(
      el: IgcVirtualScrollComponent<string>
    ): Map<number, HTMLElement> {
      return new Map(
        wrappers(el).map((wrapper) => [
          Number(wrapper.dataset.vsIndex),
          wrapper,
        ])
      );
    }

    it('keeps the element of each item that stays in the window on a scroll', async () => {
      const el = await createFixedScroll();
      await simulateScroll(el, { top: 3000 });
      const before = wrapperByIndex(el);

      await simulateScroll(el, { top: 3000 + 2 * FIXED_SIZE });
      const after = wrapperByIndex(el);

      const kept = [...before.keys()].filter((index) => after.has(index));
      expect(kept.length).to.be.greaterThan(5);
      for (const index of kept) {
        expect(after.get(index)).to.equal(before.get(index));
        expect(after.get(index)!.textContent!.trim()).to.equal(`Item ${index}`);
      }
    });

    it('creates no item elements while it scrolls once the window is full', async () => {
      const el = await createFixedScroll();
      await simulateScroll(el, { top: 3000 });
      const pool = wrappers(el);

      for (let step = 1; step <= 10; step++) {
        await simulateScroll(el, { top: 3000 + step * 45 });
      }
      await simulateScroll(el, { top: 15_000 });

      const current = wrappers(el);
      expect(pool).to.include.members(current);
      expect(current.map((wrapper) => Number(wrapper.dataset.vsIndex))).to.eql(
        current.map((_, i) => Number(current[0].dataset.vsIndex) + i)
      );
    });

    it('keeps the element of an item that moves in data with a keyFunction', async () => {
      const el = await createFixedScroll();
      el.keyFunction = (item) => item;
      await elementUpdated(el);

      const moved = wrapperByIndex(el).get(3)!;

      el.data = ['New item', ...el.data];
      await elementUpdated(el);

      const after = wrapperByIndex(el);
      expect(after.get(4)).to.equal(moved);
      expect(moved.textContent!.trim()).to.equal('Item 3');
      expect(after.get(0)!.textContent!.trim()).to.equal('New item');
    });

    it('keeps the element of an index across a data change without a keyFunction', async () => {
      const el = await createFixedScroll();
      const atIndex3 = wrapperByIndex(el).get(3)!;

      el.data = ['New item', ...el.data];
      await elementUpdated(el);

      expect(wrapperByIndex(el).get(3)).to.equal(atIndex3);
      expect(atIndex3.textContent!.trim()).to.equal('Item 2');
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

      // In RTL, browsers report scrollLeft as a negative value. Simulate
      // that: set scrollLeft, then fire a synthetic scroll event.
      el.scrollLeft = -500;
      el.dispatchEvent(new Event('scroll'));
      await elementUpdated(el);

      const stateCalls = eventSpy
        .getCalls()
        .filter((c) => c.args[0] === 'igcStateChange');

      expect(stateCalls).to.not.be.empty;
      // A normalized positive offset of 500px with estimatedItemSize=50 puts
      // the start index at or near item 10, dependent on the over-scan.
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

      // A different item count, so that the window changes. An equal window
      // is deduplicated and emits nothing.
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

      // DOM order is ascending by data index...
      expect(firstIndex).to.be.lessThan(secondIndex);

      // ...but visually the first (lowest) index sits to the right of the next.
      const firstRect = items[0].getBoundingClientRect();
      const secondRect = items[1].getBoundingClientRect();
      expect(firstRect.left).to.be.greaterThan(secondRect.left);
    });
  });
});
