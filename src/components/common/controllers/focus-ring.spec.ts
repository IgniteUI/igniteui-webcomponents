import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, css } from 'lit';
import { partNameMap } from '../util.js';
import {
  simulateClick,
  simulateKeyboard,
  simulatePointerDown,
} from '../utils.spec.js';
import { createFocusRing } from './focus-ring.js';
import { tabKey } from './key-bindings.js';

describe('Focus ring controller', () => {
  let tag: string;
  let instance: LitElement & { button: HTMLButtonElement };

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public static override styles = css`
          [part='focused'] {
            outline: 2px solid red;
          }
        `;

        public manager = createFocusRing(this);

        public get button() {
          return this.renderRoot.querySelector('button')!;
        }

        protected override render() {
          return html`<button
            part=${partNameMap({ focused: this.manager.focused })}
            @blur=${this.manager.reset}
            @pointerdown=${this.manager.reset}
          >
            Button
          </button>`;
        }
      }
    );
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = await fixture(html`<${tagName}></${tagName}`);
  });

  it('should apply keyboard focus styles on keyup', async () => {
    simulateKeyboard(instance.button, tabKey);
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.true;
  });

  it('should not apply keyboard focus styles on click', async () => {
    simulateClick(instance.button);
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.false;
  });

  it('should not apply keyboard focus styles on focus', async () => {
    instance.button.focus();
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.false;
  });

  it('it should remove keyboard focus styles on blur', async () => {
    simulateKeyboard(instance.button, tabKey);
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.true;

    instance.button.dispatchEvent(new Event('blur'));
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.false;
  });

  it('should remove keyboard focus styles on subsequent pointer events', async () => {
    simulateKeyboard(instance.button, tabKey);
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.true;

    simulatePointerDown(instance.button);
    await elementUpdated(instance);

    expect(hasKeyboardFocusStyles(instance.button)).to.be.false;
  });
});

function hasKeyboardFocusStyles(node: HTMLElement) {
  return (
    getComputedStyle(node).getPropertyValue('outline') ===
    'rgb(255, 0, 0) solid 2px'
  );
}
