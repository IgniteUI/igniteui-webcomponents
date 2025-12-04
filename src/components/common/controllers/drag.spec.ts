import { css, LitElement } from 'lit';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {
  defineCE,
  elementUpdated,
  fixture,
  html,
  unsafeStatic,
} from '../helpers.spec.js';
import { getCenterPoint, last } from '../util.js';
import {
  compareStyles,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../utils.spec.js';
import { addDragController, type DragCallbackParameters } from './drag.js';
import { escapeKey } from './key-bindings.js';

describe('Drag controller', () => {
  type DragElement = LitElement & {
    controller: ReturnType<typeof addDragController>;
  };

  let tag: string;
  let instance: DragElement;

  beforeAll(() => {
    tag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: block;
            width: 200px;
            height: 200px;
          }
        `;

        public controller = addDragController(this);

        protected override render() {
          return html`<slot></slot>`;
        }
      }
    );
  });

  describe('Immediate mode - basic element dragging', () => {
    const dragStart = vi.fn();

    beforeEach(async () => {
      const tagName = unsafeStatic(tag);

      const template = html`
        <section style="width: 1000px; height: 1000px">
          <${tagName}></${tagName}>
        </section>
      `;

      const root = await fixture(template);

      instance = root.querySelector(tagName._$litStatic$)!;
      instance.controller.set({ mode: 'immediate' });
    });

    afterEach(() => {
      dragStart.mockClear();
    });

    it('should not start drag operation when disabled', async () => {
      instance.controller.set({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = vi.fn(() => true);
      instance.controller.set({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip).toHaveBeenCalled();
      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should apply correct internal styles on drag operation', async () => {
      instance.controller.set({ start: dragStart });
      const styles = { touchAction: 'none', userSelect: 'none' };

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(compareStyles(instance, styles)).is.true;
    });

    it('should not create a ghost element in "immediate" mode', async () => {
      const ghost = vi.fn();
      instance.controller.set({ start: dragStart, ghost });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(ghost).not.toHaveBeenCalled();
    });

    it('should not invoke the `layer` configuration callback in "immediate" mode', async () => {
      const layer = vi.fn();
      instance.controller.set({ start: dragStart, layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(layer).not.toHaveBeenCalled();
    });

    it('should invoke start callback on drag operation', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(dragStart).toHaveBeenCalledTimes(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = vi.fn();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
      expect(dragMove).not.toHaveBeenCalled();
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = vi.fn();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerDown(instance);
      simulatePointerMove(
        instance,
        { clientX: 200, clientY: 200 },
        { x: 10, y: 10 },
        10
      );
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(dragMove).toHaveBeenCalled();
      expect(dragMove).toHaveBeenCalledTimes(10);
    });

    it('should invoke end when releasing the dragged element', async () => {
      const dragEnd = vi.fn();
      instance.controller.set({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalledTimes(1);
      expect(dragEnd).toHaveBeenCalledTimes(1);
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = vi.fn();
      instance.controller.set({ start: dragStart, cancel: dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel).toHaveBeenCalled();
    });

    it('should not invoke cancel when pressing Escape outside of drag operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const dragCancel = vi.fn();
      instance.controller.set({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel).not.toHaveBeenCalled();
    });
  });

  describe('Immediate mode - advanced element dragging', () => {
    const dragStart = vi.fn();

    function getCallbackArgs(fn: MockInstance) {
      return last(last(fn.mock.calls)) as DragCallbackParameters;
    }

    beforeEach(async () => {
      const tagName = unsafeStatic(tag);

      const template = html`
        <section style="width: 1000px; height: 1000px">
          <${tagName}>
            <button class="no-trigger">No drag</button>
          </${tagName}>
          <div class="target" style="width: 400px; height: 400px"></div>
        </section>
      `;

      const root = await fixture(template);

      instance = root.querySelector(tagName._$litStatic$)!;
      instance.controller.set({ mode: 'immediate' });
    });

    afterEach(() => {
      dragStart.mockClear();
    });

    it('should not start a drag operation when `skip` is set and returns true', async () => {
      const button = instance.querySelector('button')!;
      const skip = vi.fn((event: PointerEvent) => event.target === button);

      instance.controller.set({ start: dragStart, skip });

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
      expect(skip).toHaveBeenCalled();
      expect(skip).toHaveReturnedWith(true);

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(skip).toHaveBeenCalled();
      expect(skip).toHaveReturnedWith(false);
    });

    it('should start a drag operation only from the element returned from the `trigger` invocation', async () => {
      const button = instance.querySelector('button')!;
      const trigger = vi.fn(() => button);

      instance.controller.set({ start: dragStart, trigger });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
    });

    it('should adhere to `snapToCursor` option on drag start', async () => {
      instance.controller.set({ start: dragStart });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      // snapToCursor = false

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      let args = getCallbackArgs(dragStart);

      /**
       * In this mode, the element is not shifted in order to position its topleft corner
       * under the cursor. In practice this means, that `position.x/position.y` will be zeroed
       * since `cursorCoordinate - element.edgeCoordinate + offsetFromEdgeCoordinate = 0`
       */

      expect(args.state.position).to.eql({
        x: clientX - x + args.state.offset.x,
        y: clientY - y + args.state.offset.y,
      }); // { x: 0, y: 0 }

      // snapToCursor = true

      instance.controller.dispose();
      instance.controller.set({ snapToCursor: true });

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      args = getCallbackArgs(dragStart);

      /**
       * In this mode the element, will shift by the amount of offset between the cursor click
       * and the element edges.
       */

      expect(args.state.position).to.eql({
        x: clientX - x,
        y: clientY - y,
      }); // { x: 100, y: 100 }
    });

    it('should pass correct parameter state in the move callback', async () => {
      const move = vi.fn();
      instance.controller.set({ start: dragStart, move });

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
      const end = vi.fn();
      instance.controller.set({ end });

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
      const matchTarget = vi.fn((element: Element) => target === element);
      const enter = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).toHaveBeenCalled();

      expect(getCallbackArgs(enter).state.element).to.eql(target);
    });

    it('should not invoke the `enter` callback when the `match` callback returns false', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn(() => false);
      const enter = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).not.toHaveBeenCalled();
    });

    it('should invoke the `leave` callback when leaving the boundaries of a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn((element: Element) => target === element);
      const enter = vi.fn();
      const leave = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter, leave });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).toHaveBeenCalled();

      expect(getCallbackArgs(enter).state.element).to.eql(target);

      simulatePointerMove(instance, { clientX: 0, clientY: 0 });
      await elementUpdated(instance);

      expect(leave).toHaveBeenCalled();
      expect(getCallbackArgs(leave).state.element).to.eql(target);
    });

    it('should invoke the `over` callback while dragging over a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn((element: Element) => target === element);
      const over = vi.fn();

      instance.controller.set({ matchTarget, over });

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      // Not called on initial drag enter
      expect(over).not.toHaveBeenCalled();

      // 5 pointer moves over the matched element
      simulatePointerMove(instance, { clientX, clientY }, { x: 5, y: 5 }, 5);
      await elementUpdated(instance);

      expect(over).toHaveBeenCalledTimes(5);
      expect(getCallbackArgs(over).state.element).to.eql(target);
    });
  });

  describe('Deferred mode - basic element dragging', () => {
    const dragStart = vi.fn();

    function createGhost() {
      const clone = instance.cloneNode() as HTMLElement;
      clone.setAttribute('data-deferred-drag-ghost', '');

      return clone;
    }

    function getDefaultGhost() {
      const [_, defaultGhost] = document.querySelectorAll('div');
      return defaultGhost ?? null;
    }

    function getCustomGhost() {
      return document.querySelector<HTMLElement>('[data-deferred-drag-ghost]')!;
    }

    beforeEach(async () => {
      const tagName = unsafeStatic(tag);

      const template = html`
        <section style="width: 1000px; height: 1000px">
          <${tagName}></${tagName}>
        </section>
      `;

      const root = await fixture(template);

      instance = root.querySelector(tagName._$litStatic$)!;
      instance.controller.set({ mode: 'deferred' });
    });

    afterEach(() => {
      dragStart.mockClear();
    });

    it('should not start drag operation when disabled', async () => {
      instance.controller.set({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = vi.fn(() => true);
      instance.controller.set({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip).toHaveBeenCalled();
      expect(dragStart).not.toHaveBeenCalled();
    });

    it('should apply correct internal styles on drag operation', async () => {
      instance.controller.set({ start: dragStart });
      const styles = { touchAction: 'none', userSelect: 'none' };

      simulatePointerDown(instance);
      await elementUpdated(instance);

      // Default internal styles are touch-action: none & user-select: none while in drag mode.
      expect(instance.attributeStyleMap.size).to.equal(2);
      expect(compareStyles(instance, styles)).is.true;

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(instance.attributeStyleMap.size).to.equal(0);
    });

    it('should create a default ghost element in "deferred" mode if no configuration is passed', async () => {
      simulatePointerDown(instance);
      await elementUpdated(instance);

      const defaultGhost = getDefaultGhost();

      expect(defaultGhost).to.exist;
      expect(defaultGhost.getBoundingClientRect()).to.eql(
        instance.getBoundingClientRect()
      );
    });

    it('should create a custom ghost element in "deferred" mode when a configuration is passed', async () => {
      instance.controller.set({ ghost: createGhost });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const customGhost = getCustomGhost();

      expect(customGhost).to.exist;
      expect(customGhost.localName).to.equal(instance.localName);
    });

    it('should correctly fallback to the host as a container if the layer callbacks return falsy', async () => {
      const layer = vi.fn((): HTMLElement => null as unknown as HTMLElement);
      instance.controller.set({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getDefaultGhost().parentElement).to.eql(instance);
    });

    it('should correctly place the ghost element in the configured layer container', async () => {
      const layer = vi.fn(() => instance.parentElement!);
      instance.controller.set({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getDefaultGhost().parentElement).to.eql(instance.parentElement);
    });

    it('should invoke start callback on drag operation', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(dragStart).toHaveBeenCalledTimes(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = vi.fn();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
      expect(dragMove).not.toHaveBeenCalled();
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = vi.fn();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerDown(instance);
      simulatePointerMove(
        instance,
        { clientX: 200, clientY: 200 },
        { x: 10, y: 10 },
        10
      );
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(dragMove).toHaveBeenCalled();
      expect(dragMove).toHaveBeenCalledTimes(10);
    });

    it('should invoke end when releasing the dragged element', async () => {
      const dragEnd = vi.fn();
      instance.controller.set({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalledTimes(1);
      expect(dragEnd).toHaveBeenCalledTimes(1);
      expect(getDefaultGhost()).is.null;
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = vi.fn(() => instance.controller.dispose());
      instance.controller.set({ start: dragStart, cancel: dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel).toHaveBeenCalled();
      expect(getDefaultGhost()).is.null;
    });

    it('should not invoke cancel when pressing Escape outside of drag operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const dragCancel = vi.fn();
      instance.controller.set({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel).not.toHaveBeenCalled();
    });
  });

  describe('Deferred mode - advanced element dragging', () => {
    const dragStart = vi.fn();

    function getCallbackArgs(fn: MockInstance) {
      return last(last(fn.mock.calls)) as DragCallbackParameters;
    }

    beforeEach(async () => {
      const tagName = unsafeStatic(tag);

      const template = html`
        <section style="width: 1000px; height: 1000px">
          <${tagName}>
            <button class="no-trigger">No drag</button>
          </${tagName}>
          <div class="target" style="width: 400px; height: 400px"></div>
        </section>
      `;

      const root = await fixture(template);

      instance = root.querySelector(tagName._$litStatic$)!;
      instance.controller.set({ mode: 'deferred' });
    });

    afterEach(() => {
      dragStart.mockClear();
    });

    it('should not start a drag operation when `skip` is set and returns true', async () => {
      const button = instance.querySelector('button')!;
      const skip = vi.fn((event: PointerEvent) => event.target === button);

      instance.controller.set({ start: dragStart, skip });

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();
      expect(skip).toHaveBeenCalled();
      expect(skip).toHaveReturnedWith(true);

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
      expect(skip).toHaveBeenCalled();
      expect(skip).toHaveReturnedWith(false);
    });

    it('should start a drag operation only from the element returned from the `trigger` invocation', async () => {
      const button = instance.querySelector('button')!;
      const trigger = vi.fn(() => button);

      instance.controller.set({ start: dragStart, trigger });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart).not.toHaveBeenCalled();

      simulatePointerDown(button);
      await elementUpdated(instance);

      expect(dragStart).toHaveBeenCalled();
    });

    it('should adhere to `snapToCursor` option on drag start', async () => {
      instance.controller.set({ start: dragStart });

      const { x: clientX, y: clientY } = getCenterPoint(instance);
      const { x, y } = instance.getBoundingClientRect();

      // snapToCursor = false

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      let args = getCallbackArgs(dragStart);

      /**
       * In this mode, the element is not shifted in order to position its topleft corner
       * under the cursor. In practice this means, that `position.x/position.y` will be zeroed
       * since `cursorCoordinate - element.edgeCoordinate + offsetFromEdgeCoordinate = 0`
       */

      expect(args.state.position).to.eql({
        x: clientX - x + args.state.offset.x,
        y: clientY - y + args.state.offset.y,
      }); // { x: 0, y: 0 }

      // snapToCursor = true

      instance.controller.dispose();
      instance.controller.set({ snapToCursor: true });

      simulatePointerDown(instance, { clientX, clientY });
      await elementUpdated(instance);

      args = getCallbackArgs(dragStart);

      /**
       * In this mode the element, will shift by the amount of offset between the cursor click
       * and the element edges.
       */

      expect(args.state.position).to.eql({
        x: clientX - x,
        y: clientY - y,
      }); // { x: 100, y: 100 }
    });

    it('should pass correct parameter state in the move callback', async () => {
      const move = vi.fn();
      instance.controller.set({ start: dragStart, move });

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
      const end = vi.fn();
      instance.controller.set({ end });

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
      const matchTarget = vi.fn((element: Element) => target === element);
      const enter = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).toHaveBeenCalled();

      expect(getCallbackArgs(enter).state.element).to.eql(target);
    });

    it('should not invoke the `enter` callback when the `match` callback returns false', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn(() => false);
      const enter = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).not.toHaveBeenCalled();
    });

    it('should invoke the `leave` callback when leaving the boundaries of a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn((element: Element) => target === element);
      const enter = vi.fn();
      const leave = vi.fn();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      instance.controller.set({ matchTarget, enter, leave });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      expect(matchTarget).toHaveBeenCalled();
      expect(enter).toHaveBeenCalled();

      expect(getCallbackArgs(enter).state.element).to.eql(target);

      simulatePointerMove(instance, { clientX: 0, clientY: 0 });
      await elementUpdated(instance);

      expect(leave).toHaveBeenCalled();
      expect(getCallbackArgs(leave).state.element).to.eql(target);
    });

    it('should invoke the `over` callback while dragging over a matched element', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = vi.fn((element: Element) => target === element);
      const over = vi.fn();

      instance.controller.set({ matchTarget, over });

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY });
      await elementUpdated(instance);

      // Not called on initial drag enter
      expect(over).not.toHaveBeenCalled();

      // 5 pointer moves over the matched element
      simulatePointerMove(instance, { clientX, clientY }, { x: 5, y: 5 }, 5);
      await elementUpdated(instance);

      expect(over).toHaveBeenCalledTimes(5);
      expect(getCallbackArgs(over).state.element).to.eql(target);
    });
  });
});
