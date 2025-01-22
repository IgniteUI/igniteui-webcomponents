import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type Sinon from 'sinon';
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
import IgcResizeContainerComponent, {
  type IgcResizeContainerComponentEventMap,
} from './resize-container.js';
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
        <igc-resize></igc-resize>
      `);
    });

    it('should be defined', () => {
      expect(resizeContainer).to.not.be.null;
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
        <igc-resize>
          <div id="target" style="height: 200px">Immediate mode</div>
        </igc-resize>
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

      it('should not start resize behavior with non-primary "button"', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner, { button: 1 });
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeStart');
      });

      it('should not have a ghost element when in immediate mode', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const { ghost } = getResizeEventState(eventSpy);
        expect(ghost).to.be.null;
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
        await setResizeActiveState(element);

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

    describe('Events - dimensions and parameters', () => {
      it('`resizeStart` event parameters match initial state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeStart');

        const targetRect = DOM.container.getBoundingClientRect();
        const { initial, current, deltaX, deltaY } =
          getResizeEventState(eventSpy);

        // Assert the resize container DOM rect matches the event parameters state
        expect(initial).to.eql(targetRect);
        expect(current).to.eql(targetRect);

        // No initial deltas
        expect([deltaX, deltaY]).to.eql([0, 0]);
      });

      it('`resize` event parameters match resize target state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect = DOM.container.getBoundingClientRect();
        let current: ResizeCallbackParams['state'];

        for (let i = 1, delta = 10; i <= 10; i++) {
          simulatePointerMove(DOM.adorners.corner, {
            clientX: rect.right + delta,
            clientY: rect.bottom + delta,
          });
          await elementUpdated(element);

          rect = DOM.container.getBoundingClientRect();
          current = getResizeEventState(eventSpy);

          // Correct deltas
          expect([current.deltaX, current.deltaY]).to.eql([
            delta * i,
            delta * i,
          ]);

          // Correct dimensions
          expect([current.current.width, current.current.height]).to.eql([
            rect.width,
            rect.height,
          ]);
        }
      });

      it('`resizeEnd` event parameters match resize target end state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let state = getResizeEventState(eventSpy);

        simulatePointerMove(
          DOM.adorners.corner,
          { clientX: state.initial.right, clientY: state.initial.bottom },
          { x: 10, y: 10 },
          10
        );
        await elementUpdated(element);

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        state = getResizeEventState(eventSpy);
        const rect = DOM.container.getBoundingClientRect();

        expect([
          state.current.width - state.initial.width,
          state.current.height - state.initial.height,
        ]).to.eql([state.deltaX, state.deltaY]);

        expect([state.current.width, state.current.height]).to.eql([
          rect.width,
          rect.height,
        ]);
      });

      it('`resizeCancel` correctly restores initial state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect: DOMRect;
        let state = getResizeEventState(eventSpy);

        simulatePointerMove(
          DOM.adorners.corner,
          {
            clientX: state.initial.right,
            clientY: state.initial.bottom,
          },
          { x: -200, y: -200 }
        );
        await elementUpdated(element);

        state = getResizeEventState(eventSpy);
        rect = DOM.container.getBoundingClientRect();

        expect([rect.width, rect.height]).to.eql([
          state.current.width,
          state.current.height,
        ]);
        expect([state.deltaX, state.deltaY]).to.eql([-200, -200]);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        rect = DOM.container.getBoundingClientRect();

        expect([rect.width, rect.height]).to.not.eql([
          state.current.width,
          state.current.height,
        ]);
        expect([rect.width, rect.height]).to.eql([
          state.initial.width,
          state.initial.height,
        ]);
      });
    });
  });

  describe('Deferred mode', () => {
    function createDeferredResizeContainer() {
      return html`
        <igc-resize mode="deferred">
          <div style="height: 200px">Deferred mode</div>
        </igc-resize>
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

      it('should not start resize behavior with non-primary "button"', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner, { button: 1 });
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeStart');
      });

      it('should initialize the default ghost on pointerdown', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(DOM.ghostElement).to.not.be.null;
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

        expect(DOM.ghostElement).to.not.be.null;
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
        expect(DOM.ghostElement).to.be.null;
      });

      it('should not fire `resizeCancel` when escape key is pressed without active resizing', async () => {
        const eventSpy = spy(element, 'emitEvent');

        // Default state
        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expect(eventSpy).not.calledWith('igcResizeCancel');

        // While in "active" state but not in resize mode
        await setResizeActiveState(element);

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
        expect(DOM.ghostElement).to.be.null;
      });
    });

    describe('Events - dimensions and parameters', () => {
      it('`resizeStart` event parameters match initial state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(eventSpy).calledWith('igcResizeStart');

        const targetRect = DOM.ghostElement.getBoundingClientRect();
        const { initial, current, deltaX, deltaY } =
          getResizeEventState(eventSpy);

        // Assert the resize container DOM rect matches the event parameters state
        expect(initial).to.eql(targetRect);
        expect(current).to.eql(targetRect);

        // No initial deltas
        expect([deltaX, deltaY]).to.eql([0, 0]);
      });

      it('`resize` event parameters match resize target state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect = DOM.ghostElement.getBoundingClientRect();
        let current: ResizeCallbackParams['state'];

        for (let i = 1, delta = 10; i <= 10; i++) {
          simulatePointerMove(DOM.adorners.corner, {
            clientX: rect.right + delta,
            clientY: rect.bottom + delta,
          });
          await elementUpdated(element);

          rect = DOM.ghostElement.getBoundingClientRect();
          current = getResizeEventState(eventSpy);

          // Correct deltas
          expect([current.deltaX, current.deltaY]).to.eql([
            delta * i,
            delta * i,
          ]);

          // Correct dimensions
          expect([current.current.width, current.current.height]).to.eql([
            rect.width,
            rect.height,
          ]);
        }
      });

      it('`resizeEnd` event parameters match resize target end state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let state = getResizeEventState(eventSpy);

        simulatePointerMove(
          DOM.adorners.corner,
          { clientX: state.initial.right, clientY: state.initial.bottom },
          { x: 10, y: 10 },
          10
        );
        await elementUpdated(element);

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        state = getResizeEventState(eventSpy);
        const rect = DOM.container.getBoundingClientRect();

        expect([
          state.current.width - state.initial.width,
          state.current.height - state.initial.height,
        ]).to.eql([state.deltaX, state.deltaY]);

        expect([state.current.width, state.current.height]).to.eql([
          rect.width,
          rect.height,
        ]);
      });

      it('`resizeCancel` correctly restores initial state', async () => {
        await setResizeActiveState(element);

        const eventSpy = spy(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect: DOMRect;
        let state = getResizeEventState(eventSpy);

        simulatePointerMove(
          DOM.adorners.corner,
          {
            clientX: state.initial.right,
            clientY: state.initial.bottom,
          },
          { x: -200, y: -200 }
        );
        await elementUpdated(element);

        state = getResizeEventState(eventSpy);
        rect = DOM.ghostElement.getBoundingClientRect();

        expect([rect.width, rect.height]).to.eql([
          state.current.width,
          state.current.height,
        ]);
        expect([state.deltaX, state.deltaY]).to.eql([-200, -200]);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        rect = DOM.container.getBoundingClientRect();

        expect([rect.width, rect.height]).to.not.eql([
          state.current.width,
          state.current.height,
        ]);
        expect([rect.width, rect.height]).to.eql([
          state.initial.width,
          state.initial.height,
        ]);
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
      return resizeElement.querySelector<HTMLElement>('[data-resize-ghost]')!;
    },
  };
}

async function setResizeActiveState(
  resizeElement: IgcResizeContainerComponent,
  state = true
) {
  const { container } = getDOM(resizeElement);
  state ? simulatePointerEnter(container) : simulatePointerLeave(container);
  await elementUpdated(resizeElement);
}

function getResizeEventState(
  eventSpy: Sinon.SinonSpy<
    [
      type: keyof IgcResizeContainerComponentEventMap,
      eventInitDict?: CustomEventInit<unknown> | undefined,
    ],
    boolean
  >
): ResizeCallbackParams['state'] {
  return eventSpy.lastCall.lastArg.detail.state;
}
