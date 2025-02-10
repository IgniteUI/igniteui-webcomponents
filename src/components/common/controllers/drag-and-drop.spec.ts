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
} from '../utils.spec.js';
import { addDragDropController } from './drag-and-drop.js';
import { escapeKey } from './key-bindings.js';

describe('Drag and drop controller', () => {
  type DragElement = LitElement & {
    controller: ReturnType<typeof addDragDropController>;
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

        public controller = addDragDropController(this);

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
      instance.controller.setConfig({ mode: 'immediate' });
    });

    afterEach(() => {
      dragStart.resetHistory();
    });

    it('should not start drag operation when disabled', async () => {
      instance.controller.setConfig({ enabled: false, dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should not start a drag operation on a non-primary button interaction', async () => {
      instance.controller.setConfig({ dragStart });

      simulatePointerDown(instance, { button: 1 });
      await elementUpdated(instance);

      expect(dragStart.called).is.false;
    });

    it('should invoke dragStart callback on drag operation', async () => {
      instance.controller.setConfig({ dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;
    });

    it('should apply correct internal styles on drag operation', async () => {
      instance.controller.setConfig({ dragStart });
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

    it('should not create ghost element in immediate mode', async () => {
      instance.controller.setConfig({ dragStart });

      simulatePointerDown(instance);
      await elementUpdated(instance);
    });

    it('should fire dragCancel when pressing Escape during a drag operation', async () => {
      const dragCancel = spy();
      instance.controller.setConfig({ dragStart, dragCancel });

      simulatePointerDown(instance);
      await elementUpdated(instance);

      expect(dragStart.called).is.true;

      simulateKeyboard(instance, escapeKey);
      await elementUpdated(instance);

      expect(dragCancel.called).is.true;
    });
  });
});
