import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
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

    // Cancel the operations that a spec leaves running. A synthetic pointer
    // capture never ends, and a running operation keeps its native input guard
    // on the document body, which the next operation would then restore.
    simulateKeyboard(document.body, escapeKey);

    // Remove ghost elements left behind by resize operations still active at test end.
    for (const ghost of document.querySelectorAll('[data-resize-ghost]')) {
      ghost.remove();
    }
  });

  describe('Basic element resizing', () => {
    beforeEach(async () => {
      await createFixture({});
    });

    it('should not start a resize operation when disabled', async () => {
      renderResizable({ enabled: false, start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
      expect(getGhost()).is.null;
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

    it('should remove the ghost element when `start` returns false', async () => {
      renderResizable({ start: () => false });

      simulatePointerDown(instance);
      await elementUpdated(instance);

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
    });

    it('should block touch scrolling and text selection while an operation runs', async () => {
      renderResizable({ target: () => target });
      target.style.touchAction = 'pan-y';

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(compareStyles(target, { touchAction: 'none', userSelect: 'none' }))
        .is.true;
      expect(compareStyles(document.body, { userSelect: 'none' })).is.true;

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      expect(target.style.touchAction).to.equal('pan-y');
      expect(target.style.userSelect).to.equal('');
      expect(document.body.style.userSelect).to.equal('');
    });

    it('should restore the target only when the last of two overlapping operations ends', async () => {
      const container = document.createElement('div');
      section.append(container);
      render(
        html`<div ${resizable({ target: () => target })}></div>
          <div ${resizable({ target: () => target })}></div>`,
        container
      );

      const [first, second] = container.querySelectorAll('div');
      // A second synthetic pointer cannot take a pointer capture.
      second.setPointerCapture = () => {};
      target.style.touchAction = 'pan-y';

      simulatePointerDown(first);
      simulatePointerDown(second, { pointerId: 2 });
      simulateLostPointerCapture(first);

      expect(target.style.touchAction).to.equal('none');

      simulateLostPointerCapture(second, { pointerId: 2 });

      expect(target.style.touchAction).to.equal('pan-y');
    });

    it('should cancel a touch and a native drag on its element while enabled', async () => {
      const cancels = (type: string) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        instance.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(cancels('touchstart')).to.be.true;
      expect(cancels('dragstart')).to.be.true;

      renderResizable({ enabled: false });

      expect(cancels('touchstart')).to.be.false;
      expect(cancels('dragstart')).to.be.false;
    });

    it('should create a default ghost element on the initial pointer interaction', async () => {
      renderResizable({ start: resizeStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;

      expect(ghost).to.exist;
      expect(resizeStart.calledOnce).is.true;
      expect(ghost.parentElement).to.equal(document.body);
      expect(ghost.getBoundingClientRect()).to.eql(
        instance.getBoundingClientRect()
      );

      // It stacks above the page and has no background.
      expect(
        compareStyles(ghost, {
          zIndex: '1000',
          backgroundColor: 'rgba(0, 0, 0, 0)',
        })
      ).is.true;
    });

    it('should create a custom ghost element when a `ghostFactory` is passed', async () => {
      renderResizable({
        ghostFactory: () => document.createElement('section'),
      });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(getGhost()!.localName).to.equal('section');
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

      expect(section.scrollTop).to.equal(100);
      expect(ghost.parentElement).to.equal(section);
      expect(ghost.style.position).to.equal('fixed');
      expect(ghost.getBoundingClientRect()).to.eql(
        instance.getBoundingClientRect()
      );
    });

    it('should place the ghost over the target in a transformed layer', async () => {
      showSectionPopover({ transform: 'translate(30px, 40px)' });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      const ghost = getGhost()!;

      expect(ghost.parentElement).to.equal(section);
      expect(ghost.getBoundingClientRect()).to.eql(
        instance.getBoundingClientRect()
      );
    });

    it('should size the ghost from the pointer in a scaled layer', async () => {
      showSectionPopover({ transform: 'scale(0.5)' });

      const { x, y, right, bottom } = instance.getBoundingClientRect();

      simulatePointerDown(instance, { clientX: right, clientY: bottom });
      simulatePointerMove(instance, {
        clientX: right + 40,
        clientY: bottom + 20,
      });
      await elementUpdated(instance);

      const ghost = getGhost()!;
      const ghostRect = ghost.getBoundingClientRect();

      expect(ghost.parentElement).to.equal(section);
      expect([
        ghostRect.x,
        ghostRect.y,
        ghostRect.right,
        ghostRect.bottom,
      ]).to.eql([x, y, right + 40, bottom + 20]);
    });

    it('should place the ghost over the target in a positioned body with a margin', async () => {
      Object.assign(document.body.style, {
        position: 'relative',
        margin: '40px',
      });

      try {
        simulatePointerDown(instance);
        await elementUpdated(instance);

        expect(getGhost()!.getBoundingClientRect()).to.eql(
          instance.getBoundingClientRect()
        );
      } finally {
        Object.assign(document.body.style, { position: '', margin: '' });
      }
    });

    it('should keep the ghost on the target when the page scrolls during the operation', async () => {
      renderResizable({});

      const initial = instance.getBoundingClientRect();
      const pointer = { clientX: initial.right + 100, clientY: initial.bottom };

      try {
        simulatePointerDown(instance);
        window.scrollTo(0, 80);
        simulatePointerMove(instance, pointer);
        await elementUpdated(instance);

        const scrollY = window.scrollY;
        const ghostRect = getGhost()!.getBoundingClientRect();
        const { x, y } = instance.getBoundingClientRect();

        expect(scrollY).to.equal(80);
        expect([ghostRect.x, ghostRect.y]).to.eql([x, y]);
        expect([ghostRect.right, ghostRect.bottom]).to.eql([
          pointer.clientX,
          pointer.clientY,
        ]);
      } finally {
        window.scrollTo(0, 0);
      }
    });

    it('should not invoke `resize` unless an operation is started', async () => {
      const resize = spy();
      renderResizable({ start: resizeStart, resize });

      simulatePointerMove(instance);
      await elementUpdated(instance);

      expect(resizeStart.called).is.false;
      expect(resize.called).is.false;
    });

    it('should invoke `resize` on pointer moves and size the ghost', async () => {
      const resize = spy();
      renderResizable({ resize });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      await elementUpdated(instance);

      for (let i = 1, delta = 10; i <= 5; i++) {
        simulatePointerMove(instance, {
          clientX: initial.right + delta * i,
          clientY: initial.bottom + delta * i,
        });
        await elementUpdated(instance);

        const rect = getGhost()!.getBoundingClientRect();
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

      const rect = getGhost()!.getBoundingClientRect();
      expect([rect.width, rect.height]).to.eql([250, initial.height]);
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

  describe('Advanced element resizing', () => {
    beforeEach(async () => {
      await createFixture({});
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

  describe('Right-to-left', () => {
    beforeEach(async () => {
      await createFixture({});
      section.dir = 'rtl';
    });

    it('measures the width from the inline-start edge', async () => {
      const resize = spy();
      renderResizable({ resize });

      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.left - 50,
        clientY: initial.bottom,
      });
      await elementUpdated(instance);

      expect(getCallbackParams(resize).state.deltaX).to.equal(50);

      simulateLostPointerCapture(instance);
      await elementUpdated(instance);

      const rect = instance.getBoundingClientRect();

      expect(rect.width).to.equal(initial.width + 50);
      expect(rect.right).to.equal(initial.right);
    });

    it('keeps the inline-start edge of the ghost in place', async () => {
      const initial = instance.getBoundingClientRect();

      simulatePointerDown(instance);
      simulatePointerMove(instance, {
        clientX: initial.left - 50,
        clientY: initial.bottom,
      });
      await elementUpdated(instance);

      const ghostRect = getGhost()!.getBoundingClientRect();

      expect(ghostRect.width).to.equal(initial.width + 50);
      expect(ghostRect.right).to.be.approximately(initial.right, 0.5);
    });
  });

  it('follows a CSS direction without a `dir` attribute', async () => {
    await createFixture({});
    section.style.direction = 'rtl';

    const resize = spy();
    renderResizable({ resize });

    const initial = instance.getBoundingClientRect();

    simulatePointerDown(instance);
    simulatePointerMove(instance, {
      clientX: initial.left - 50,
      clientY: initial.bottom,
    });
    await elementUpdated(instance);

    expect(getCallbackParams(resize).state.deltaX).to.equal(50);
  });

  describe('Interrupted operations', () => {
    beforeEach(async () => {
      await createFixture({});
    });

    it('cancels the operation on pointercancel', async () => {
      const cancel = spy();
      const end = spy();
      renderResizable({ cancel, end });

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
      renderResizable({ end, resize: move });

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
      renderResizable({ start });

      const errors = catchListenerErrors(() => simulatePointerDown(instance));

      expect(errors).to.have.length(1);
      expect((errors[0] as Error).message).to.equal('start');
      expect(getGhost()).is.null;

      simulatePointerDown(instance);
      expect(start.calledTwice).is.true;
    });

    it('cancels the operation when the element disconnects', async () => {
      const cancel = spy();
      renderResizable({ cancel });

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

    it('throws outside an element expression', () => {
      expect(() =>
        render(html`<div class=${resizable({})}></div>`, section)
      ).to.throw('The `resizable` directive can only be used on elements.');
    });

    it('starts operations after a reconnect with no new render', async () => {
      const start = spy();
      const container = document.createElement('div');
      section.append(container);

      const part = render(
        html`<div id="resize-host" ${resizable({ start })}></div>`,
        container,
        { isConnected: false }
      );
      const element = container.querySelector<HTMLElement>('#resize-host')!;

      part.setConnected(true);

      simulatePointerDown(element);
      expect(start.calledOnce).is.true;
      simulateLostPointerCapture(element);
    });

    it('starts operations only after a connected render', async () => {
      const start = spy();
      const template = () =>
        html`<div id="resize-host" ${resizable({ start })}></div>`;

      const container = document.createElement('div');
      section.append(container);

      const part = render(template(), container, { isConnected: false });
      const element = container.querySelector<HTMLElement>('#resize-host')!;

      simulatePointerDown(element);
      expect(start.called).is.false;

      part.setConnected(true);
      render(template(), container);

      simulatePointerDown(element);
      expect(start.calledOnce).is.true;
      simulateLostPointerCapture(element);
    });
  });
});
