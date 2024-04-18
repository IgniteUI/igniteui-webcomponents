import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcPopoverComponent from './popover.js';

async function waitForPaint(popover: IgcPopoverComponent) {
  await elementUpdated(popover);
  await nextFrame();
  await nextFrame();
}

function getFloater(popover: IgcPopoverComponent) {
  return popover.shadowRoot!.querySelector('#container') as HTMLElement;
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

      it('`strategy` updates are reflected', async () => {
        const floater = getFloater(popover);
        const getPosition = () =>
          getComputedStyle(floater).getPropertyValue('position');

        anchor.click();
        await waitForPaint(popover);

        expect(getPosition()).to.equal('absolute');

        popover.strategy = 'fixed';
        await waitForPaint(popover);

        expect(getPosition()).to.equal('fixed');
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
        popover = root.querySelector('igc-popover') as IgcPopoverComponent;
        anchor = root.querySelector('#btn') as HTMLButtonElement;
        // await waitForPaint(popover);
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
        popover = root.querySelector('igc-popover') as IgcPopoverComponent;
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

      it('`strategy` updates are reflected', async () => {
        const floater = getFloater(popover);
        const getPosition = () =>
          getComputedStyle(floater).getPropertyValue('position');

        anchor.click();
        await waitForPaint(popover);

        expect(getPosition()).to.equal('absolute');

        popover.strategy = 'fixed';
        await waitForPaint(popover);

        expect(getPosition()).to.equal('fixed');
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
});
