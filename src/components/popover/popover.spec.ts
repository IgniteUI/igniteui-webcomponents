import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import { simulateScroll } from '#internals/testing/simulate.spec.js';
import IgcPopoverComponent, { type PopoverPlacement } from './popover.js';
import {
  setPopoverPositionStrategy,
  SUPPORTS_ANCHOR_POSITIONING,
} from './position/types.js';

type PositionMode = 'native' | 'fallback';

async function waitForPaint(popover: IgcPopoverComponent) {
  await elementUpdated(popover);
  await nextFrame();
  await nextFrame();
}

function getFloater(popover: IgcPopoverComponent) {
  return popover.renderRoot.querySelector('#container') as HTMLElement;
}

function isFloaterOpen(popover: IgcPopoverComponent) {
  return getFloater(popover).matches(':popover-open');
}

function queryPopover(root: ParentNode) {
  return root.querySelector(IgcPopoverComponent.tagName) as IgcPopoverComponent;
}

function togglePopover() {
  const popover = document.querySelector(
    IgcPopoverComponent.tagName
  ) as IgcPopoverComponent;
  popover.open = !popover.open;
}

function createSlottedPopover(isOpen = false) {
  return html`
    <igc-popover id="popover" ?open=${isOpen}>
      <button id="btn" slot="anchor" type="button" @click=${togglePopover}>
        Show message
      </button>
      <p style="border: 1px solid #ccc">Message</p>
    </igc-popover>
  `;
}

function createNonSlottedPopover(isOpen = false) {
  return html`
    <div style="min-height: 800px">
      <button id="btn" type="button" @click=${togglePopover}>
        Show message
      </button>

      <igc-popover ?open=${isOpen} anchor="btn">
        <p style="border: 1px solid #ccc">Message</p>
      </igc-popover>
    </div>
  `;
}

function createAnchorlessPopover() {
  return html`
    <div>
      <button id="btn" type="button">Show message</button>
      <igc-popover>
        <p style="border: 1px solid #ccc">Message</p>
      </igc-popover>
    </div>
  `;
}

function definePositioningSuites(mode: PositionMode) {
  describe('Slotted anchor element', async () => {
    let popover: IgcPopoverComponent;
    let anchor: HTMLButtonElement;

    describe('With initial open state', () => {
      beforeEach(async () => {
        popover = await fixture<IgcPopoverComponent>(
          createSlottedPopover(true)
        );
      });

      it('should render a component', async () => {
        expect(popover).to.exist;
      });

      it('should be accessible', async () => {
        await expect(popover).shadowDom.to.be.accessible();
        await expect(popover).dom.to.be.accessible();
      });

      it('should be in open state on first render', async () => {
        expect(popover.open).to.be.true;
      });
    });

    describe('With initial closed state', () => {
      beforeEach(async () => {
        popover = await fixture<IgcPopoverComponent>(createSlottedPopover());
        anchor = popover.querySelector('#btn')!;
      });

      it('should render a component', async () => {
        expect(popover).to.exist;
      });

      it('should be accessible', async () => {
        await expect(popover).shadowDom.to.be.accessible();
        await expect(popover).dom.to.be.accessible();
      });

      it('should be in closed state on first render', async () => {
        expect(popover.open).to.be.false;
      });

      it('should update open state on trigger action', async () => {
        anchor.click();
        await waitForPaint(popover);

        expect(popover.open).to.be.true;
      });

      it('`offset` updates are reflected', async () => {
        const floater = getFloater(popover);

        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();

        popover.offset = 100;
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();

        expect(delta.top - initial.top).to.equal(100);
      });

      it('`same-width` updates are reflected', async () => {
        const floater = getFloater(popover);

        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();

        popover.sameWidth = true;
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();

        expect(delta.width).to.be.greaterThan(initial.width);
        expect(delta.width).to.equal(anchor.getBoundingClientRect().width);
      });

      it('`anchor` slot changes are reflected', async () => {
        const floater = getFloater(popover);
        const newAnchor = document.createElement('button');
        newAnchor.textContent = 'New Show Message';
        newAnchor.style.height = '100px';
        newAnchor.slot = 'anchor';

        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();
        expect(initial.top).to.equal(anchor.getBoundingClientRect().bottom);

        anchor.replaceWith(newAnchor);
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();

        expect(delta.top).to.be.greaterThan(initial.top);
        expect(delta.top).to.equal(newAnchor.getBoundingClientRect().bottom);
      });
    });
  });

  describe('Non-slotted anchor element', async () => {
    let popover: IgcPopoverComponent;
    let anchor: HTMLButtonElement;

    describe('With initial open state', () => {
      beforeEach(async () => {
        const root = await fixture<HTMLElement>(createNonSlottedPopover(true));
        popover = queryPopover(root);
        anchor = root.querySelector('#btn') as HTMLButtonElement;
      });

      it('should render a component', async () => {
        expect(popover).to.exist;
      });

      it('is accessible', async () => {
        await expect(popover).shadowDom.to.be.accessible();
        await expect(popover).dom.to.be.accessible();
      });

      it('should be in open state on first render', async () => {
        expect(popover.open).to.be.true;
      });

      it('should update to closed state on trigger action', async () => {
        anchor.click();
        await waitForPaint(popover);

        expect(popover.open).to.be.false;
      });
    });

    describe('With initial closed state', () => {
      beforeEach(async () => {
        const root = await fixture<HTMLElement>(createNonSlottedPopover());
        popover = queryPopover(root);
        anchor = root.querySelector('#btn') as HTMLButtonElement;
      });

      it('should render a component', async () => {
        expect(popover).to.exist;
      });

      it('is accessible', async () => {
        await expect(popover).shadowDom.to.be.accessible();
        await expect(popover).dom.to.be.accessible();
      });

      it('should be in closed state on first render', async () => {
        expect(popover.open).to.be.false;
      });

      it('should update open state on trigger action', async () => {
        anchor.click();
        await waitForPaint(popover);

        expect(popover.open).to.be.true;
      });

      it('`offset` updates are reflected', async () => {
        const floater = getFloater(popover);

        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();

        popover.offset = 100;
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();

        expect(delta.top - initial.top).to.equal(100);
      });

      it('`same-width` updates are reflected', async () => {
        const floater = getFloater(popover);

        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();

        popover.sameWidth = true;
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();

        expect(delta.width).to.be.greaterThan(initial.width);
        expect(delta.width).to.equal(anchor.getBoundingClientRect().width);
      });

      it('`anchor` property updates are reflected', async () => {
        const floater = getFloater(popover);
        const fixture = popover.parentElement as HTMLElement;
        const newAnchor = document.createElement('button');
        newAnchor.textContent = 'New Anchor';
        newAnchor.id = 'newAnchor';
        newAnchor.style.display = 'block';
        newAnchor.style.height = '200px';

        fixture.prepend(newAnchor);
        anchor.click();
        await waitForPaint(popover);

        const initial = floater.getBoundingClientRect();

        popover.anchor = 'newAnchor';
        await waitForPaint(popover);

        const delta = floater.getBoundingClientRect();
        expect(delta.top).to.be.lessThan(initial.top);
      });
    });
  });

  describe('Anchor resolution', () => {
    let root: HTMLElement;
    let popover: IgcPopoverComponent;
    let anchor: HTMLButtonElement;

    async function openAtButton() {
      popover.anchor = 'btn';
      popover.open = true;
      await waitForPaint(popover);
    }

    beforeEach(async () => {
      root = await fixture<HTMLElement>(createAnchorlessPopover());
      popover = queryPopover(root);
      anchor = root.querySelector('#btn') as HTMLButtonElement;
    });

    it('resolves an IDREF appearing after the first render', async () => {
      popover.anchor = 'late-anchor';
      await waitForPaint(popover);

      const late = document.createElement('button');
      late.id = 'late-anchor';
      late.textContent = 'Late anchor';
      root.append(late);

      popover.open = true;
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.true;
      expect(getFloater(popover).getBoundingClientRect().top).to.equal(
        late.getBoundingClientRect().bottom
      );
    });

    it('shows when `anchor` is set while already open', async () => {
      popover.open = true;
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.false;

      popover.anchor = 'btn';
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.true;
      expect(getFloater(popover).getBoundingClientRect().top).to.equal(
        anchor.getBoundingClientRect().bottom
      );
    });

    it('shows when a slotted anchor is added while already open', async () => {
      const slotted = await fixture<IgcPopoverComponent>(
        html`<igc-popover><p>Message</p></igc-popover>`
      );

      slotted.open = true;
      await waitForPaint(slotted);

      expect(isFloaterOpen(slotted)).to.be.false;

      const anchor = document.createElement('button');
      anchor.slot = 'anchor';
      anchor.textContent = 'Show message';
      slotted.prepend(anchor);
      await waitForPaint(slotted);

      expect(isFloaterOpen(slotted)).to.be.true;
    });

    it('keeps the current anchor when an IDREF cannot be resolved', async () => {
      await openAtButton();

      const initial = getFloater(popover).getBoundingClientRect();

      popover.anchor = 'no-such-element';
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.true;
      expect(getFloater(popover).getBoundingClientRect().top).to.equal(
        initial.top
      );
    });

    it('hides when `anchor` is unset', async () => {
      await openAtButton();

      expect(isFloaterOpen(popover)).to.be.true;

      popover.anchor = undefined;
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.false;
    });

    it('hides when the anchor element leaves the DOM', async () => {
      await openAtButton();

      anchor.remove();
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.false;
    });

    it('stays open when the anchor is removed and re-inserted in the same task', async () => {
      await openAtButton();

      const parent = anchor.parentElement as HTMLElement;
      const sibling = anchor.nextSibling;

      anchor.remove();
      parent.insertBefore(anchor, sibling);
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.true;
      expect(getFloater(popover).getBoundingClientRect().top).to.equal(
        anchor.getBoundingClientRect().bottom
      );
    });
  });

  describe('Open state', () => {
    let root: HTMLElement;
    let popover: IgcPopoverComponent;

    beforeEach(async () => {
      root = await fixture<HTMLElement>(createNonSlottedPopover(true));
      popover = queryPopover(root);
      await waitForPaint(popover);
    });

    it('hides the floating element when closed', async () => {
      expect(isFloaterOpen(popover)).to.be.true;

      popover.open = false;
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.false;
    });

    it('restores the open state when re-attached', async () => {
      popover.remove();
      await nextFrame();

      expect(isFloaterOpen(popover)).to.be.false;

      root.append(popover);
      await waitForPaint(popover);

      expect(isFloaterOpen(popover)).to.be.true;
    });

    it('uses the expected positioning mechanism', async () => {
      const floater = getFloater(popover);

      if (mode === 'native') {
        expect(floater.hasAttribute('data-anchored')).to.be.true;
        expect(floater.style.transform).to.equal('');
      } else {
        expect(floater.hasAttribute('data-anchored')).to.be.false;
        expect(floater.style.transform).to.not.equal('');
      }
    });
  });

  describe('Placement', () => {
    function createPlacedPopover(placement: PopoverPlacement, dir = 'ltr') {
      return html`
        <div dir=${dir}>
          <button
            id="btn"
            type="button"
            style="position: fixed; top: 200px; left: 200px; width: 80px; height: 40px"
          >
            Anchor
          </button>
          <igc-popover open anchor="btn" placement=${placement}>
            <div style="width: 40px; height: 20px">M</div>
          </igc-popover>
        </div>
      `;
    }

    async function placementRects(placement: PopoverPlacement, dir = 'ltr') {
      const root = await fixture<HTMLElement>(
        createPlacedPopover(placement, dir)
      );
      const popover = queryPopover(root);
      await waitForPaint(popover);

      return {
        floater: getFloater(popover).getBoundingClientRect(),
        anchor: root.querySelector('#btn')!.getBoundingClientRect(),
      };
    }

    function centerX(rect: DOMRect) {
      return rect.left + rect.width / 2;
    }

    function centerY(rect: DOMRect) {
      return rect.top + rect.height / 2;
    }

    // Main-axis edge and cross-axis alignment relations per placement,
    // shared by both strategies.
    const MATRIX: Array<
      [PopoverPlacement, (f: DOMRect, a: DOMRect) => Array<[number, number]>]
    > = [
      [
        'top',
        (f, a) => [
          [f.bottom, a.top],
          [centerX(f), centerX(a)],
        ],
      ],
      [
        'top-start',
        (f, a) => [
          [f.bottom, a.top],
          [f.left, a.left],
        ],
      ],
      [
        'top-end',
        (f, a) => [
          [f.bottom, a.top],
          [f.right, a.right],
        ],
      ],
      [
        'bottom',
        (f, a) => [
          [f.top, a.bottom],
          [centerX(f), centerX(a)],
        ],
      ],
      [
        'bottom-start',
        (f, a) => [
          [f.top, a.bottom],
          [f.left, a.left],
        ],
      ],
      [
        'bottom-end',
        (f, a) => [
          [f.top, a.bottom],
          [f.right, a.right],
        ],
      ],
      [
        'left',
        (f, a) => [
          [f.right, a.left],
          [centerY(f), centerY(a)],
        ],
      ],
      [
        'left-start',
        (f, a) => [
          [f.right, a.left],
          [f.top, a.top],
        ],
      ],
      [
        'left-end',
        (f, a) => [
          [f.right, a.left],
          [f.bottom, a.bottom],
        ],
      ],
      [
        'right',
        (f, a) => [
          [f.left, a.right],
          [centerY(f), centerY(a)],
        ],
      ],
      [
        'right-start',
        (f, a) => [
          [f.left, a.right],
          [f.top, a.top],
        ],
      ],
      [
        'right-end',
        (f, a) => [
          [f.left, a.right],
          [f.bottom, a.bottom],
        ],
      ],
    ];

    for (const [placement, relations] of MATRIX) {
      it(`positions \`${placement}\` against the anchor`, async () => {
        const { floater, anchor } = await placementRects(placement);

        for (const [actual, expected] of relations(floater, anchor)) {
          expect(actual).to.be.closeTo(expected, 1);
        }
      });
    }

    it('aligns `-start`/`-end` placements to the inline edges in RTL', async () => {
      const start = await placementRects('bottom-start', 'rtl');
      expect(start.floater.right).to.be.closeTo(start.anchor.right, 1);
      expect(start.floater.top).to.be.closeTo(start.anchor.bottom, 1);

      const end = await placementRects('bottom-end', 'rtl');
      expect(end.floater.left).to.be.closeTo(end.anchor.left, 1);
    });

    it('keeps `left`/`right` placements physical in RTL', async () => {
      const { floater, anchor } = await placementRects('right-start', 'rtl');

      expect(floater.left).to.be.closeTo(anchor.right, 1);
      expect(floater.top).to.be.closeTo(anchor.top, 1);
    });
  });

  describe('Middleware', () => {
    function createOverflowingPopover(placement: PopoverPlacement) {
      return html`
        <div style="height: 200vh">
          <button
            id="btn"
            type="button"
            style="position: absolute; top: calc(100vh - 24px)"
          >
            Show message
          </button>
          <igc-popover open flip anchor="btn" placement=${placement}>
            <div style="height: 300px; width: 100px">Message</div>
          </igc-popover>
        </div>
      `;
    }

    for (const placement of ['bottom', 'bottom-start'] as PopoverPlacement[]) {
      it(`flips a \`${placement}\` placement that overflows the viewport`, async () => {
        const root = await fixture<HTMLElement>(
          createOverflowingPopover(placement)
        );
        const popover = queryPopover(root);
        await waitForPaint(popover);

        const anchor = root.querySelector('#btn')!;

        expect(
          getFloater(popover).getBoundingClientRect().bottom
        ).to.be.at.most(anchor.getBoundingClientRect().top + 1);
      });
    }
  });

  describe('Arrow element', () => {
    let popover: IgcPopoverComponent;
    let arrow: HTMLElement;

    beforeEach(async () => {
      const root = await fixture<HTMLElement>(html`
        <div style="padding: 200px">
          <button id="btn" type="button">Show message</button>
          <igc-popover open anchor="btn" placement="bottom">
            <p style="border: 1px solid #ccc">Message</p>
            <div id="arrow" style="width: 10px; height: 10px"></div>
          </igc-popover>
        </div>
      `);

      popover = queryPopover(root);
      arrow = root.querySelector('#arrow') as HTMLElement;

      popover.arrow = arrow;
      await waitForPaint(popover);
    });

    it('is rendered on the opposite side of the placement', async () => {
      expect(arrow.part.contains('bottom')).to.be.true;
      expect(arrow.style.top).to.equal('-10px');

      popover.placement = 'top';
      await waitForPaint(popover);

      expect(arrow.part.contains('top')).to.be.true;
      expect(arrow.part.contains('bottom')).to.be.false;
      expect(arrow.style.bottom).to.equal('-10px');
    });

    it('clears the inset of the previous placement', async () => {
      expect(arrow.style.top).to.equal('-10px');
      expect(arrow.style.bottom).to.equal('');

      popover.placement = 'top';
      await waitForPaint(popover);

      expect(arrow.style.bottom).to.equal('-10px');
      expect(arrow.style.top).to.equal('');

      popover.placement = 'right';
      await waitForPaint(popover);

      expect(arrow.style.left).to.equal('-10px');
      expect(arrow.style.bottom).to.equal('');
      expect(arrow.style.right).to.equal('');
    });

    it('keeps parts set outside of the popover', async () => {
      arrow.part.add('custom');

      popover.placement = 'top';
      await waitForPaint(popover);

      expect(arrow.part.contains('custom')).to.be.true;
      expect(arrow.part.contains('top')).to.be.true;
    });

    it('`arrow-offset` is reflected', async () => {
      const initial = Number.parseFloat(arrow.style.left);

      popover.arrowOffset = 20;
      await waitForPaint(popover);

      expect(Number.parseFloat(arrow.style.left) - initial).to.equal(20);
    });
  });

  describe('Arrow element with flipping', () => {
    afterEach(() => {
      window.scrollTo(0, 0);
    });

    it('tracks the resolved side of a flipped placement through scrolling', async () => {
      const root = await fixture<HTMLElement>(html`
        <div style="height: 200vh">
          <button
            id="btn"
            type="button"
            style="position: absolute; top: calc(100vh - 24px)"
          >
            Show message
          </button>
          <igc-popover open flip anchor="btn" placement="bottom">
            <div style="height: 100px; width: 100px">Message</div>
            <div id="arrow" style="width: 10px; height: 10px"></div>
          </igc-popover>
        </div>
      `);
      const popover = queryPopover(root);

      popover.arrow = root.querySelector('#arrow') as HTMLElement;
      await waitForPaint(popover);

      // Overflows below the viewport - flipped above the anchor.
      expect(popover.arrow.part.contains('top')).to.be.true;

      window.scrollTo(0, window.innerHeight);
      await waitForPaint(popover);
      await nextFrame();

      // The anchor now sits near the viewport top - back below it.
      expect(popover.arrow.part.contains('bottom')).to.be.true;
    });
  });

  describe('Anchor visibility', () => {
    // The scroller sits mid-viewport so the popover, which keeps tracking the
    // clipped anchor position, stays inside the viewport - the hit-test below
    // then reflects only the hidden state, never off-screen geometry.
    function createClippedPopover() {
      return html`
        <div>
          <div
            id="scroller"
            style="height: 150px; overflow: auto; margin-top: 300px"
          >
            <div style="height: 600px; padding-top: 25px">
              <button id="btn" type="button">Show message</button>
            </div>
          </div>
          <igc-popover open anchor="btn">
            <p style="border: 1px solid #ccc">Message</p>
          </igc-popover>
        </div>
      `;
    }

    // The native strongly-hidden state from `position-visibility` is not
    // reflected by checkVisibility() or computed styles - hit-testing is the
    // one observable signal, and it also covers the fallback's inline
    // `visibility: hidden`, since hidden elements are never hit-testable.
    function isContentHitTestable(root: HTMLElement): boolean {
      const content = root.querySelector('p')!;
      const rect = content.getBoundingClientRect();
      const found = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      return found === content;
    }

    it('hides the popover while the anchor is fully clipped and restores it on scroll back', async () => {
      const root = await fixture<HTMLElement>(createClippedPopover());
      const popover = queryPopover(root);
      const scroller = root.querySelector<HTMLElement>('#scroller')!;

      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.true;

      // The anchor is now fully above the scroller's visible window.
      await simulateScroll(scroller, { top: 150 });
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.false;

      await simulateScroll(scroller, { top: 0 });
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.true;
    });

    it('`scroll` keeps the popover visible while the anchor is fully clipped', async () => {
      const root = await fixture<HTMLElement>(createClippedPopover());
      const popover = queryPopover(root);
      const scroller = root.querySelector<HTMLElement>('#scroller')!;

      popover.scrollStrategy = 'scroll';
      await elementUpdated(popover);
      await waitForPaint(popover);

      await simulateScroll(scroller, { top: 150 });
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.true;
    });

    it('switching to `scroll` while hidden restores the popover', async () => {
      const root = await fixture<HTMLElement>(createClippedPopover());
      const popover = queryPopover(root);
      const scroller = root.querySelector<HTMLElement>('#scroller')!;

      await simulateScroll(scroller, { top: 150 });
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.false;

      popover.scrollStrategy = 'scroll';
      await elementUpdated(popover);
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.true;
    });

    it('re-opens visible after closing while the anchor was clipped', async () => {
      const root = await fixture<HTMLElement>(createClippedPopover());
      const popover = queryPopover(root);
      const scroller = root.querySelector<HTMLElement>('#scroller')!;

      await simulateScroll(scroller, { top: 150 });
      await waitForPaint(popover);
      expect(isContentHitTestable(root)).to.be.false;

      popover.open = false;
      await waitForPaint(popover);

      await simulateScroll(scroller, { top: 0 });
      popover.open = true;
      await waitForPaint(popover);

      expect(isContentHitTestable(root)).to.be.true;
    });
  });
}

describe('Popover', () => {
  before(() => {
    defineComponents(IgcPopoverComponent);
  });

  for (const mode of ['native', 'fallback'] as const) {
    const describeMode =
      mode === 'native' && !SUPPORTS_ANCHOR_POSITIONING
        ? describe.skip
        : describe;

    describeMode(`Positioning [${mode}]`, () => {
      before(() => {
        setPopoverPositionStrategy(mode === 'fallback' ? 'floating' : 'native');
      });

      after(() => {
        setPopoverPositionStrategy();
      });

      definePositioningSuites(mode);
    });
  }

  // Positioning-strategy-agnostic - the popover owns the document scroll
  // listener and only notifies; whoever controls `open` closes it.
  describe('Scroll strategy', () => {
    let popover: IgcPopoverComponent;
    let scroller: HTMLElement;
    let closeRequests: number;

    beforeEach(async () => {
      scroller = await fixture<HTMLElement>(html`
        <div style="height: 150px; overflow: auto">
          <div style="height: 600px">
            <igc-popover open>
              <button id="btn" slot="anchor" type="button">Show message</button>
              <p>Message</p>
            </igc-popover>
          </div>
        </div>
      `);
      popover = queryPopover(scroller);

      closeRequests = 0;
      popover.addEventListener('igcPopoverScrollClose', () => {
        closeRequests++;
      });

      await waitForPaint(popover);
    });

    it('`hide` (default) and `scroll` emit nothing on ancestor scroll', async () => {
      await simulateScroll(scroller, { top: 200 });
      expect(closeRequests).to.equal(0);
      expect(popover.open).to.be.true;

      popover.scrollStrategy = 'scroll';
      await elementUpdated(popover);

      await simulateScroll(scroller, { top: 400 });
      expect(closeRequests).to.equal(0);
      expect(popover.open).to.be.true;
    });

    it('`igcPopoverScrollClose` does not bubble up the DOM', async () => {
      popover.scrollStrategy = 'close';
      await elementUpdated(popover);

      const documentEvents: Event[] = [];
      const listener = (event: Event) => documentEvents.push(event);
      document.addEventListener('igcPopoverScrollClose', listener);

      try {
        await simulateScroll(scroller, { top: 200 });
      } finally {
        document.removeEventListener('igcPopoverScrollClose', listener);
      }

      // The direct listener on the popover fired, the document one never did.
      expect(closeRequests).to.be.greaterThan(0);
      expect(documentEvents.length).to.equal(0);
    });

    it('`close` emits `igcPopoverScrollClose` on ancestor scroll while open', async () => {
      popover.scrollStrategy = 'close';
      await elementUpdated(popover);

      await simulateScroll(scroller, { top: 200 });
      expect(closeRequests).to.be.greaterThan(0);

      // The popover does not own its open state - closing is up to the host.
      expect(popover.open).to.be.true;
    });

    it('stops emitting when the strategy is reset while open', async () => {
      popover.scrollStrategy = 'close';
      await elementUpdated(popover);

      await simulateScroll(scroller, { top: 200 });
      expect(closeRequests).to.be.greaterThan(0);

      popover.scrollStrategy = 'scroll';
      await elementUpdated(popover);
      const seen = closeRequests;

      await simulateScroll(scroller, { top: 400 });
      expect(closeRequests).to.equal(seen);
    });

    it('does not emit while closed', async () => {
      popover.scrollStrategy = 'close';
      popover.open = false;
      await elementUpdated(popover);

      await simulateScroll(scroller, { top: 200 });
      expect(closeRequests).to.equal(0);
    });
  });

  // floating-ui specific behavior - the native path has no positioning
  // strategy concept (anchor positioning is layout-true under sticky).
  describe('Positioning strategy [fallback]', () => {
    before(() => {
      setPopoverPositionStrategy('floating');
    });

    after(() => {
      setPopoverPositionStrategy();
    });

    function createStickyPopover(level: 'parent' | 'grandparent') {
      const popover = html`
        <igc-popover open anchor="btn">
          <p style="border: 1px solid #ccc">Message</p>
        </igc-popover>
      `;

      const inner = html`
        <button id="btn" type="button">Show message</button>
        ${popover}
      `;

      return level === 'parent'
        ? html`<div style="position: sticky; top: 0">${inner}</div>`
        : html`
            <div style="position: sticky; top: 0">
              <div>${inner}</div>
            </div>
          `;
    }

    it('uses the `fixed` strategy with a directly sticky ancestor', async () => {
      const root = await fixture<HTMLElement>(createStickyPopover('parent'));
      const popover = queryPopover(root);
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('fixed');
    });

    it('uses the `fixed` strategy with a non-direct sticky ancestor', async () => {
      const root = await fixture<HTMLElement>(
        createStickyPopover('grandparent')
      );
      const popover = queryPopover(root);
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('fixed');
    });

    it('uses the `absolute` strategy without a sticky ancestor', async () => {
      const root = await fixture<HTMLElement>(createNonSlottedPopover(true));
      const popover = queryPopover(root);
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('absolute');
    });
  });
});
