import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { simulateKeyboard } from '../testing/simulate.spec.js';
import { addRovingFocusController } from './roving-focus.js';

type Item = { id: number; disabled?: boolean };

describe('Roving focus controller', () => {
  interface RovingTestElement extends LitElement {
    items: Item[];
    currentItem: Item | null;
    verticalEnabled: boolean;
    focused: Item[];
    activated: Item[];
  }

  let tag: string;
  let wrappingTag: string;
  let instance: RovingTestElement;

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public items: Item[] = [{ id: 0 }, { id: 1 }, { id: 2 }];
        public currentItem: Item | null = this.items[1];
        public verticalEnabled = false;
        public focused: Item[] = [];
        public activated: Item[] = [];

        constructor() {
          super();

          addRovingFocusController<Item & Element>(this, {
            items: () => this.items as unknown as (Item & Element)[],
            current: () => this.currentItem as (Item & Element) | null,
            vertical: () => this.verticalEnabled,
            focusItem: (item) => this.focused.push(item),
            activateItem: (item) => this.activated.push(item),
          });
        }
      }
    );

    wrappingTag = defineCE(
      class extends LitElement {
        public items: Item[] = [{ id: 0 }, { id: 1 }, { id: 2 }];
        public currentItem: Item | null = null;
        public verticalEnabled = false;
        public focused: Item[] = [];
        public activated: Item[] = [];

        constructor() {
          super();

          addRovingFocusController<Item & Element>(this, {
            items: () => this.items as unknown as (Item & Element)[],
            current: () => this.currentItem as (Item & Element) | null,
            focusItem: (item) => this.focused.push(item),
            missingCurrent: 'wrap',
          });
        }
      }
    );
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = await fixture(html`<${tagName}></${tagName}>`);
  });

  it('should move focus with horizontal arrows relative to the current item', () => {
    simulateKeyboard(instance, 'ArrowRight');
    expect(instance.focused).to.eql([{ id: 2 }]);

    simulateKeyboard(instance, 'ArrowLeft');
    expect(instance.focused).to.eql([{ id: 2 }, { id: 0 }]);
  });

  it('should wrap around the ends', () => {
    instance.currentItem = instance.items[2];
    simulateKeyboard(instance, 'ArrowRight');
    expect(instance.focused).to.eql([{ id: 0 }]);

    instance.currentItem = instance.items[0];
    simulateKeyboard(instance, 'ArrowLeft');
    expect(instance.focused).to.eql([{ id: 0 }, { id: 2 }]);
  });

  it('should flip horizontal arrows in RTL', () => {
    instance.dir = 'rtl';

    simulateKeyboard(instance, 'ArrowRight');
    expect(instance.focused).to.eql([{ id: 0 }]);
  });

  it('should gate vertical arrows on the axis predicate', () => {
    simulateKeyboard(instance, 'ArrowDown');
    expect(instance.focused).to.be.empty;

    instance.verticalEnabled = true;
    simulateKeyboard(instance, 'ArrowDown');
    expect(instance.focused).to.eql([{ id: 2 }]);

    simulateKeyboard(instance, 'ArrowUp');
    expect(instance.focused).to.eql([{ id: 2 }, { id: 0 }]);
  });

  it('should not flip vertical arrows in RTL', () => {
    instance.dir = 'rtl';
    instance.verticalEnabled = true;

    simulateKeyboard(instance, 'ArrowDown');
    expect(instance.focused).to.eql([{ id: 2 }]);
  });

  it('should jump to the first/last item on Home/End', () => {
    simulateKeyboard(instance, 'Home');
    simulateKeyboard(instance, 'End');
    expect(instance.focused).to.eql([{ id: 0 }, { id: 2 }]);
  });

  it('should do nothing without a current item', () => {
    instance.currentItem = null;

    simulateKeyboard(instance, 'ArrowRight');
    simulateKeyboard(instance, 'Enter');
    expect(instance.focused).to.be.empty;
    expect(instance.activated).to.be.empty;
  });

  it('should wrap in from the list edges without a current item when configured', async () => {
    const tagName = unsafeStatic(wrappingTag);
    const wrapping: RovingTestElement = await fixture(
      html`<${tagName}></${tagName}>`
    );

    simulateKeyboard(wrapping, 'ArrowRight');
    expect(wrapping.focused).to.eql([{ id: 0 }]);

    simulateKeyboard(wrapping, 'ArrowLeft');
    expect(wrapping.focused).to.eql([{ id: 0 }, { id: 2 }]);
  });

  it('should navigate from the start when the current item is not in the set', () => {
    instance.currentItem = { id: 42 };

    simulateKeyboard(instance, 'ArrowRight');
    expect(instance.focused).to.eql([{ id: 0 }]);
  });

  it('should activate the current item on Enter when it is part of the set', () => {
    simulateKeyboard(instance, 'Enter');
    expect(instance.activated).to.eql([{ id: 1 }]);

    instance.currentItem = { id: 42 };
    simulateKeyboard(instance, 'Enter');
    expect(instance.activated).to.eql([{ id: 1 }]);
  });

  it('should do nothing on empty item sets', () => {
    instance.items = [];

    simulateKeyboard(instance, 'ArrowRight');
    simulateKeyboard(instance, 'Home');
    expect(instance.focused).to.be.empty;
  });
});
