import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, fixture, html } from '../common/helpers.spec.js';
import {
  expectCalledWith,
  expectNotCalledWith,
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

  beforeAll(() => {
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
      expect(resizeContainer).is.not.null;
    });

    it('should initialize with correct default state', () => {
      expect(resizeContainer.mode).to.equal('immediate');
      expect(resizeContainer.ghostFactory).is.undefined;
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

    describe('API', () => {
      it('should show the adorners when the active property is set', async () => {
        const DOM = getDOM(element);

        expect(Object.values(DOM.adorners).every((e) => !e)).is.true;

        element.active = true;
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;
      });

      it('should not change adorners state with pointerenter/pointerleave when active is set', async () => {
        const DOM = getDOM(element);

        element.active = true;
        await elementUpdated(element);

        simulatePointerEnter(element);
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;

        simulatePointerLeave(element);
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;
      });
    });

    describe('Events', () => {
      it('adorners visibility is toggled on pointer enter/leave events', async () => {
        const DOM = getDOM(element);

        expect(Object.values(DOM.adorners).every((e) => !e)).is.true;

        // Pointerenter - adorners rendered
        await setResizeActiveState(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;

        // Pointerleave - adorners removed
        await setResizeActiveState(element, false);

        expect(Object.values(DOM.adorners).every((e) => !e)).is.true;
      });

      it('resize behavior should only start when interacting with the trigger element', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulatePointerDown(element);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should not start resize behavior with non-primary "button"', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner, { button: 1 });
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should not have a ghost element when in immediate mode', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const { ghost } = getResizeEventState(spy);
        expect(ghost).is.null;
      });

      it('should fire `resizeStart` on pointer interaction', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeStart');
      });

      it('should not fire `resize` unless `resizeStart` is triggered', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should fire `resize` when resizing behavior is triggered', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResize');
      });

      it('should fire `resizeEnd` when resizing is finished', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateLostPointerCapture(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeEnd');
      });

      it('should not fire `resizeCancel` when escape key is pressed without active resizing', async () => {
        const spy = vi.spyOn(element, 'emitEvent');
        // Default state
        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeCancel');

        // While in "active" state but not in resize mode
        await setResizeActiveState(element);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeCancel');
      });

      it('should fire `resizeCancel` when escape key is pressed during resizing', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeCancel');
      });
    });

    describe('Events - dimensions and parameters', () => {
      it('`resizeStart` event parameters match initial state', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeStart');

        const targetRect = DOM.container.getBoundingClientRect();
        const { initial, current, deltaX, deltaY } = getResizeEventState(spy);
        // Assert the resize container DOM rect matches the event parameters state
        expect(initial).to.eql(targetRect);
        expect(current).to.eql(targetRect);

        // No initial deltas
        expect([deltaX, deltaY]).to.eql([0, 0]);
      });

      it('`resize` event parameters match resize target state', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
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
          current = getResizeEventState(spy);

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

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let state = getResizeEventState(spy);

        simulatePointerMove(
          DOM.adorners.corner,
          { clientX: state.initial.right, clientY: state.initial.bottom },
          { x: 10, y: 10 },
          10
        );
        await elementUpdated(element);

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        state = getResizeEventState(spy);
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

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect: DOMRect;
        let state = getResizeEventState(spy);

        simulatePointerMove(
          DOM.adorners.corner,
          {
            clientX: state.initial.right,
            clientY: state.initial.bottom,
          },
          { x: -200, y: -200 }
        );
        await elementUpdated(element);

        state = getResizeEventState(spy);
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

    describe('Events - horizontal and vertical adorners', () => {
      it('horizontal adorner behavior', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);
        const spy = vi.spyOn(element, 'emitEvent');
        const rect = DOM.container.getBoundingClientRect();

        simulatePointerDown(DOM.adorners.side);
        await elementUpdated(element);

        let state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeStart');
        expect(state.trigger).to.equal(DOM.adorners.side);

        simulatePointerMove(DOM.adorners.side, {
          clientX: rect.right + 500,
          clientY: rect.bottom + 500,
        });
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResize');
        expect(state.current.height).to.equal(rect.height);
        expect(state.current.width).to.equal(rect.width + 500);

        simulateLostPointerCapture(DOM.adorners.side);
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeEnd');
        expect(state.current).to.eql(DOM.container.getBoundingClientRect());
      });

      it('vertical adorner behavior', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);
        const spy = vi.spyOn(element, 'emitEvent');
        const rect = DOM.container.getBoundingClientRect();

        simulatePointerDown(DOM.adorners.bottom);
        await elementUpdated(element);

        let state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeStart');
        expect(state.trigger).to.equal(DOM.adorners.bottom);

        simulatePointerMove(DOM.adorners.bottom, {
          clientX: rect.right + 500,
          clientY: rect.bottom + 500,
        });
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResize');
        expect(state.current.width).to.equal(rect.width);
        expect(state.current.height).to.equal(rect.height + 500);

        simulateLostPointerCapture(DOM.adorners.bottom);
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeEnd');
        expect(state.current).to.eql(DOM.container.getBoundingClientRect());
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

    describe('API', () => {
      it('should show the adorners when the active property is set', async () => {
        const DOM = getDOM(element);

        expect(Object.values(DOM.adorners).every((e) => !e)).is.true;

        element.active = true;
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;
      });

      it('should not change adorners state with pointerenter/pointerleave when active is set', async () => {
        const DOM = getDOM(element);

        element.active = true;
        await elementUpdated(element);

        simulatePointerEnter(element);
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;

        simulatePointerLeave(element);
        await elementUpdated(element);

        expect(Object.values(DOM.adorners).every((e) => Boolean(e))).is.true;
      });
    });

    describe('Events', () => {
      it('adorners visibility is toggled on pointer enter/leave events', async () => {
        const DOM = getDOM(element);

        expect(Object.values(DOM.adorners).every((e) => e === null)).is.true;

        // Pointerenter - adorners rendered
        await setResizeActiveState(element);

        expect(Object.values(DOM.adorners).every((e) => e !== null)).is.true;

        // Pointerleave - adorners removed
        await setResizeActiveState(element, false);

        expect(Object.values(DOM.adorners).every((e) => e === null)).is.true;
      });

      it('resize behavior should only start when interacting with the trigger element', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulatePointerDown(element);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should not start resize behavior with non-primary "button"', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner, { button: 1 });
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should initialize the default ghost on pointerdown', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expect(DOM.ghostElement).is.not.null;
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

        expect(DOM.ghostElement).is.not.null;
        expect(DOM.ghostElement?.classList.contains('custom-ghost')).is.true;
      });

      it('should fire `resizeStart` on pointer interaction', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeStart');
      });

      it('should not fire `resize` unless `resizeStart` is triggered', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const { adorners } = getDOM(element);

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeStart');
      });

      it('should fire `resize` event', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulatePointerMove(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResize');
      });

      it('should fire `resizeEnd` when resizing is finished', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateLostPointerCapture(adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeEnd');
      });

      it('should remove ghost element when resizing is done', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeEnd');
        expect(DOM.ghostElement).is.null;
      });

      it('should not fire `resizeCancel` when escape key is pressed without active resizing', async () => {
        const spy = vi.spyOn(element, 'emitEvent');

        // Default state
        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeCancel');

        // While in "active" state but not in resize mode
        await setResizeActiveState(element);

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectNotCalledWith(spy, 'igcResizeCancel');
        expect(spy.mock.calls).to.be.empty;
      });

      it('should fire `resizeCancel` when escape key is pressed during resizing', async () => {
        await setResizeActiveState(element);

        const { adorners } = getDOM(element);

        simulatePointerDown(adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeCancel');
      });

      it('should remove ghost element on `resizeCancel`', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        const spy = vi.spyOn(element, 'emitEvent');

        simulateKeyboard(element, escapeKey);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeCancel');
        expect(DOM.ghostElement).is.null;
      });
    });

    describe('Events - dimensions and parameters', () => {
      it('`resizeStart` event parameters match initial state', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        expectCalledWith(spy, 'igcResizeStart');

        const targetRect = DOM.ghostElement.getBoundingClientRect();
        const { initial, current, deltaX, deltaY } = getResizeEventState(spy);
        // Assert the resize container DOM rect matches the event parameters state
        expect(initial).to.eql(targetRect);
        expect(current).to.eql(targetRect);

        // No initial deltas
        expect([deltaX, deltaY]).to.eql([0, 0]);
      });

      it('`resize` event parameters match resize target state', async () => {
        await setResizeActiveState(element);

        const spy = vi.spyOn(element, 'emitEvent');
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
          current = getResizeEventState(spy);

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

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let state = getResizeEventState(spy);

        simulatePointerMove(
          DOM.adorners.corner,
          { clientX: state.initial.right, clientY: state.initial.bottom },
          { x: 10, y: 10 },
          10
        );
        await elementUpdated(element);

        simulateLostPointerCapture(DOM.adorners.corner);
        await elementUpdated(element);

        state = getResizeEventState(spy);
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

        const spy = vi.spyOn(element, 'emitEvent');
        const DOM = getDOM(element);

        simulatePointerDown(DOM.adorners.corner);
        await elementUpdated(element);

        let rect: DOMRect;
        let state = getResizeEventState(spy);

        simulatePointerMove(
          DOM.adorners.corner,
          {
            clientX: state.initial.right,
            clientY: state.initial.bottom,
          },
          { x: -200, y: -200 }
        );
        await elementUpdated(element);

        state = getResizeEventState(spy);
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

    describe('Events - horizontal and vertical adorners', () => {
      it('horizontal adorner behavior', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);
        const spy = vi.spyOn(element, 'emitEvent');
        const rect = DOM.container.getBoundingClientRect();

        simulatePointerDown(DOM.adorners.side);
        await elementUpdated(element);

        const ghostRect = DOM.ghostElement.getBoundingClientRect();
        let state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeStart');
        expect(state.trigger).to.equal(DOM.adorners.side);

        simulatePointerMove(DOM.adorners.side, {
          clientX: rect.right + 500,
          clientY: rect.bottom + 500,
        });
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResize');
        expect(state.current.height).to.equal(ghostRect.height);
        expect(state.current.width).to.equal(ghostRect.width + 500);

        simulateLostPointerCapture(DOM.adorners.side);
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeEnd');
        expect(state.current).to.eql(DOM.container.getBoundingClientRect());
      });

      it('vertical adorner behavior', async () => {
        await setResizeActiveState(element);

        const DOM = getDOM(element);
        const spy = vi.spyOn(element, 'emitEvent');
        const rect = DOM.container.getBoundingClientRect();

        simulatePointerDown(DOM.adorners.bottom);
        await elementUpdated(element);

        const ghostRect = DOM.ghostElement.getBoundingClientRect();
        let state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeStart');
        expect(state.trigger).to.equal(DOM.adorners.bottom);

        simulatePointerMove(DOM.adorners.bottom, {
          clientX: rect.right + 500,
          clientY: rect.bottom + 500,
        });
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResize');
        expect(state.current.width).to.equal(ghostRect.width);
        expect(state.current.height).to.equal(ghostRect.height + 500);

        simulateLostPointerCapture(DOM.adorners.bottom);
        await elementUpdated(element);

        state = getResizeEventState(spy);

        expectCalledWith(spy, 'igcResizeEnd');
        expect(state.current).to.eql(DOM.container.getBoundingClientRect());
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
      return document.querySelector<HTMLElement>('[data-resize-ghost]')!;
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

function getResizeEventState(spy: MockInstance): ResizeCallbackParams['state'] {
  return spy.mock.lastCall![1].detail.state;
}
