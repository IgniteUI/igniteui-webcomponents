import { LitElement } from 'lit';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  defineCE,
  elementUpdated,
  fixture,
  html,
  unsafeStatic,
} from '../helpers.spec.js';
import { first, last } from '../util.js';
import {
  addSlotController,
  type SlotChangeCallbackParameters,
  type SlotController,
  setSlots,
} from './slot.js';

type TestSlotController = SlotController<'[default]' | 'start' | 'end'>;

describe('Slots controller', () => {
  let tag: string;
  let instance: LitElement & {
    slotController: TestSlotController;
    slotsCallbackResults: SlotChangeCallbackParameters<
      '[default]' | 'start' | 'end'
    >[];
  };
  let slots: TestSlotController;

  beforeAll(() => {
    tag = defineCE(
      class extends LitElement {
        public readonly slotsCallbackResults: SlotChangeCallbackParameters<
          '[default]' | 'start' | 'end'
        >[] = [];

        public readonly slotController = addSlotController(this, {
          slots: setSlots('start', 'end'),
          onChange: (params) => this.slotsCallbackResults.push(params),
          initial: true,
        });

        protected override render() {
          return html`
            <slot name="start"></slot>
            <slot>Default node content</slot>
            <slot name="end">
              <span>Default element content</span>
            </slot>
          `;
        }
      }
    );
  });

  describe('Assigned nodes API', () => {
    beforeEach(async () => {
      const tagName = unsafeStatic(tag);
      instance = await fixture(html`<${tagName}></${tagName}`);
      slots = instance.slotController;
    });

    it('should return false for default assigned nodes with `flatten` = false', () => {
      expect(slots.hasAssignedNodes('[default]')).to.be.false;
    });

    it('should return true for default assigned nodes with `flatten` = true', () => {
      expect(slots.hasAssignedNodes('[default]', true)).to.be.true;
    });

    it('should return false for slots lacking default nodes with `flatten` = false', () => {
      expect(slots.hasAssignedNodes('start')).to.be.false;
    });

    it('should return false for slots lacking default nodes with `flatten` = true', () => {
      expect(slots.hasAssignedNodes('start', true)).to.be.false;
    });

    it('should return an empty array for default assigned nodes with `flatten` = false', () => {
      expect(slots.getAssignedNodes('[default]')).to.be.empty;
    });

    it('should return an array of one text node for default assigned nodes with `flatten` = true', () => {
      expect(slots.getAssignedNodes('[default]', true)).lengthOf(1);
    });

    it('should return an empty array for slots lacking default nodes with `flatten` = false', () => {
      expect(slots.getAssignedNodes('start')).to.be.empty;
    });

    it('should return an empty array for slots lacking default nodes with `flatten` = true', () => {
      expect(slots.getAssignedNodes('start')).to.be.empty;
    });

    it('correctly reflects nodes projected in the default slot', () => {
      const text = document.createTextNode('Slotted content');
      instance.append(text);

      expect(first(slots.getAssignedNodes('[default]')).textContent).to.equal(
        'Slotted content'
      );
    });
  });

  describe('Assigned elements API', () => {
    beforeEach(async () => {
      const tagName = unsafeStatic(tag);
      instance = await fixture(html`<${tagName}></${tagName}`);
      slots = instance.slotController;
    });

    it('should return false for default assigned elements with `flatten` = false', () => {
      expect(slots.hasAssignedElements('[default]')).to.be.false;
    });

    it('should return false for slots lacking default elements with `flatten` = true', () => {
      expect(slots.hasAssignedElements('[default]', { flatten: true })).to.be
        .false;
    });

    it('should return false for slots lacking default elements with `flatten` = false', () => {
      expect(slots.hasAssignedElements('end')).to.be.false;
    });

    it('should return true for slots with default elements with `flatten` = true', () => {
      expect(slots.hasAssignedElements('end', { flatten: true })).to.be.true;
    });

    it('should return an empty array for default assigned elements with `flatten` = false', () => {
      expect(slots.getAssignedElements('end')).to.be.empty;
    });

    it('should return an array of one element for default assigned elements with `flatten` = true', () => {
      expect(slots.getAssignedElements('end', { flatten: true })).lengthOf(1);
    });

    it('should correctly reflects element projected in a slot', () => {
      const elements = Array.from({ length: 5 }, () =>
        document.createElement('span')
      );
      instance.append(...elements);

      expect(slots.getAssignedElements('[default]')).lengthOf(5);
    });

    it('should correctly filter assigned elements based on a CSS selector', () => {
      const elements = Array.from({ length: 6 }, (_, i) => {
        const element = document.createElement('span');
        if (i % 2) {
          element.hidden = true;
        }

        return element;
      });
      instance.append(...elements);

      expect(
        slots.getAssignedElements('[default]', { selector: ':not([hidden])' })
      ).lengthOf(3);
    });
  });

  describe('Slot onChange callback', () => {
    beforeEach(async () => {
      const tagName = unsafeStatic(tag);
      instance = await fixture(html`<${tagName}></${tagName}`);
      slots = instance.slotController;
    });

    it('should have an initial callback state invoked on first update', () => {
      const state = first(instance.slotsCallbackResults);
      expect(state.isInitial).to.be.true;
      expect(state.isDefault).to.be.false;
      expect(state.slot).to.equal('<initial>');
    });

    it('should not invoke the onChange callback with initial state after the first update', async () => {
      instance.requestUpdate();
      await elementUpdated(instance);

      expect(instance.slotsCallbackResults).lengthOf(1);
    });

    it('should return the correct callback parameters for default slot changes', async () => {
      instance.append(document.createElement('span'));
      await elementUpdated(instance);

      const state = last(instance.slotsCallbackResults);
      expect(state.isDefault).to.be.true;
      expect(state.isInitial).to.be.false;
      expect(state.slot).to.be.empty;
    });

    it('should return the correct callback parameters for named slots', async () => {
      const element = document.createElement('span');
      element.slot = 'start';
      instance.append(element);

      await elementUpdated(instance);

      const state = last(instance.slotsCallbackResults);
      expect(state.isDefault).to.be.false;
      expect(state.isInitial).to.be.false;
      expect(state.slot).to.equal('start');
    });

    it('should correctly handle multiple slot change events', async () => {
      const startElement = document.createElement('span');
      startElement.slot = 'start';

      instance.append(
        document.createElement('span'),
        startElement,
        document.createElement('div')
      );
      await elementUpdated(instance);

      expect(slots.getAssignedElements('start')).lengthOf(1);
      expect(slots.getAssignedElements('[default]')).lengthOf(2);
      expect(instance.slotsCallbackResults).lengthOf(3);

      const [_, defaultSlot, startSlot] = instance.slotsCallbackResults;

      expect(defaultSlot.isDefault).to.be.true;
      expect(defaultSlot.slot).to.be.empty;

      expect(startSlot.isDefault).to.be.false;
      expect(startSlot.slot).to.equal('start');
    });
  });
});
