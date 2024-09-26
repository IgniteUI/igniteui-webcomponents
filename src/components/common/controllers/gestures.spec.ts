import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, css } from 'lit';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import {
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../utils.spec.js';
import { type SwipeEvent, addGesturesController } from './gestures.js';

describe('Gestures controller', () => {
  let clock: SinonFakeTimers;
  let tag: string;
  let instance: LitElement & {
    gestures: ReturnType<typeof addGesturesController>;
    events: SwipeEvent[];
  };

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: flex;
            width: 600px;
            height: 600px;
          }
        `;

        public gestures: ReturnType<typeof addGesturesController>;
        public events: SwipeEvent[] = [];

        constructor() {
          super();

          this.gestures = addGesturesController(this);
          this.gestures.set('swipe', (event) => this.events.push(event));
        }

        protected override render() {
          return html``;
        }
      }
    );
  });

  afterEach(() => {
    instance.events = [];
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = await fixture(html`<${tagName}></${tagName}`);
  });

  it('is initialized', () => {
    expect(instance.gestures).to.exist;
  });

  describe('Options', () => {
    afterEach(() => clock.restore());

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['Date'] });
    });

    it('correct default options', () => {
      expect(instance.gestures.options).to.eql({
        thresholdDistance: 100,
        thresholdTime: 500,
        touchOnly: false,
      });
    });

    it('correctly takes `thresholdDistance` into account', () => {
      instance.gestures.updateOptions({ thresholdDistance: 200 });
      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { x: 150 });
      simulateLostPointerCapture(instance);

      expect(instance.events).lengthOf(0);

      instance.gestures.updateOptions({ thresholdDistance: 150 });
      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { x: 200 });
      simulateLostPointerCapture(instance);

      expect(instance.events).lengthOf(1);
    });

    it('correctly takes `thresholdTime` into account', () => {
      instance.gestures.updateOptions({ thresholdTime: 350 });
      simulatePointerDown(instance);
      clock.tick(500);
      simulatePointerMove(instance, {}, { x: 250 });
      simulateLostPointerCapture(instance);

      expect(instance.events).lengthOf(0);

      simulatePointerDown(instance);
      clock.tick(350);
      simulatePointerMove(instance, {}, { x: 250 });
      simulateLostPointerCapture(instance);

      expect(instance.events).lengthOf(1);
    });

    it('does not fire when `touchOnly` is set and a mouse based event is triggered', () => {
      instance.gestures.updateOptions({ touchOnly: true });
      simulatePointerDown(instance, { pointerType: 'mouse' });
      simulatePointerMove(instance, { pointerType: 'mouse' }, { x: 150 });
      simulateLostPointerCapture(instance, { pointerType: 'mouse' });

      expect(instance.events).lengthOf(0);
    });
  });

  describe('Event types', () => {
    let event: SwipeEvent;
    const options = { once: true } as AddEventListenerOptions;
    const times = 3;

    function handler(e: SwipeEvent) {
      event = e;
    }

    it('swipe-left', () => {
      const x = -100;

      instance.gestures.set('swipe-left', handler, options);
      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { x }, times);
      simulateLostPointerCapture(instance);

      expect(event).not.to.be.undefined;
      expect(event.data.direction).equal('left');
      expect(event.data.xEnd).to.equal(x * times);
    });

    it('swipe-up', () => {
      const y = -100;

      instance.gestures.set('swipe-up', handler, options);
      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { y }, times);
      simulateLostPointerCapture(instance);

      expect(event).not.to.be.undefined;
      expect(event.data.direction).equal('up');
      expect(event.data.yEnd).to.equal(y * times);
    });

    it('swipe-right', () => {
      const x = 100;

      instance.gestures.set('swipe-right', handler, options);

      instance.gestures.set('swipe-right', handler, options);
      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { x }, times);
      simulateLostPointerCapture(instance);

      expect(event).not.to.be.undefined;
      expect(event.data.direction).equal('right');
      expect(event.data.xEnd).to.equal(x * times);
    });

    it('swipe-down', () => {
      const y = 100;
      instance.gestures.set('swipe-down', handler, options);

      simulatePointerDown(instance);
      simulatePointerMove(instance, {}, { y }, times);
      simulateLostPointerCapture(instance);

      expect(event).not.to.be.undefined;
      expect(event.data.direction).equal('down');
      expect(event.data.yEnd).to.equal(y * times);
    });
  });
});
