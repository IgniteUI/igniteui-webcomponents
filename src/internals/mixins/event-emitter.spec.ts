import { expect } from '@open-wc/testing';
import { LitElement } from 'lit';
import { EventEmitterMixin } from './event-emitter.js';

interface TestEventMap {
  igcTest: CustomEvent<void>;
}

class TestEmitter extends EventEmitterMixin<TestEventMap>(LitElement) {}
customElements.define('test-event-emitter', TestEmitter);

describe('EventEmitterMixin', () => {
  function emitted(init?: CustomEventInit): Event {
    const element = new TestEmitter();
    let event!: Event;

    element.addEventListener('igcTest', (e) => (event = e));
    element.emitEvent('igcTest', init);
    return event;
  }

  it('sends an event that bubbles and is composed by default', () => {
    const { bubbles, composed, cancelable } = emitted();

    expect({ bubbles, composed, cancelable }).to.eql({
      bubbles: true,
      composed: true,
      cancelable: false,
    });
  });

  it('does not compose an event that does not bubble', () => {
    expect(emitted({ bubbles: false }).composed).to.be.false;
    expect(emitted({ bubbles: false, composed: true }).composed).to.be.true;
  });
});
