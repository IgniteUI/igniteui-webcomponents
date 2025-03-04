import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, css } from 'lit';
import { spy } from 'sinon';
import {
  compareStyles,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../utils.spec.js';
import { addDragController } from './drag.js';
import { escapeKey } from './key-bindings.js';

describe('Drag controller', () => {
  type DragElement = LitElement & {
    controller: ReturnType<typeof addDragController>;
  };

  let tag: string;
  let instance: DragElement;

  before(() => {
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
    const dragStart = spy();

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
      dragStart.resetHistory();
    });

    it('should not start drag operation when disabled', async () => {
      instance.controller.set({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = spy(() => true);
      instance.controller.set({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip.called).is.true;
      expect(dragStart.called).is.false;
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

    it('should not create a ghost element in "immediate" mode', async () => {
      const ghost = spy();
      instance.controller.set({ start: dragStart, ghost });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(ghost.called).is.false;
    });

    it('should not invoke the `layer` configuration callback in "immediate" mode', async () => {
      const layer = spy();
      instance.controller.set({ start: dragStart, layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(layer.called).is.false;
    });

    it('should invoke start callback on drag operation', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragStart.callCount).to.equal(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = spy();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(dragMove.called).is.false;
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = spy();
      instance.controller.set({ start: dragStart, move: dragMove });

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
      instance.controller.set({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart.callCount).to.equal(1);
      expect(dragEnd.callCount).to.equal(1);
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = spy();
      instance.controller.set({ start: dragStart, cancel: dragCancel });

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
      instance.controller.set({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.false;
    });
  });

  describe('Deferred mode - basic element dragging', () => {
    const dragStart = spy();

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
      dragStart.resetHistory();
    });

    it('should not start drag operation when disabled', async () => {
      instance.controller.set({ enabled: false, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation when a skip callback returns true', async () => {
      const skip = spy(() => true);
      instance.controller.set({ skip, start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(skip.called).is.true;
      expect(dragStart.called).is.false;
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

    it('should correctly place the ghost element in the configured layer container', async () => {
      const layer = spy(() => instance.parentElement!);
      instance.controller.set({ layer });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getDefaultGhost().parentElement).to.eql(instance.parentElement);
    });

    it('should invoke start callback on drag operation', async () => {
      instance.controller.set({ start: dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
      expect(dragStart.callCount).to.equal(1);
    });

    it('should not invoke move unless a start is invoked', async () => {
      const dragMove = spy();
      instance.controller.set({ start: dragStart, move: dragMove });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
      expect(dragMove.called).is.false;
    });

    it('should invoke move when moving the dragged element around the viewport', async () => {
      const dragMove = spy();
      instance.controller.set({ start: dragStart, move: dragMove });

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
      instance.controller.set({ start: dragStart, end: dragEnd });

      simulatePointerDown(instance);
      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(dragStart.callCount).to.equal(1);
      expect(dragEnd.callCount).to.equal(1);
      expect(getDefaultGhost()).is.null;
    });

    it('should invoke cancel when pressing Escape during a drag operation', async () => {
      const dragCancel = spy(() => instance.controller.dispose());
      instance.controller.set({ start: dragStart, cancel: dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.true;
      expect(getDefaultGhost()).is.null;
    });

    it('should not invoke cancel when pressing Escape outside of drag operation', async () => {
      // Sanity check since the Escape key handler is a root level dynamic listener.
      const dragCancel = spy();
      instance.controller.set({ cancel: dragCancel });

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.false;
    });
  });
});
