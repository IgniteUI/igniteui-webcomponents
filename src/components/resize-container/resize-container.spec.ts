import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerEnter,
  simulatePointerLeave,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcResizeContainerComponent from './resize-container.js';
import type { ResizeCallbackParams } from './types.js';

describe('Resize container', () => {
  let element: IgcResizeContainerComponent;

  before(() => {
    defineComponents(IgcResizeContainerComponent);
  });

  describe('Attributes & Properties', () => {
    let resizeContainer: IgcResizeContainerComponent;

    beforeEach(async () => {
      resizeContainer = await fixture<IgcResizeContainerComponent>(html`
        <igc-resize-container></igc-resize-container>
      `);
    });

    it('should be defined', () => {
      expect(resizeContainer).to.exist;
    });

    it('should initialize with correct default state', () => {
      expect(resizeContainer.mode).to.equal('immediate');
      expect(resizeContainer.ghostFactory).to.be.undefined;
    });

    it('should be accessible', async () => {
      await expect(resizeContainer).shadowDom.accessible();
      await expect(resizeContainer).lightDom.accessible();
    });
  });

  describe('Immediate mode', () => {
    function createResizeContainer() {
      return html`
        <igc-resize-container>
          <div id="target" style="width: 200px; height: 200px">
            Immediate mode
          </div>
        </igc-resize-container>
      `;
    }

    beforeEach(async () => {
      element = await fixture<IgcResizeContainerComponent>(
        createResizeContainer()
      );
    });

    describe('Events', () => {
      it('adorners visibility is toggled on pointer enter/leave events', async () => {
        const DOM = getDOM(element);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element === null
          )
        ).to.be.true;

        // Pointerenter - adorners rendered
        await setResizeActiveState(element);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element !== null
          )
        ).to.be.true;

        // Pointerleave - adorners removed
        await setResizeActiveState(element, false);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element === null
          )
        ).to.be.true;
      });

      it('resize behavior should only start when interacting with the trigger element', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');

        simulatePointerDown(element);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeStart');
      });

      it('should not have a ghost element when in immediate mode', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const params: ResizeCallbackParams = eventSpy.lastCall.lastArg.detail;
        expect(params.state.ghost).to.be.null;
      });

      it('should fire `resizeStart` on pointer interaction', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeStart');
      });

      it('should fire `resize` when resizing behavior is triggered', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResize');
      });

      it('should fire `resizeEnd` when resizing is finished', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateLostPointerCapture(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeEnd');
      });

      it('should not fire `resizeCancel` when escape key is pressed without active resizing', async () => {
        const eventSpy = spy(element, 'emitEvent');

        // Default state
        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeCancel');

        // While in "active" state but not in resize mode
        await setResizeActiveState(element, true);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeCancel');
        expect(eventSpy.getCalls()).to.be.empty;
      });

      it('should fire `resizeCancel` when escape key is pressed during resizing', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeCancel');
      });
    });
  });

  describe('Deferred mode', () => {
    function createDeferredResizeContainer() {
      return html`
        <igc-resize-container mode="deferred">
          <div style="width: 200px; height: 200px">Deferred mode</div>
        </igc-resize-container>
      `;
    }

    beforeEach(async () => {
      element = await fixture<IgcResizeContainerComponent>(
        createDeferredResizeContainer()
      );
    });

    describe('Events', () => {
      it('adorners visibility is toggled on pointer enter/leave events', async () => {
        const DOM = getDOM(element);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element === null
          )
        ).to.be.true;

        // Pointerenter - adorners rendered
        await setResizeActiveState(element);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element !== null
          )
        ).to.be.true;

        // Pointerleave - adorners removed
        await setResizeActiveState(element, false);

        expect(
          Array.from(Object.values(DOM.adorners)).every(
            (element) => element === null
          )
        ).to.be.true;
      });

      it('resize behavior should only start when interacting with the trigger element', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');

        simulatePointerDown(element);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeStart');
      });

      it('should initialize the default ghost on pointerdown', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(DOM.ghostElement).to.exist;
        expect(DOM.ghostElement?.style.background).to.equal('pink');
      });

      it('should create a user-defined ghost on resizing', async () => {
        element.ghostFactory = () => {
          const custom = document.createElement('section');
          custom.classList.add('custom-ghost');

          return custom;
        };

        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(DOM.ghostElement).to.exist;
        expect(DOM.ghostElement?.classList.contains('custom-ghost')).to.be.true;
      });

      it('should fire `resizeStart` on pointer interaction', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeStart');
      });

      it('should fire `resize` event', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResize');
      });

      it('should fire `resizeEnd` when resizing is finished', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateLostPointerCapture(adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeEnd');
      });

      it('should remove ghost element when resizing is done', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeEnd');
        expect(DOM.ghostElement).to.not.exist;
      });

      it('should not fire `resizeCancel` when escape key is pressed without active resizing', async () => {
        const eventSpy = spy(element, 'emitEvent');

        // Default state
        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeCancel');

        // While in "active" state but not in resize mode
        await setResizeActiveState(element, true);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeCancel');
        expect(eventSpy.getCalls()).to.be.empty;
      });

      it('should fire `resizeCancel` when escape key is pressed during resizing', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeCancel');
      });

      it('should remove ghost element on `resizeCancel`', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        const eventSpy = spy(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeCancel');
        expect(DOM.ghostElement).to.not.exist;
      });
    });
  });
});

/** Helper function to poke through the resize container DOM structure */
function getDOM(resizeElement: IgcResizeContainerComponent) {
  const root = resizeElement.shadowRoot!;

  return {
    adorners: {
      get side() {
        return root.querySelector<HTMLElement>('[part="trigger-side"]')!;
      },
      get corner() {
        return root.querySelector<HTMLElement>('[part="trigger"]')!;
      },
      get bottom() {
        return root.querySelector<HTMLElement>('[part="trigger-bottom"]')!;
      },
    },
    get container() {
      return root.querySelector<HTMLElement>('[part~="resize-base"]')!;
    },
    /** The ghost element when in deferred mode */
    get ghostElement() {
      return resizeElement.querySelector<HTMLElement>('[data-resize-ghost]');
    },
  };
}

async function setResizeActiveState(
  resizeContainer: IgcResizeContainerComponent,
  state = true
) {
  const { container } = getDOM(resizeContainer);
  state ? simulatePointerEnter(container) : simulatePointerLeave(container);
  await elementUpdated(resizeContainer);
}

function getTargetXY(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    clientX: rect.right,
    clientY: rect.bottom,
  };
}
