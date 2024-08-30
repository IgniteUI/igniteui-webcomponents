import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { simulateKeyboard } from '../utils.spec.js';
import {
  addKeybindings,
  altKey,
  arrowUp,
  enterKey,
  shiftKey,
  spaceBar,
} from './key-bindings.js';

describe('Key bindings controller', () => {
  let tag: string;
  let instance: LitElement & {
    key: string;
    event: KeyboardEvent;
    input: HTMLInputElement;
  };

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public key?: string;
        public event?: KeyboardEvent;

        public get input() {
          return this.renderRoot.querySelector('input')!;
        }

        constructor() {
          super();
          addKeybindings(this, {
            skip: () => this.hidden,
          })
            .setActivateHandler(this.handleKeyboardEvent)
            .set('a', this.handleKeyboardEvent, { triggers: ['keydown'] })
            .set('s', this.handleKeyboardEvent, { triggers: ['keyup'] })
            .set('k', this.handleKeyboardEvent)
            .set('d', this.handleKeyboardEvent, {
              triggers: ['keydown', 'keyup'],
              preventDefault: true,
              stopPropagation: true,
            })
            .set([shiftKey, 'c'], this.handleKeyboardEvent)
            .set([shiftKey, altKey, arrowUp], this.handleKeyboardEvent);

          addKeybindings(this).set('x', this.handleKeyboardEvent);
        }

        private handleKeyboardEvent(event: KeyboardEvent) {
          this.key = event.key;
          this.event = event;
        }

        protected override render() {
          return html`<input />`;
        }
      }
    );
  });

  function dispatch(node: Element, type: 'keydown' | 'keyup', key: string) {
    node.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
  }

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = await fixture(html`<${tagName}></${tagName}>`);
  });

  describe('Triggers', () => {
    it('keydown - keydown event works', async () => {
      dispatch(instance, 'keydown', 'a');
      expect(instance.key).to.equal('a');
      expect(instance.event.type).to.equal('keydown');
    });

    it('keydown - keyup event is ignored', async () => {
      dispatch(instance, 'keyup', 'a');
      expect(instance.key).to.be.undefined;
      expect(instance.event).to.be.undefined;
    });

    it('keyup - keyup event works', async () => {
      dispatch(instance, 'keyup', 's');
      expect(instance.key).to.equal('s');
      expect(instance.event.type).to.equal('keyup');
    });

    it('keyup - keydown event is ignored', async () => {
      dispatch(instance, 'keydown', 's');
      expect(instance.key).to.be.undefined;
      expect(instance.event).to.be.undefined;
    });
  });

  it('should honor default skip condition', () => {
    simulateKeyboard(instance.input, 'x');
    expect(instance.key).to.be.undefined;
    expect(instance.event).to.be.undefined;
  });

  it('should honor skip condition', () => {
    instance.hidden = true;

    simulateKeyboard(instance, 'k');
    expect(instance.key).to.be.undefined;
    expect(instance.event).to.be.undefined;
  });

  it('event handler modifiers - prevent default', () => {
    dispatch(instance, 'keydown', 'd');
    expect(instance.event.type).to.equal('keydown');
    expect(instance.event.defaultPrevented).to.be.true;

    dispatch(instance, 'keyup', 'd');
    expect(instance.event.type).to.equal('keyup');
    expect(instance.event.defaultPrevented).to.be.true;
  });

  it('event handler modifiers - stop propagation', () => {
    let parentHandlerCalled = false;
    const handler = () => {
      parentHandlerCalled = true;
    };
    const container = instance.parentElement!;
    container.addEventListener('keydown', handler, { once: true });
    container.addEventListener('keyup', handler, { once: true });

    simulateKeyboard(instance, 'd');
    expect(parentHandlerCalled).to.be.false;
    expect(instance.key).to.equal('d');
  });

  it('activation keys', () => {
    for (const key of [enterKey, spaceBar]) {
      simulateKeyboard(instance, key);
      expect(instance.key).to.equal(key.toLowerCase());
    }
  });

  it('combinations', () => {
    simulateKeyboard(instance, shiftKey);
    expect(instance.key).to.be.undefined;

    simulateKeyboard(instance, 'c');
    expect(instance.key).to.be.undefined;

    simulateKeyboard(instance, [shiftKey, 'c']);
    expect(instance.key).to.equal('c');

    simulateKeyboard(instance, [shiftKey, altKey, arrowUp]);
    expect(instance.key).to.equal(arrowUp.toLowerCase());
  });
});
