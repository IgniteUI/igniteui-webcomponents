import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  finishAnimationsFor,
  simulateBlur,
  simulateClick,
  simulateFocus,
  simulatePointerEnter,
  simulatePointerLeave,
} from '../common/utils.spec.js';
import IgcTooltipComponent from './tooltip.js';

// TODO: Add more tests

describe('Tooltip', () => {
  let tooltip: IgcTooltipComponent;
  let clock: SinonFakeTimers;

  before(() => {
    defineComponents(IgcTooltipComponent);
  });

  async function showComplete(instance: IgcTooltipComponent = tooltip) {
    finishAnimationsFor(instance.shadowRoot!);
    await elementUpdated(instance);
  }

  async function hideComplete(instance: IgcTooltipComponent = tooltip) {
    await elementUpdated(instance);
    await clock.runAllAsync();
    finishAnimationsFor(instance.shadowRoot!);
    await nextFrame();
  }

  describe('DOM (with explicit target)', () => {
    beforeEach(async () => {
      const container = await fixture(createTooltipWithTarget());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    it('is defined', async () => {
      expect(tooltip).to.exist;
    });
  });

  describe('DOM', () => {
    beforeEach(async () => {
      const container = await fixture(createDefaultTooltip());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    it('is defined', async () => {
      expect(tooltip).to.exist;
    });

    it('is accessible', async () => {
      await expect(tooltip).to.be.accessible();
      await expect(tooltip).shadowDom.to.be.accessible();
    });
  });

  describe('Initially open on first render', () => {
    beforeEach(async () => {
      const container = await fixture(createDefaultTooltip(true));
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    it('', async () => {
      expect(tooltip).to.exist;
      expect(tooltip.open).to.be.true;
    });
  });

  describe('Initially open on first render with target', () => {
    beforeEach(async () => {
      const container = await fixture(createTooltipWithTarget(true));
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    it('', async () => {
      expect(tooltip).to.exist;
      expect(tooltip.open).to.be.true;
    });
  });

  describe('Behaviors', () => {
    let anchor: HTMLButtonElement;

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      const container = await fixture(createDefaultTooltip());
      anchor = container.querySelector('button')!;
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    afterEach(() => {
      clock.restore();
    });

    it('default triggers', async () => {
      expect(tooltip.showTriggers).to.equal('pointerenter');
      expect(tooltip.hideTriggers).to.equal('pointerleave');

      simulatePointerEnter(anchor);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulatePointerLeave(anchor);
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('custom triggers', async () => {
      tooltip.showTriggers = 'focus,click';
      tooltip.hideTriggers = 'blur';

      simulateFocus(anchor);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await hideComplete();
      expect(tooltip.open).to.be.false;

      simulateClick(anchor);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('pointerenter over tooltip prevents hiding and pointerleave triggers hiding', async () => {
      simulatePointerEnter(anchor);
      await showComplete();
      expect(tooltip.open).to.be.true;

      // Move cursor from anchor to tooltip
      simulatePointerLeave(anchor);
      await nextFrame();
      simulatePointerEnter(tooltip);
      await nextFrame();

      expect(tooltip.open).to.be.true;

      // Move cursor outside the tooltip
      simulatePointerLeave(tooltip);
      await hideComplete();

      expect(tooltip.open).to.be.false;
    });
  });

  describe('Keyboard interactions', () => {
    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });

    it('pressing Escape in an active page hides the tooltip', async () => {
      const container = await fixture(createTooltips());
      const [anchor, _] = container.querySelectorAll('button');
      const [tooltip, __] = container.querySelectorAll(
        IgcTooltipComponent.tagName
      );

      simulatePointerEnter(anchor);
      await showComplete(tooltip);

      document.documentElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        })
      );
      await hideComplete(tooltip);

      expect(tooltip.open).to.be.false;
    });

    it('pressing Escape in an active page with multiple opened tooltips hides the last shown', async () => {
      const container = await fixture(createTooltips());
      const [first, last] = container.querySelectorAll(
        IgcTooltipComponent.tagName
      );

      first.show();
      last.show();
      await showComplete(first);
      await showComplete(last);

      document.documentElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        })
      );

      await hideComplete(first);
      await hideComplete(last);

      expect(last.open).to.be.false;
      expect(first.open).to.be.true;

      document.documentElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        })
      );

      await hideComplete(first);
      await hideComplete(last);

      expect(last.open).to.be.false;
      expect(first.open).to.be.false;
    });
  });
});

function createDefaultTooltip(isOpen = false) {
  return html`
    <div>
      <button>Hover over me</button>
      <igc-tooltip ?open=${isOpen}>It works!</igc-tooltip>
    </div>
  `;
}

function createTooltipWithTarget(isOpen = false) {
  return html`
    <div>
      <button id="target">I have a tooltip</button>
      <button>I don't have a tooltip</button>
      <igc-tooltip anchor="target" ?open=${isOpen}>It works!</igc-tooltip>
    </div>
  `;
}

function createTooltips() {
  return html`
    <div>
      <button>Target 1</button>
      <igc-tooltip>First</igc-tooltip>
      <button>Target 2</button>
      <igc-tooltip>Second</igc-tooltip>
    </div>
  `;
}
