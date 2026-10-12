import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { render } from 'lit';
import { type SinonSpy, spy } from 'sinon';
import { escapeKey } from '../controllers/key-bindings.js';
import { catchListenerErrors, compareStyles } from '../testing/helpers.spec.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../testing/simulate.spec.js';
import { lastOf } from '../utils/arrays.js';
import { getCenterPoint } from '../utils/dom.js';
import {
  type DragCallbackParams,
  type DraggableOptions,
  draggable,
} from './drag.js';

describe('Draggable directive', () => {
  let section: HTMLElement;
  let instance: HTMLElement;
  let options: DraggableOptions;

  function getCallbackArgs(fn: SinonSpy) {
    return lastOf(lastOf(fn.args)) as DragCallbackParams;
  }

  function getGhost() {
    return document.querySelector<HTMLElement>('[data-drag-ghost]');
  }

  function renderDraggable(opts?: DraggableOptions) {
    Object.assign(options, opts);

    render(
      html`
        <style>
          #drag-host {
            display: block;
            width: 200px;
            height: 200px;
          }

          .target {
            width: 400px;
            height: 400px;
          }
        </style>
        <div id="drag-host" ${draggable(options)}>
          <button class="no-trigger">No drag</button>
        </div>
        <div class="target"></div>
      `,
      section
    );

    instance = section.querySelector<HTMLElement>('#drag-host')!;
  }

  async function createFixture(initial: DraggableOptions) {
    options = initial;
    section = await fixture(
      html`<section style="width: 1000px; height: 1000px"></section>`
    );
    renderDraggable();
  }

  const dragStart = spy();

  afterEach(() => {
    dragStart.resetHistory();

    // Remove ghost elements left behind by drag operations still active at test end.
    for (const ghost of document.querySelectorAll('[data-drag-ghost]')) {
      ghost.remove();
    }
  });

  describe('Immediate mode - basic element dragging', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'immediate' });
    });

    it('should not start drag operation when disabled', async () => {
      renderDraggable({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      renderDraggable({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = spy(() => true);
      renderDraggable({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip.called).is.true;
      expect(dragStart.called).is.false;
    });

    it('should apply correct internal styles on drag operation', async () => {
      renderDraggable({ start: dragStart });
      const styles = { touchAction: 'none', userSelect: 'none' };

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(compareStyles(instance, styles)).is.true;
    });

    it('should not create a ghost element in "immediate" mode', async () => {
      const ghostFactory = spy();
      renderDraggable({ start: dragStart, ghostFactory });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(ghostFactory.called).is.false;
    });

    it('should not invoke the `layer` configuration callback in "immediate" mode', async () => {
      const layer = spy();
      renderDraggable({ start: dragStart, layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(layer.called).is.false;
    });

    it('should invoke start callback on drag operation', async () => {
      renderDraggable({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragStart.callCount).to.equal(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = spy();
      renderDraggable({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(dragMove.called).is.false;
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = spy();
      renderDraggable({ start: dragStart, move: dragMove });

      simulatePointerDown(instance);
      simulatePointerMove(
        instance,
        { clientX: 200, clientY: 200 },
        { x: 10, y: 10 },
        10
      );
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragMove.called).is.true;
      expect(dragMove.callCount).to.equal(10);
    });

    it('should invoke end when releasing the dragged element', async () => {
      const dragEnd = spy();
      renderDraggable({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart.callCount).to.equal(1);
      expect(dragEnd.callCount).to.equal(1);
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = spy();
      renderDraggable({ start: dragStart, cancel: dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.true;
    });

    it('should not invoke cancel when pressing Escape outside of drag operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const dragCancel = spy();
      renderDraggable({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.false;
    });
  });

  describe('Immediate mode - advanced element dragging', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'immediate' });
    });

    it('should not start a drag operation when `skip` is set and returns true', async () => {
      const button = instance.querySelector('button')!;
      const skip = spy((event: PointerEvent) => event.target === button);

      renderDraggable({ start: dragStart, skip });

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(skip.called).is.true;
      expect(skip.returned(true)).is.true;

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(skip.called).is.true;
      expect(skip.returned(false)).is.true;
    });

    it('should start a drag operation only from the element returned from the `trigger` invocation', async () => {
      const button = instance.querySelector('button')!;
      const trigger = spy(() => button);

      renderDraggable({ start: dragStart, trigger });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
    });

    it('should adhere to `snapToCursor` option on drag start', async () => {
      renderDraggable({ start: dragStart });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      // snapToCursor = false

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      let args = getCallbackArgs(dragStart);

      // The element keeps its offset from the cursor, so the position is zero.

      expect(args.state.position).to.eql({
        x: clientX - x + args.state.offset.x,
        y: clientY - y + args.state.offset.y,
      }); // { x: 0, y: 0 }

      // snapToCursor = true

      simulateLostPointerCapture(instance);
      renderDraggable({ snapToCursor: true });

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      args = getCallbackArgs(dragStart);

      // The element shifts by the offset between the cursor and its edges.

      expect(args.state.position).to.eql({
        x: clientX - x,
        y: clientY - y,
      }); // { x: 100, y: 100 }
    });

    it('should pass correct parameter state in the move callback', async () => {
      const move = spy();
      renderDraggable({ start: dragStart, move });

      const { x: clientX, y: clientY } = getCenterPoint(instance);

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(getCallbackArgs(dragStart).state.position).to.eql({ x: 0, y: 0 });

      simulatePointerMove(instance, { clientX, clientY }, { x: 50, y: 50 }, 3);
      await elementUpdated(instance);

      expect(getCallbackArgs(move).state.position).to.eql({
        x: 150,
        y: 150,
      });
    });

    it('should pass correct parameter state in end callback', async () => {
      const end = spy();
      renderDraggable({ end });

      const { x: clientX, y: clientY } = getCenterPoint(instance);

      simulatePointerDown(instance, { clientX, clientY });
      simulatePointerMove(instance, { clientX, clientY }, { x: 25, y: 33 }, 10);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(getCallbackArgs(end).state.position).to.eql({
        x: 250,
        y: 330,
      });
    });

    it('should invoke the `enter` callback when the `match` callback returns true', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const enter = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.true;

      expect(getCallbackArgs(enter).state.element).to.eql(target);
    });

    it('should not invoke the `enter` callback when the `match` callback returns false', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy(() => false);
      const enter = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.false;
    });

    it('should invoke the `leave` callback when leaving the boundaries of a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const enter = spy();
      const leave = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter, leave });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.true;

      expect(getCallbackArgs(enter).state.element).to.eql(target);

      simulatePointerMove(instance, { clientX: 0, clientY: 0 });
      await elementUpdated(instance);

      expect(leave.called).is.true;
      expect(getCallbackArgs(leave).state.element).to.eql(target);
    });

    it('should invoke the `over` callback while dragging over a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const over = spy();

      renderDraggable({ matchTarget, over });

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      // Not called on initial drag enter
      expect(over.called).is.false;

      simulatePointerMove(instance, { clientX, clientY }, { x: 5, y: 5 }, 5);
      await elementUpdated(instance);

      expect(over.callCount).to.equal(5);
      expect(getCallbackArgs(over).state.element).to.eql(target);
    });
  });

  describe('Deferred mode - basic element dragging', () => {
    function createGhost() {
      const clone = instance.cloneNode() as HTMLElement;
      clone.setAttribute('data-deferred-drag-ghost', '');

      return clone;
    }

    function getCustomGhost() {
      return document.querySelector<HTMLElement>('[data-deferred-drag-ghost]')!;
    }

    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('should not start drag operation when disabled', async () => {
      renderDraggable({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      renderDraggable({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = spy(() => true);
      renderDraggable({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip.called).is.true;
      expect(dragStart.called).is.false;
    });

    it('should apply correct internal styles on drag operation', async () => {
      renderDraggable({ start: dragStart });
      const styles = { touchAction: 'none', userSelect: 'none' };

      simulatePointerDown(instance);
      await elementUpdated(instance);

      // Drag mode sets `touch-action: none` and `user-select: none`.
      expect(instance.attributeStyleMap.size).to.equal(2);
      expect(compareStyles(instance, styles)).is.true;

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(instance.attributeStyleMap.size).to.equal(0);
    });

    it('should create a default ghost element in "deferred" mode if no configuration is passed', async () => {
      simulatePointerDown(instance);
      await elementUpdated(instance);

      const defaultGhost = getGhost()!;

      expect(defaultGhost).to.exist;

      // The ghost matches the dimensions of the dragged element and covers it.
      const instanceRect = instance.getBoundingClientRect();
      const ghostRect = defaultGhost.getBoundingClientRect();

      expect(ghostRect.width).to.equal(instanceRect.width);
      expect(ghostRect.height).to.equal(instanceRect.height);
      expect(ghostRect.x).to.equal(instanceRect.x);
      expect(ghostRect.y).to.equal(instanceRect.y);
    });

    it('should create a custom ghost element in "deferred" mode when a configuration is passed', async () => {
      renderDraggable({ ghostFactory: createGhost });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const customGhost = getCustomGhost();

      expect(customGhost).to.exist;
      expect(customGhost.localName).to.equal(instance.localName);
    });

    it('should correctly fallback to the document body as a container if the layer callbacks return falsy', async () => {
      const layer = spy((): HTMLElement => null as unknown as HTMLElement);
      renderDraggable({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.parentElement).to.eql(document.body);
    });

    it('should correctly place the ghost element in the configured layer container', async () => {
      const layer = spy(() => instance.parentElement!);
      renderDraggable({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.parentElement).to.eql(instance.parentElement);
    });

    it('should place the ghost over the target in a scrolled page', async () => {
      window.scrollTo(0, 100);

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const scrollY = window.scrollY;
      const ghostRect = getGhost()!.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();
      window.scrollTo(0, 0);

      expect(scrollY).to.equal(100);
      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should place the ghost over the target in a layer with a border and a scroll', async () => {
      Object.assign(section.style, {
        border: '10px solid',
        height: '300px',
        overflow: 'auto',
      });
      section.scrollTop = 100;
      renderDraggable({ layer: () => section });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const ghostRect = ghost.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();

      expect(ghost.parentElement).to.equal(section);
      expect(ghost.style.position).to.equal('fixed');
      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should place the ghost over the target in a transformed layer', async () => {
      section.style.transform = 'translate(30px, 40px)';
      renderDraggable({ layer: () => section });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();

      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should keep the ghost under the pointer in a scaled layer', async () => {
      section.style.transform = 'scale(0.5)';
      renderDraggable({ layer: () => section });

      const { x, y, width, height } = instance.getBoundingClientRect();

      simulatePointerDown(instance, { clientX: x, clientY: y });
      simulatePointerMove(instance, { clientX: x + 40, clientY: y + 20 });
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();

      expect([
        ghostRect.x,
        ghostRect.y,
        ghostRect.width,
        ghostRect.height,
      ]).to.eql([x + 40, y + 20, width, height]);
    });

    it('should place the ghost over the target in a positioned body with a margin', async () => {
      Object.assign(document.body.style, {
        position: 'relative',
        margin: '40px',
      });

      try {
        simulatePointerDown(instance);
        await elementUpdated(instance);

        const ghostRect = getGhost()!.getBoundingClientRect();
        const { x, y } = instance.getBoundingClientRect();

        expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
      } finally {
        Object.assign(document.body.style, { position: '', margin: '' });
      }
    });

    it('should keep the ghost under the pointer when a filtered body scrolls', async () => {
      document.body.style.filter = 'opacity(1)';

      try {
        const { x, y } = instance.getBoundingClientRect();

        simulatePointerDown(instance, { clientX: x, clientY: y });
        window.scrollTo(0, 100);
        simulatePointerMove(instance, { clientX: x, clientY: y });
        await elementUpdated(instance);

        const scrollY = window.scrollY;
        const ghostRect = getGhost()!.getBoundingClientRect();

        expect(scrollY).to.equal(100);
        expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
      } finally {
        document.body.style.filter = '';
        window.scrollTo(0, 0);
      }
    });

    it('should place a ghost that its factory transforms over the target', async () => {
      renderDraggable({
        ghostFactory: ({ width, height }) => {
          const ghost = document.createElement('div');
          Object.assign(ghost.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: 'scale(0.5)',
          });
          return ghost;
        },
      });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();

      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should invoke start callback on drag operation', async () => {
      renderDraggable({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragStart.callCount).to.equal(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = spy();
      renderDraggable({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(dragMove.called).is.false;
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = spy();
      renderDraggable({ start: dragStart, move: dragMove });

      simulatePointerDown(instance);
      simulatePointerMove(
        instance,
        { clientX: 200, clientY: 200 },
        { x: 10, y: 10 },
        10
      );
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragMove.called).is.true;
      expect(dragMove.callCount).to.equal(10);
    });

    it('should invoke end when releasing the dragged element', async () => {
      const dragEnd = spy();
      renderDraggable({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart.callCount).to.equal(1);
      expect(dragEnd.callCount).to.equal(1);
      expect(getGhost()).is.null;
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = spy();
      renderDraggable({ start: dragStart, cancel: dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.true;
      expect(getGhost()).is.null;
    });

    it('should not invoke cancel when pressing Escape outside of drag operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const dragCancel = spy();
      renderDraggable({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.false;
    });
  });

  describe('Deferred mode - advanced element dragging', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('should not start a drag operation when `skip` is set and returns true', async () => {
      const button = instance.querySelector('button')!;
      const skip = spy((event: PointerEvent) => event.target === button);

      renderDraggable({ start: dragStart, skip });

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(skip.called).is.true;
      expect(skip.returned(true)).is.true;

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(skip.called).is.true;
      expect(skip.returned(false)).is.true;
    });

    it('should start a drag operation only from the element returned from the `trigger` invocation', async () => {
      const button = instance.querySelector('button')!;
      const trigger = spy(() => button);

      renderDraggable({ start: dragStart, trigger });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
    });

    it('should adhere to `snapToCursor` option on drag start', async () => {
      renderDraggable({ start: dragStart });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      // snapToCursor = false

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      let args = getCallbackArgs(dragStart);

      // The ghost keeps its offset from the cursor, so it covers the element.
      // The position is from the document origin.

      expect(args.state.position).to.eql({ x, y });

      // snapToCursor = true

      simulateLostPointerCapture(instance);
      renderDraggable({ snapToCursor: true });

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      args = getCallbackArgs(dragStart);

      // The top left corner of the ghost moves to the cursor.

      expect(args.state.position).to.eql({ x: clientX, y: clientY });
    });

    it('should pass correct parameter state in the move callback', async () => {
      const move = spy();
      renderDraggable({ start: dragStart, move });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(getCallbackArgs(dragStart).state.position).to.eql({ x, y });

      simulatePointerMove(instance, { clientX, clientY }, { x: 50, y: 50 }, 3);
      await elementUpdated(instance);

      expect(getCallbackArgs(move).state.position).to.eql({
        x: x + 150,
        y: y + 150,
      });
    });

    it('should pass correct parameter state in end callback', async () => {
      const end = spy();
      renderDraggable({ end });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      simulatePointerDown(instance, { clientX, clientY });
      simulatePointerMove(instance, { clientX, clientY }, { x: 25, y: 33 }, 10);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(getCallbackArgs(end).state.position).to.eql({
        x: x + 250,
        y: y + 330,
      });
    });

    it('should invoke the `enter` callback when the `match` callback returns true', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const enter = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.true;

      expect(getCallbackArgs(enter).state.element).to.eql(target);
    });

    it('should not invoke the `enter` callback when the `match` callback returns false', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy(() => false);
      const enter = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.false;
    });

    it('should invoke the `leave` callback when leaving the boundaries of a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const enter = spy();
      const leave = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, enter, leave });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(enter.called).is.true;

      expect(getCallbackArgs(enter).state.element).to.eql(target);

      simulatePointerMove(instance, { clientX: 0, clientY: 0 });
      await elementUpdated(instance);

      expect(leave.called).is.true;
      expect(getCallbackArgs(leave).state.element).to.eql(target);
    });

    it('should leave and enter when the pointer moves straight to another matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = (element: Element) =>
        element === instance || element === target;
      const [enter, leave, over] = [spy(), spy(), spy()];

      renderDraggable({ matchTarget, enter, leave, over });

      const from = getCenterPoint(instance);
      const to = getCenterPoint(target);

      simulatePointerDown(instance, { clientX: from.x, clientY: from.y });
      simulatePointerMove(instance, { clientX: from.x, clientY: from.y });
      simulatePointerMove(instance, { clientX: to.x, clientY: to.y });
      simulatePointerMove(instance, { clientX: to.x + 1, clientY: to.y });
      await elementUpdated(instance);

      expect(getCallbackArgs(leave).state.element).to.equal(instance);
      expect(enter.args.map(([{ state }]) => state.element)).to.eql([
        instance,
        target,
      ]);
      expect(getCallbackArgs(over).state.element).to.equal(target);
    });

    it('should cancel a touch and a native drag only where a drag can start', async () => {
      renderDraggable({
        skip: (event) => (event.target as Element).matches('.no-trigger'),
      });

      const cancels = (type: string, element: Element) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      };
      const button = instance.querySelector('.no-trigger')!;

      expect(cancels('touchstart', instance)).to.be.true;
      expect(cancels('dragstart', instance)).to.be.true;
      expect(cancels('touchstart', button)).to.be.false;
      expect(cancels('dragstart', button)).to.be.false;
    });

    it('should invoke the `over` callback while dragging over a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy((element: Element) => target === element);
      const over = spy();

      renderDraggable({ matchTarget, over });

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      // Not called on initial drag enter
      expect(over.called).is.false;

      simulatePointerMove(instance, { clientX, clientY }, { x: 5, y: 5 }, 5);
      await elementUpdated(instance);

      expect(over.callCount).to.equal(5);
      expect(getCallbackArgs(over).state.element).to.eql(target);
    });
  });

  describe('Interrupted operations', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('cancels the operation on pointercancel', async () => {
      const cancel = spy();
      const end = spy();
      renderDraggable({ cancel, end });

      simulatePointerDown(instance);
      instance.dispatchEvent(
        new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 })
      );
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(cancel.calledOnce).is.true;
      expect(end.called).is.false;
      expect(getGhost()).is.null;
    });

    it('ignores the events of another pointer', async () => {
      const end = spy();
      const move = spy();
      renderDraggable({ end, move });

      const { right, bottom } = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        pointerId: 2,
        clientX: right + 50,
        clientY: bottom + 50,
      });
      simulateLostPointerCapture(instance, { pointerId: 2 });
      await elementUpdated(instance);

      expect(move.called).is.false;
      expect(end.called).is.false;
      expect(getGhost()).is.not.null;
    });

    it('disposes the operation when `start` throws', async () => {
      const start = spy(() => {
        if (start.callCount === 1) {
          throw new Error('start');
        }
      });
      renderDraggable({ start });

      const errors = catchListenerErrors(() => simulatePointerDown(instance));

      expect(errors).to.have.length(1);
      expect((errors[0] as Error).message).to.equal('start');
      expect(getGhost()).is.null;

      simulatePointerDown(instance);
      expect(start.calledTwice).is.true;
    });

    it('cancels the operation when the element disconnects', async () => {
      const cancel = spy();
      renderDraggable({ cancel });

      simulatePointerDown(instance);
      render(html``, section);
      await elementUpdated(section);

      expect(cancel.calledOnce).is.true;
      expect(getGhost()).is.null;
    });
  });

  describe('Directive life-cycle', () => {
    beforeEach(async () => {
      await createFixture({ mode: 'deferred' });
    });

    it('throws outside an element expression', () => {
      expect(() =>
        render(html`<div class=${draggable({})}></div>`, section)
      ).to.throw('The `draggable` directive can only be used on elements.');
    });

    it('starts operations after a reconnect with no new render', async () => {
      const start = spy();
      const container = document.createElement('div');
      section.append(container);

      const part = render(
        html`<div id="drag-host" ${draggable({ start })}></div>`,
        container,
        { isConnected: false }
      );
      const element = container.querySelector<HTMLElement>('#drag-host')!;

      part.setConnected(true);

      simulatePointerDown(element);
      expect(start.calledOnce).is.true;
      simulateLostPointerCapture(element);
    });

    it('starts operations only after a connected render', async () => {
      const start = spy();
      const template = () =>
        html`<div id="drag-host" ${draggable({ start })}></div>`;

      const container = document.createElement('div');
      section.append(container);

      const part = render(template(), container, { isConnected: false });
      const element = container.querySelector<HTMLElement>('#drag-host')!;

      simulatePointerDown(element);
      expect(start.called).is.false;
      simulateLostPointerCapture(element);

      part.setConnected(true);
      render(template(), container);

      simulatePointerDown(element);
      expect(start.calledOnce).is.true;
      simulateLostPointerCapture(element);
    });

    it('drags with the default options when it gets none', async () => {
      const container = document.createElement('div');
      section.append(container);
      render(html`<div id="no-options" ${draggable()}></div>`, container);

      const element = container.querySelector<HTMLElement>('#no-options')!;
      simulatePointerDown(element);

      expect(getGhost()).is.not.null;
      simulateLostPointerCapture(element);
      expect(getGhost()).is.null;
    });

    it('falls back to the element when the `target` option resolves to nothing', async () => {
      const start = spy();
      renderDraggable({ target: () => null, start });

      simulatePointerDown(instance);
      expect(start.calledOnce).is.true;
      expect(getCallbackArgs(start).state.initial).to.eql(
        instance.getBoundingClientRect()
      );
    });

    it('keeps a finite ghost transform in a layer without layout', async () => {
      const layer = document.createElement('div');
      layer.style.display = 'none';
      section.append(layer);
      renderDraggable({ layer: () => layer });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX: 300, clientY: 300 });

      const transform = getGhost()!.style.transform;
      expect(transform).to.match(/^translate3d\(/);
      expect(transform).to.not.match(/Infinity|NaN|scale/);
      simulateLostPointerCapture(instance);
    });

    it('releases a held pointer capture when an operation is cancelled', async () => {
      const cancel = spy();
      renderDraggable({ cancel });

      const { x, y } = getCenterPoint(instance);

      try {
        await sendMouse({
          type: 'move',
          position: [Math.round(x), Math.round(y)],
        });
        await sendMouse({ type: 'down' });

        expect(instance.hasPointerCapture(1)).is.true;

        simulateKeyboard(instance, escapeKey);

        expect(cancel.calledOnce).is.true;
        expect(instance.hasPointerCapture(1)).is.false;
      } finally {
        await resetMouse();
      }
    });
  });
});
