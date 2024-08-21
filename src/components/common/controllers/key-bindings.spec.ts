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
  };

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public key?: string;
        public event?: KeyboardEvent;

        constructor() {
          super();
          addKeybindings(this, {
            skip: () => this.hidden,
          })
            .setActivateHandler(this.handleKeyboardEvent)
            .set('a', this.handleKeyboardEvent, { triggers: ['keydown'] })
            .set('s', this.handleKeyboardEvent, { triggers: ['keyup'] })
            .set('k', this.handleKeyboardEvent)
            .set('d', this.handleKeyboardEvent, { preventDefault: true })
            .set([shiftKey, 'c'], this.handleKeyboardEvent)
            .set([shiftKey, altKey, arrowUp], this.handleKeyboardEvent);
        }

        private handleKeyboardEvent(event: KeyboardEvent) {
          this.key = event.key;
          this.event = event;
        }

        protected override render() {
          return html``;
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

  it('should honor skip condition', async () => {
    instance.hidden = true;

    simulateKeyboard(instance, 'k');
    expect(instance.key).to.be.undefined;
    expect(instance.event).to.be.undefined;
  });

  it('event handler modifiers', async () => {
    dispatch(instance, 'keydown', 'd');
    expect(instance.event.defaultPrevented).to.be.true;
  });

  it('activation keys', async () => {
    for (const key of [enterKey, spaceBar]) {
      simulateKeyboard(instance, key);
      expect(instance.key).to.equal(key.toLowerCase());
    }
  });

  it('combinations', async () => {
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
