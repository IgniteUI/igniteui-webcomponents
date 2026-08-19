import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcPopoverComponent, { type PopoverPlacement } from './popover.js';

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

describe('Popover', () => {
  before(() => {
    defineComponents(IgcPopoverComponent);
  });

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
        popover = root.querySelector(
          IgcPopoverComponent.tagName
        ) as IgcPopoverComponent;
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
        popover = root.querySelector(
          IgcPopoverComponent.tagName
        ) as IgcPopoverComponent;
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
          <igc-popover open flip shift anchor="btn" placement=${placement}>
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

  describe('Positioning strategy', () => {
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
      const popover = root.querySelector(
        IgcPopoverComponent.tagName
      ) as IgcPopoverComponent;
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('fixed');
    });

    it('uses the `fixed` strategy with a non-direct sticky ancestor', async () => {
      const root = await fixture<HTMLElement>(
        createStickyPopover('grandparent')
      );
      const popover = root.querySelector(
        IgcPopoverComponent.tagName
      ) as IgcPopoverComponent;
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('fixed');
    });

    it('uses the `absolute` strategy without a sticky ancestor', async () => {
      const root = await fixture<HTMLElement>(createNonSlottedPopover(true));
      const popover = root.querySelector(
        IgcPopoverComponent.tagName
      ) as IgcPopoverComponent;
      await waitForPaint(popover);

      expect(getFloater(popover).style.position).to.equal('absolute');
    });
  });
});
