import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
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

describe('Tooltip', () => {
  let anchor: HTMLButtonElement;
  let tooltip: IgcTooltipComponent;
  let clock: SinonFakeTimers;

  const DIFF_OPTIONS = {
    ignoreAttributes: ['anchor'],
  };

  const endTick = (tick: number) => tick + 180;

  before(() => {
    defineComponents(IgcTooltipComponent);
  });

  async function showComplete(instance: IgcTooltipComponent = tooltip) {
    finishAnimationsFor(instance.shadowRoot!);
    await elementUpdated(instance);
    await nextFrame();
  }

  async function hideComplete(instance: IgcTooltipComponent = tooltip) {
    await elementUpdated(instance);
    finishAnimationsFor(instance.shadowRoot!);
    await nextFrame();
    await nextFrame();
  }

  describe('Initialization Tests', () => {
    beforeEach(async () => {
      const container = await fixture(createDefaultTooltip());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
    });

    it('is defined', () => {
      expect(tooltip).to.exist;
    });

    it('is accessible', async () => {
      await expect(tooltip).to.be.accessible();
      await expect(tooltip).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(tooltip.dir).to.be.empty;
      expect(tooltip.open).to.be.false;
      expect(tooltip.disableArrow).to.be.false;
      expect(tooltip.inline).to.be.false;
      expect(tooltip.offset).to.equal(4);
      expect(tooltip.placement).to.equal('top');
      expect(tooltip.anchor).to.be.undefined;
      expect(tooltip.showTriggers).to.equal('pointerenter');
      expect(tooltip.hideTriggers).to.equal('pointerleave');
      expect(tooltip.showDelay).to.equal(500);
      expect(tooltip.hideDelay).to.equal(500);
      expect(tooltip.message).to.equal('');
    });

    it('should render a default arrow', () => {
      const arrow = tooltip.shadowRoot!.querySelector('#arrow');
      expect(arrow).not.to.be.null;
    });

    it('is correctly rendered both in shown/hidden states', async () => {
      expect(tooltip.open).to.be.false;

      expect(tooltip).dom.to.equal('<igc-tooltip>It works!</igc-tooltip>');
      expect(tooltip).shadowDom.to.equal(
        `<igc-popover
          aria-hidden="true"
          flip
          shift
        >
          <div part="base">
            <slot></slot>
            <div id="arrow"></div>
          </div>
        </igc-popover>`
      );

      tooltip.open = true;
      await elementUpdated(tooltip);

      expect(tooltip).dom.to.equal('<igc-tooltip open>It works!</igc-tooltip>');
      expect(tooltip).shadowDom.to.equal(
        `<igc-popover
          aria-hidden="false"
          flip
          shift
          open
        >
          <div part="base">
            <slot></slot>
            <div id="arrow"></div>
          </div>
        </igc-popover>`
      );
    });

    it('is initially open on first render', async () => {
      const container = await fixture(createDefaultTooltip(true));
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;

      expect(tooltip).to.exist;
      expect(tooltip.open).to.be.true;
    });

    it('is initially open on first render with target', async () => {
      const container = await fixture(createTooltipWithTarget(true));
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;

      expect(tooltip).to.exist;
      expect(tooltip.open).to.be.true;
    });
  });

  describe('Properties Tests', () => {
    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      const container = await fixture(createTooltipWithTarget());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
      anchor = container.querySelector('button')!;
    });

    afterEach(() => {
      clock.restore();
    });

    it('should set target via `anchor` property', async () => {
      const template = html`
        <div>
          <button id="first">I will have a tooltip</button>
          <button id="second">I will have a tooltip too</button>
          <button id="third">Just happy to be here</button>
          <igc-tooltip>I am a tooltip</igc-tooltip>
        </div>
      `;
      const container = await fixture(template);
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;

      const first = document.querySelector('#first') as HTMLButtonElement;
      const second = document.querySelector('#second') as HTMLButtonElement;
      const third = document.querySelector('#third') as HTMLButtonElement;

      // If no anchor is provided.
      // Considers the first preceding sibling that is an element as the target.
      simulatePointerEnter(third);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulatePointerLeave(third);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;

      simulatePointerEnter(first);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.false;

      // By providing an IDREF
      tooltip.anchor = first.id;
      await elementUpdated(tooltip);

      simulatePointerEnter(first);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulatePointerLeave(first);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;

      // By providing an Element
      simulatePointerEnter(second);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.false;

      tooltip.anchor = second;
      await elementUpdated(tooltip);

      simulatePointerEnter(second);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;
    });

    it('should show/hide the arrow via the `disableArrow` property', async () => {
      expect(tooltip.disableArrow).to.be.false;
      expect(tooltip.shadowRoot!.querySelector('#arrow')).to.exist;

      tooltip.disableArrow = true;
      await elementUpdated(tooltip);

      expect(tooltip.disableArrow).to.be.true;
      expect(tooltip.shadowRoot!.querySelector('#arrow')).to.be.null;
    });

    it('should show/hide the arrow via the `disable-arrow` attribute', async () => {
      const template = html`
        <div>
          <button>Hover</button>
          <igc-tooltip disable-arrow>I am a tooltip</igc-tooltip>
        </div>
      `;
      const container = await fixture(template);
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;

      expect(tooltip.disableArrow).to.be.true;
      expect(tooltip.shadowRoot!.querySelector('#arrow')).to.be.null;
    });

    it('should set the tooltip content as plain text if the `message` property is set', async () => {
      expect(tooltip.message).to.equal('');
      expect(tooltip).dom.to.equal(
        '<igc-tooltip>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );
      expect(tooltip).shadowDom.to.equal(
        `<igc-popover
          aria-hidden="true"
          flip
          shift
        >
          <div part="base">
            <slot></slot>
            <div id="arrow"></div>
          </div>
        </igc-popover>`
      );

      const message = 'Hello!';
      tooltip.message = message;
      await elementUpdated(tooltip);

      expect(tooltip.message).to.equal(message);
      expect(tooltip).dom.to.equal(
        '<igc-tooltip>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );
      expect(tooltip).shadowDom.to.equal(
        `<igc-popover
          aria-hidden="true"
          flip
          shift
        >
          <div part="base">
            ${message}
            <div id="arrow"></div>
          </div>
        </igc-popover>`
      );
    });
  });

  describe('Methods` Tests', () => {
    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      const container = await fixture(createTooltipWithTarget());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
      anchor = container.querySelector('button')!;
    });

    afterEach(() => {
      clock.restore();
    });

    it('calls `show` and `hide` methods successfully and returns proper values', async () => {
      expect(tooltip.open).to.be.false;

      tooltip.show().then((x) => expect(x).to.be.true);
      await clock.tickAsync(500);
      await showComplete();

      expect(tooltip.open).to.be.true;
      expect(tooltip).dom.to.equal(
        '<igc-tooltip open>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );

      tooltip.hide().then((x) => expect(x).to.be.true);
      await clock.tickAsync(endTick(500));
      await hideComplete();

      expect(tooltip.open).to.be.false;
      expect(tooltip).dom.to.equal(
        '<igc-tooltip>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );
    });

    it('calls `toggle` method successfully and returns proper values', async () => {
      expect(tooltip.open).to.be.false;

      tooltip.toggle().then((x) => expect(x).to.be.true);
      await clock.tickAsync(500);
      await showComplete();

      expect(tooltip.open).to.be.true;
      expect(tooltip).dom.to.equal(
        '<igc-tooltip open>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );

      tooltip.toggle().then((x) => expect(x).to.be.true);
      await clock.tickAsync(endTick(500));
      await hideComplete();

      expect(tooltip.open).to.be.false;
      expect(tooltip).dom.to.equal(
        '<igc-tooltip>It works!</igc-tooltip>',
        DIFF_OPTIONS
      );
    });
  });

  describe('Behaviors', () => {
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
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulatePointerLeave(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('custom triggers via property', async () => {
      tooltip.showTriggers = 'focus,click';
      tooltip.hideTriggers = 'blur';

      simulateFocus(anchor);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;

      simulateClick(anchor);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('custom triggers via attribute', async () => {
      const template = html`
        <div>
          <button>Hover over me</button>
          <igc-tooltip show-triggers="focus,click" hide-triggers="blur"
            >I am a tooltip</igc-tooltip
          >
        </div>
      `;
      const container = await fixture(template);
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
      anchor = container.querySelector('button')!;

      simulateFocus(anchor);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;

      simulateClick(anchor);
      await clock.tickAsync(500);
      await showComplete();
      expect(tooltip.open).to.be.true;

      simulateBlur(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('pointerenter over tooltip prevents hiding and pointerleave triggers hiding', async () => {
      simulatePointerEnter(anchor);
      await clock.tickAsync(500);
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
      await clock.tickAsync(endTick(500));
      await hideComplete();
      expect(tooltip.open).to.be.false;
    });

    it('should show/hide the tooltip based on `showDelay` and `hideDelay`', async () => {
      tooltip.showDelay = tooltip.hideDelay = 400;
      simulatePointerEnter(anchor);
      await clock.tickAsync(399);
      expect(tooltip.open).to.be.false;

      await clock.tickAsync(1);
      await showComplete(tooltip);
      expect(tooltip.open).to.be.true;

      simulatePointerLeave(anchor);
      await clock.tickAsync(endTick(399));
      expect(tooltip.open).to.be.true;

      await clock.tickAsync(1);
      await hideComplete(tooltip);
      expect(tooltip.open).to.be.false;
    });
  });

  describe('Events', () => {
    let eventSpy: ReturnType<typeof spy>;

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      const container = await fixture(createDefaultTooltip());
      tooltip = container.querySelector(IgcTooltipComponent.tagName)!;
      anchor = container.querySelector('button')!;
      eventSpy = spy(tooltip, 'emitEvent');
    });

    afterEach(() => {
      clock.restore();
    });

    const verifyStateAndEventSequence = (
      state: { open: boolean } = { open: false }
    ) => {
      expect(tooltip.open).to.equal(state.open);
      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith(
        state.open ? 'igcOpening' : 'igcClosing',
        { cancelable: true, detail: anchor }
      );
      expect(eventSpy.secondCall).calledWith(
        state.open ? 'igcOpened' : 'igcClosed',
        { detail: anchor }
      );
    };

    it('events are correctly emitted on user interaction', async () => {
      simulatePointerEnter(anchor);
      await clock.tickAsync(500);
      await showComplete(tooltip);
      verifyStateAndEventSequence({ open: true });

      eventSpy.resetHistory();

      simulatePointerLeave(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete(tooltip);
      verifyStateAndEventSequence({ open: false });
    });

    it('can cancel -ing events', async () => {
      tooltip.addEventListener('igcOpening', (e) => e.preventDefault(), {
        once: true,
      });

      simulatePointerEnter(anchor);
      await clock.tickAsync(500);
      await showComplete(tooltip);

      expect(tooltip.open).to.be.false;
      expect(eventSpy).calledOnceWith('igcOpening', {
        cancelable: true,
        detail: anchor,
      });

      eventSpy.resetHistory();

      tooltip.open = true;
      await elementUpdated(tooltip);

      tooltip.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      simulatePointerLeave(anchor);
      await clock.tickAsync(endTick(500));
      await hideComplete(tooltip);

      expect(tooltip.open).to.be.true;
      expect(eventSpy).calledOnceWith('igcClosing', {
        cancelable: true,
        detail: anchor,
      });
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
      await clock.tickAsync(500);
      await showComplete(tooltip);

      expect(tooltip.open).to.be.true;

      document.documentElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        })
      );
      await clock.tickAsync(endTick(500));
      await hideComplete(tooltip);

      expect(tooltip.open).to.be.false;
    });

    it('pressing Escape in an active page with multiple opened tooltips hides the last shown', async () => {
      const container = await fixture(createTooltips());
      const [first, last] = container.querySelectorAll(
        IgcTooltipComponent.tagName
      );

      first.show().then((x) => expect(x).to.be.true);
      last.show().then((x) => expect(x).to.be.true);
      await clock.tickAsync(500);
      await showComplete(first);
      await showComplete(last);

      expect(first.open).to.be.true;
      expect(last.open).to.be.true;

      document.documentElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        })
      );

      await clock.tickAsync(endTick(500));
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

      await clock.tickAsync(endTick(500));
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
