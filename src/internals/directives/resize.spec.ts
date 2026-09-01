import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { render } from 'lit';
import { type SinonSpy, spy } from 'sinon';
import { escapeKey } from '../controllers/key-bindings.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../testing/simulate.spec.js';
import { lastOf } from '../utils/arrays.js';
import {
  type ResizableOptions,
  type ResizeCallbackParams,
  type ResizeState,
  resizable,
} from './resize.js';

describe('Resizable directive', () => {
  let section: HTMLElement;
  let instance: HTMLElement;
  let target: HTMLElement;
  let options: ResizableOptions;

  function getCallbackParams(fn: SinonSpy): ResizeCallbackParams {
    return lastOf(lastOf(fn.args));
  }

  function getCancelState(fn: SinonSpy): ResizeState {
    return lastOf(lastOf(fn.args));
  }

  function getGhost() {
    return document.querySelector<HTMLElement>('[data-resize-ghost]');
  }

  function renderResizable(opts?: ResizableOptions) {
    Object.assign(options, opts);

    render(
      html`
        <style>
          #resize-host {
            display: block;
            width: 200px;
            height: 200px;
          }

          #resize-target {
            width: 400px;
            height: 200px;
          }
        </style>
        <div id="resize-host" ${resizable(options)}></div>
        <div id="resize-target"></div>
      `,
      section
    );

    instance = section.querySelector<HTMLElement>('#resize-host')!;
    target = section.querySelector<HTMLElement>('#resize-target')!;
  }

  async function createFixture(initial: ResizableOptions) {
    options = initial;
    section = await fixture(
      html`<section style="width: 1000px; height: 1000px"></section>`
    );
    renderResizable();
  }

  const resizeStart = spy();

  afterEach(() => {
    resizeStart.resetHistory();

    // Remove ghost elements left behind by resize operations still active at test end.
    for (const ghost of document.querySelectorAll('[data-resize-ghost]')) {
      ghost.remove();
    }
  });

  describe('Immediate mode - basic element resizing', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'immediate' });
    });

    it('should not start a resize operation when disabled', async () => {
      renderResizable({ enabled: false, start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
    });

    it('should not start a resize operation on a non-primary button interaction', async () => {
      renderResizable({ start: resizeStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
    });

    it('should abort the operation when `start` returns false', async () => {
      const resize = spy();
      const end = spy();
      renderResizable({ start: () => false, resize, end });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 100,
      });
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(resize.called).is.false;
      expect(end.called).is.false;
      expect(instance.getBoundingClientRect()).to.eql(initial);
    });

    it('should not create a ghost element in "immediate" mode', async () => {
      const ghostFactory = spy();
      const layer = spy();
      renderResizable({ start: resizeStart, ghostFactory, layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.true;
      expect(ghostFactory.called).is.false;
      expect(layer.called).is.false;
      expect(getGhost()).is.null;
    });

    it('should invoke `start` with the initial resize state', async () => {
      renderResizable({ start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const rect = instance.getBoundingClientRect();
      const { state } = getCallbackParams(resizeStart);

      expect(state.initial).to.eql(rect);
      expect(state.current).to.eql(rect);
      expect([state.deltaX, state.deltaY]).to.eql([0, 0]);
      expect(state.ghost).is.null;
      expect(state.trigger).to.equal(instance);
    });

    it('should not invoke `resize` unless an operation is started', async () => {
      const resize = spy();
      renderResizable({ start: resizeStart, resize });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
      expect(resize.called).is.false;
    });

    it('should invoke `resize` on pointer moves and resize the element in place', async () => {
      const resize = spy();
      renderResizable({ resize });

      let rect = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      await elementUpdated(instance);

      for (let i = 1, delta = 10; i <= 5; i++) {
        simulatePointerMove(instance, {
          clientX: rect.right + delta,
          clientY: rect.bottom + delta,
        });
        await elementUpdated(instance);

        rect = instance.getBoundingClientRect();
        const { state } = getCallbackParams(resize);

        expect([state.deltaX, state.deltaY]).to.eql([delta * i, delta * i]);
        expect([state.current.width, state.current.height]).to.eql([
          rect.width,
          rect.height,
        ]);
      }
    });

    it('should apply dimensions mutated from within the `resize` callback', async () => {
      renderResizable({
        resize: ({ state }) => {
          state.current.width = 250;
        },
      });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 400,
        clientY: initial.bottom,
      });
      await elementUpdated(instance);

      const rect = instance.getBoundingClientRect();
      expect([rect.width, rect.height]).to.eql([250, initial.height]);
    });

    it('should invoke `end` and apply the final dimensions when the operation completes', async () => {
      const end = spy();
      renderResizable({ end });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(
        instance,
        { clientX: initial.right, clientY: initial.bottom },
        { x: 10, y: 10 },
        10
      );
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      const rect = instance.getBoundingClientRect();
      const { state } = getCallbackParams(end);

      expect(end.callCount).to.equal(1);
      expect([state.deltaX, state.deltaY]).to.eql([100, 100]);
      expect([state.current.width, state.current.height]).to.eql([
        rect.width,
        rect.height,
      ]);
    });

    it('should invoke `state.commit` instead of the default dimension application when assigned', async () => {
      const commit = spy();
      renderResizable({
        end: ({ state }) => {
          state.commit = commit;
        },
      });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(commit.callCount).to.equal(1);
    });

    it('should invoke `cancel` and restore the initial dimensions when pressing Escape', async () => {
      const cancel = spy();
      renderResizable({ cancel });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 100,
      });
      await elementUpdated(instance);

      expect(instance.getBoundingClientRect().width).to.equal(
        initial.width + 100
      );

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      const state = getCancelState(cancel);

      expect(cancel.callCount).to.equal(1);
      expect([state.deltaX, state.deltaY]).to.eql([100, 100]);
      expect(instance.getBoundingClientRect()).to.eql(initial);
    });

    it('should not invoke `cancel` when pressing Escape outside of a resize operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const cancel = spy();
      renderResizable({ cancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(cancel.called).is.false;
    });
  });

  describe('Immediate mode - advanced element resizing', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'immediate' });
    });

    it('should resize only horizontally when direction is "horizontal"', async () => {
      const resize = spy();
      renderResizable({ direction: 'horizontal', resize });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 100,
      });
      await elementUpdated(instance);

      const { state } = getCallbackParams(resize);

      expect([state.current.width, state.current.height]).to.eql([
        initial.width + 100,
        initial.height,
      ]);
    });

    it('should resize only vertically when direction is "vertical"', async () => {
      const resize = spy();
      renderResizable({ direction: 'vertical', resize });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 100,
      });
      await elementUpdated(instance);

      const { state } = getCallbackParams(resize);

      expect([state.current.width, state.current.height]).to.eql([
        initial.width,
        initial.height + 100,
      ]);
    });

    it('should clamp dimensions to the configured min/max constraints', async () => {
      const resize = spy();
      renderResizable({
        minWidth: 150,
        maxWidth: 300,
        minHeight: 150,
        maxHeight: 250,
        resize,
      });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);

      // Beyond the maximum constraints
      simulatePointerMove(instance, {
        clientX: initial.right + 500,
        clientY: initial.bottom + 500,
      });
      await elementUpdated(instance);

      let { state } = getCallbackParams(resize);
      expect([state.current.width, state.current.height]).to.eql([300, 250]);

      // Below the minimum constraints
      simulatePointerMove(instance, {
        clientX: initial.x - 50,
        clientY: initial.y - 50,
      });
      await elementUpdated(instance);

      state = getCallbackParams(resize).state;
      expect([state.current.width, state.current.height]).to.eql([150, 150]);
    });

    it('should maintain the initial aspect ratio when `maintainAspectRatio` is set', async () => {
      const resize = spy();
      renderResizable({
        target: () => target,
        maintainAspectRatio: true,
        resize,
      });

      // The target is 400x200 - an aspect ratio of 2
      const initial = target.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.x + 600,
        clientY: initial.y + 10,
      });
      await elementUpdated(instance);

      const { state } = getCallbackParams(resize);
      expect([state.current.width, state.current.height]).to.eql([600, 300]);
    });

    it('should resize the element resolved from the `target` option instead of the host', async () => {
      renderResizable({ target: () => target, start: resizeStart });

      const hostRect = instance.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const { state } = getCallbackParams(resizeStart);
      expect(state.initial).to.eql(targetRect);

      simulatePointerMove(instance, {
        clientX: targetRect.right + 100,
        clientY: targetRect.bottom + 50,
      });
      await elementUpdated(instance);

      const rect = target.getBoundingClientRect();

      expect([rect.width, rect.height]).to.eql([
        targetRect.width + 100,
        targetRect.height + 50,
      ]);
      expect(instance.getBoundingClientRect()).to.eql(hostRect);
    });
  });

  describe('Deferred mode - basic element resizing', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('should not start a resize operation when disabled', async () => {
      renderResizable({ enabled: false, start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
      expect(getGhost()).is.null;
    });

    it('should remove the ghost element when `start` returns false', async () => {
      renderResizable({ start: () => false });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()).is.null;
    });

    it('should create a default ghost element on the initial pointer interaction', async () => {
      renderResizable({ start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const { state } = getCallbackParams(resizeStart);

      expect(ghost).to.exist;
      expect(ghost.style.background).to.equal('pink');
      expect(ghost.parentElement).to.equal(document.body);
      expect(ghost.getBoundingClientRect()).to.eql(
        instance.getBoundingClientRect()
      );
      expect(state.ghost).to.equal(ghost);
    });

    it('should create a custom ghost element when a `ghostFactory` is passed', async () => {
      renderResizable({
        ghostFactory: () => document.createElement('section'),
      });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.localName).to.equal('section');
    });

    it('should place the ghost element in the configured `layer` container', async () => {
      const layer = spy(() => instance.parentElement!);
      renderResizable({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.parentElement).to.eql(instance.parentElement);
    });

    it('should correctly fallback to the document body as a container if the layer callbacks return falsy', async () => {
      const layer = spy((): HTMLElement => null as unknown as HTMLElement);
      renderResizable({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.parentElement).to.eql(document.body);
    });

    it('should resize the ghost element and not the target on pointer moves', async () => {
      renderResizable({});

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 50,
      });
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();

      expect([ghostRect.width, ghostRect.height]).to.eql([
        initial.width + 100,
        initial.height + 50,
      ]);
      expect(instance.getBoundingClientRect()).to.eql(initial);
    });

    it('should apply the final dimensions to the target and remove the ghost when the operation completes', async () => {
      const end = spy();
      renderResizable({ end });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 50,
      });
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      const rect = instance.getBoundingClientRect();

      expect(end.callCount).to.equal(1);
      expect(getGhost()).is.null;
      expect([rect.width, rect.height]).to.eql([
        initial.width + 100,
        initial.height + 50,
      ]);
    });

    it('should invoke `state.commit` and leave the target untouched when assigned', async () => {
      const commit = spy();
      renderResizable({
        end: ({ state }) => {
          state.commit = commit;
        },
      });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 50,
      });
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(commit.callCount).to.equal(1);
      expect(getGhost()).is.null;
      expect(instance.getBoundingClientRect()).to.eql(initial);
    });

    it('should remove the ghost and leave the target untouched on cancel', async () => {
      const cancel = spy();
      renderResizable({ cancel });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 50,
      });
      await elementUpdated(instance);

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      const state = getCancelState(cancel);

      expect(cancel.callCount).to.equal(1);
      expect([state.deltaX, state.deltaY]).to.eql([100, 50]);
      expect(getGhost()).is.null;
      expect(instance.getBoundingClientRect()).to.eql(initial);
    });

    it('should not invoke `cancel` when pressing Escape outside of a resize operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const cancel = spy();
      renderResizable({ cancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(cancel.called).is.false;
    });
  });

  describe('Deferred mode - advanced element resizing', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('should resize the ghost only in the configured direction', async () => {
      renderResizable({ direction: 'horizontal' });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.right + 100,
        clientY: initial.bottom + 100,
      });
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();

      expect([ghostRect.width, ghostRect.height]).to.eql([
        initial.width + 100,
        initial.height,
      ]);
    });

    it('should apply the final dimensions to the element resolved from the `target` option', async () => {
      renderResizable({ target: () => target, start: resizeStart });

      const hostRect = instance.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getCallbackParams(resizeStart).state.initial).to.eql(targetRect);

      simulatePointerMove(instance, {
        clientX: targetRect.right + 100,
        clientY: targetRect.bottom + 50,
      });
      await elementUpdated(instance);

      // The target is not resized while the operation is in flight.
      expect(target.getBoundingClientRect()).to.eql(targetRect);

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      const rect = target.getBoundingClientRect();

      expect(getGhost()).is.null;
      expect([rect.width, rect.height]).to.eql([
        targetRect.width + 100,
        targetRect.height + 50,
      ]);
      expect(instance.getBoundingClientRect()).to.eql(hostRect);
    });
  });
});
