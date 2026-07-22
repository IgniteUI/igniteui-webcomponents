import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
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
  });

  describe('Rendering', () => {
    it('renders nothing without an itemTemplate', async () => {
      const el = await fixture<IgcVirtualScrollComponent<string>>(
        html`<igc-virtual-scroll
          style="height: 300px"
          .data=${createItems(5)}
        ></igc-virtual-scroll>`
      );

      const content = el.querySelector('[part="igc-vs-content"]');
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

      expect(el.querySelector('[part="igc-vs-track"]')).to.not.be.null;
      expect(el.querySelector('[part="igc-vs-content"]')).to.not.be.null;
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
      el.scrollToIndex(100);

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
      el.scrollToIndex(100);

      expect(el.scrollLeft).to.be.greaterThan(0);
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

      const content = el.querySelector<HTMLElement>('[part="igc-vs-content"]')!;
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
        '[part="igc-vs-content"]'
      )!;
      const renderedIndices2 = Array.from(
        content2.querySelectorAll<HTMLElement>('[data-vs-index]')
      ).map((item) => Number(item.dataset.vsIndex));

      expect(Math.min(...renderedIndices2)).to.equal(
        Math.max(0, targetIndex - el.overScan)
      );
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
        '[part="igc-vs-track"]'
      );
      expect(trackBefore?.style.height).to.equal(`${10 * 50}px`);

      el.data = createItems(20);
      await elementUpdated(el);

      const trackAfter = el.querySelector<HTMLElement>('[part="igc-vs-track"]');
      expect(trackAfter?.style.height).to.equal(`${20 * 50}px`);
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

      const content = el.querySelector<HTMLElement>('[part="igc-vs-content"]');
      expect(content?.style.transform).to.match(/translateX\(-\d+(\.\d+)?px\)/);
    });

    it('emits igcStateChange with valid indices in RTL horizontal mode', async () => {
      const el = await createRTLScroll();

      const eventSpy = spy(el, 'emitEvent');
      el.data = createItems(1000);
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

      const content = el.querySelector<HTMLElement>('[part="igc-vs-content"]')!;
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
