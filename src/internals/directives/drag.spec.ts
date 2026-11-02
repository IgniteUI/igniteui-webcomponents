import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { render } from 'lit';
import { type SinonSpy, spy } from 'sinon';
import { startViewTransition } from '#animations/view-transition.js';
import { escapeKey } from '../controllers/key-bindings.js';
import {
  catchListenerErrors,
  compareStyles,
  withoutActiveViewTransition,
} from '../testing/helpers.spec.js';
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

  /**
   * Shows the fixture section as a popover, so that it is the top layer that
   * gets the ghost. The popover UA styles that move or pad it are reset.
   */
  function showSectionPopover(styles: Partial<CSSStyleDeclaration> = {}) {
    section.setAttribute('popover', 'manual');
    Object.assign(section.style, {
      inset: 'auto',
      margin: '0',
      padding: '0',
      border: 'none',
      overflow: 'visible',
      ...styles,
    });
    section.showPopover();
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

    // Cancel the operations that a spec leaves running. A synthetic pointer
    // capture never ends, and a running operation keeps its native input guard
    // on the document body, which the next operation would then restore.
    simulateKeyboard(document.body, escapeKey);

    // Remove ghost elements left behind by drag operations still active at test end.
    for (const ghost of document.querySelectorAll('[data-drag-ghost]')) {
      ghost.remove();
    }
  });

  describe('Basic element dragging', () => {
    function createGhost() {
      const clone = instance.cloneNode() as HTMLElement;
      clone.setAttribute('data-custom-drag-ghost', '');

      return clone;
    }

    function getCustomGhost() {
      return document.querySelector<HTMLElement>('[data-custom-drag-ghost]')!;
    }

    beforeEach(async () => {
      await createFixture({});
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

      // A drag sets `touch-action: none` and `user-select: none` on the target,
      // and `user-select: none` on the document body.
      expect(instance.attributeStyleMap.size).to.equal(2);
      expect(compareStyles(instance, styles)).is.true;
      expect(compareStyles(document.body, { userSelect: 'none' })).is.true;

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(instance.attributeStyleMap.size).to.equal(0);
      expect(document.body.style.userSelect).to.equal('');
    });

    it('should restore an inline `user-select` of the document body after a drag operation', async () => {
      document.body.style.userSelect = 'text';

      try {
        simulatePointerDown(instance);
        await elementUpdated(instance);

        expect(document.body.style.userSelect).to.equal('none');

        simulateLostPointerCapture(instance);
        await elementUpdated(instance);

        expect(document.body.style.userSelect).to.equal('text');
      } finally {
        document.body.style.userSelect = '';
      }
    });

    it('should restore the body only when the last of two overlapping operations ends', async () => {
      const container = document.createElement('div');
      section.append(container);
      render(
        html`<div style="width: 50px; height: 50px" ${draggable({})}></div>`,
        container
      );

      const other = container.firstElementChild as HTMLElement;
      // A second synthetic pointer cannot take a pointer capture.
      other.setPointerCapture = () => {};
      document.body.style.userSelect = 'text';

      try {
        simulatePointerDown(instance);
        simulatePointerDown(other, { pointerId: 2 });
        simulateLostPointerCapture(instance);

        expect(document.body.style.userSelect).to.equal('none');

        simulateLostPointerCapture(other, { pointerId: 2 });

        expect(document.body.style.userSelect).to.equal('text');
      } finally {
        document.body.style.userSelect = '';
      }
    });

    it('should restore an inline `!important` priority after a drag operation', async () => {
      document.body.style.setProperty('user-select', 'text', 'important');

      try {
        simulatePointerDown(instance);
        simulateLostPointerCapture(instance);

        expect(document.body.style.getPropertyValue('user-select')).to.equal(
          'text'
        );
        expect(document.body.style.getPropertyPriority('user-select')).to.equal(
          'important'
        );
      } finally {
        document.body.style.removeProperty('user-select');
      }
    });

    it('should cancel the operation when the pointer capture fails', async () => {
      const cancel = spy();
      renderDraggable({ cancel });
      instance.setPointerCapture = () => {
        throw new DOMException('No active pointer', 'NotFoundError');
      };

      const errors = catchListenerErrors(() => simulatePointerDown(instance));

      expect(errors).lengthOf(1);
      expect(cancel).calledOnce;
      expect(getGhost()).to.be.null;
      expect(document.body.style.userSelect).to.be.empty;
    });

    it('should end the operation when the `end` callback throws', async () => {
      renderDraggable({
        end: () => {
          throw new Error('end');
        },
      });

      simulatePointerDown(instance);
      const errors = catchListenerErrors(() =>
        simulateLostPointerCapture(instance)
      );

      expect(errors).lengthOf(1);
      expect(getGhost()).to.be.null;
      expect(document.body.style.userSelect).to.be.empty;

      simulatePointerDown(instance);
      expect(getGhost()).to.exist;
    });

    it('should create a default ghost element if no configuration is passed', async () => {
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

      // It stacks above the page and has no background.
      expect(
        compareStyles(defaultGhost, {
          zIndex: '1000',
          backgroundColor: 'rgba(0, 0, 0, 0)',
        })
      ).is.true;
    });

    it('should create a custom ghost element when a configuration is passed', async () => {
      renderDraggable({ ghostFactory: createGhost });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const customGhost = getCustomGhost();

      expect(customGhost).to.exist;
      expect(customGhost.localName).to.equal(instance.localName);
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
      showSectionPopover({
        border: '10px solid',
        height: '300px',
        overflow: 'auto',
      });
      section.scrollTop = 100;

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const ghostRect = ghost.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();

      expect(section.scrollTop).to.equal(100);
      expect(ghost.parentElement).to.equal(section);
      expect(ghost.style.position).to.equal('fixed');
      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should place the ghost over the target in a transformed layer', async () => {
      showSectionPopover({ transform: 'translate(30px, 40px)' });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const ghostRect = ghost.getBoundingClientRect();
      const { x, y } = instance.getBoundingClientRect();

      expect(ghost.parentElement).to.equal(section);
      expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
    });

    it('should keep the ghost under the pointer in a scaled layer', async () => {
      showSectionPopover({ transform: 'scale(0.5)' });

      const { x, y, width, height } = instance.getBoundingClientRect();

      simulatePointerDown(instance, { clientX: x, clientY: y });
      simulatePointerMove(instance, { clientX: x + 40, clientY: y + 20 });
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const ghostRect = ghost.getBoundingClientRect();

      expect(ghost.parentElement).to.equal(section);
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

  describe('Advanced element dragging', () => {
    beforeEach(async () => {
      await createFixture({});
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

    it('should not invoke the `over` callback when the `match` callback returns false', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = spy(() => false);
      const over = spy();

      const { x: clientX, y: clientY } = target.getBoundingClientRect();

      renderDraggable({ matchTarget, over });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX, clientY }, { x: 5, y: 5 }, 2);
      await elementUpdated(instance);

      expect(matchTarget.called).is.true;
      expect(over.called).is.false;
    });

    it('should record a match that the pointer moves to straight from another match', async () => {
      const target = document.querySelector<HTMLElement>('.target')!;
      const matchTarget = (element: Element) =>
        element === instance || element === target;
      const over = spy();

      renderDraggable({ matchTarget, over });

      const from = getCenterPoint(instance);
      const to = getCenterPoint(target);

      simulatePointerDown(instance, { clientX: from.x, clientY: from.y });
      simulatePointerMove(instance, { clientX: from.x, clientY: from.y });
      simulatePointerMove(instance, { clientX: from.x + 1, clientY: from.y });
      simulatePointerMove(instance, { clientX: to.x, clientY: to.y });
      await elementUpdated(instance);

      // The first move onto the second match only records it.
      expect(over.callCount).to.equal(1);
      expect(getCallbackArgs(over).state.element).to.equal(instance);

      simulatePointerMove(instance, { clientX: to.x + 1, clientY: to.y });
      await elementUpdated(instance);

      expect(over.callCount).to.equal(2);
      expect(getCallbackArgs(over).state.element).to.equal(target);
    });

    /** Starts a drag that matches the `.target` element, and moves into it twice. */
    function dragOverTarget(
      accepts: (element: Element) => boolean = () => true
    ) {
      const target = document.querySelector<HTMLElement>('.target')!;
      const over = spy();
      const { x, y } = getCenterPoint(target);

      renderDraggable({
        matchTarget: (element) => element === target && accepts(element),
        over,
      });
      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX: x, clientY: y }, { x: 1 }, 2);

      return { target, over, x, y };
    }

    it('should keep a match without a new hit test while the pointer stays inside it', async () => {
      const hitTest = spy(document, 'elementsFromPoint');

      try {
        const { target, over, x, y } = dragOverTarget();
        simulatePointerMove(instance, { clientX: x, clientY: y }, { x: 5 }, 2);
        await elementUpdated(instance);

        expect(hitTest.callCount).to.equal(1);
        expect(over.callCount).to.equal(3);
        expect(getCallbackArgs(over).state.element).to.equal(target);
      } finally {
        hitTest.restore();
      }
    });

    it('should end a match during a view transition, where the hit test finds no match', async () => {
      const { over, x, y } = dragOverTarget();
      expect(over.callCount).to.equal(1);

      const transition = document.startViewTransition(() => {});
      await transition.ready;
      simulatePointerMove(instance, { clientX: x + 5, clientY: y });
      await transition.finished;

      expect(over.callCount).to.equal(1);

      // The first move after the transition only records the match again.
      simulatePointerMove(instance, { clientX: x + 6, clientY: y });
      expect(over.callCount).to.equal(1);

      simulatePointerMove(instance, { clientX: x + 7, clientY: y });
      expect(over.callCount).to.equal(2);
    });

    it('should end a match during a view transition of the library in a browser without `activeViewTransition`', async () => {
      await withoutActiveViewTransition(async () => {
        const { over, x, y } = dragOverTarget();

        const transition = startViewTransition(() => {});
        await transition.ready;
        simulatePointerMove(instance, { clientX: x + 5, clientY: y });
        await transition.finished;

        expect(over.callCount).to.equal(1);
      });
    });

    it('should end a match that `matchTarget` no longer accepts', async () => {
      let accepts = true;
      const { over, x, y } = dragOverTarget(() => accepts);
      expect(over.callCount).to.equal(1);

      accepts = false;
      simulatePointerMove(instance, { clientX: x + 5, clientY: y });

      expect(over.callCount).to.equal(1);
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
      await createFixture({});
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
      renderDraggable({ end });

      const { right, bottom } = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      const transform = getGhost()!.style.transform;

      simulatePointerMove(instance, {
        pointerId: 2,
        clientX: right + 50,
        clientY: bottom + 50,
      });
      simulateLostPointerCapture(instance, { pointerId: 2 });
      await elementUpdated(instance);

      // The ghost does not follow the other pointer.
      expect(getGhost()!.style.transform).to.equal(transform);
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
      await createFixture({});
    });

    it('adds the non-passive touch listener only while enabled', async () => {
      const addListener = spy(EventTarget.prototype, 'addEventListener');
      const touchListeners = () =>
        addListener
          .getCalls()
          .filter(
            (call) =>
              call.thisValue === instance && call.args[0] === 'touchstart'
          );

      try {
        renderDraggable({ enabled: false });
        expect(touchListeners()).to.be.empty;

        renderDraggable({ enabled: true });
        expect(touchListeners()).lengthOf(1);
        expect(touchListeners()[0].args[2]).to.include({ passive: false });
      } finally {
        addListener.restore();
      }
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
      showSectionPopover({ display: 'none' });

      simulatePointerDown(instance);
      simulatePointerMove(instance, { clientX: 300, clientY: 300 });

      const ghost = getGhost()!;
      const transform = ghost.style.transform;

      expect(ghost.parentElement).to.equal(section);
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
