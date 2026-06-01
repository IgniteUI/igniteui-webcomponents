import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { suppressResizeObserverLoopError } from '../common/utils.spec.js';
import type { VirtualScrollItemContext } from './types.js';
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
});
