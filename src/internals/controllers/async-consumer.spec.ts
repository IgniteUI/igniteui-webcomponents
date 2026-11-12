import { ContextProvider, createContext } from '@lit/context';
import { defineCE, elementUpdated, expect, fixture } from '@open-wc/testing';
import { LitElement } from 'lit';
import sinon from 'sinon';
import { addAsyncContextConsumer } from './async-consumer.js';

const testContext = createContext<string>(Symbol('async-consumer-test'));

type Consumer = LitElement & { received: string[] };

describe('Async context consumer', () => {
  const consumerTag = defineCE(
    class extends LitElement {
      public received: string[] = [];

      constructor() {
        super();
        addAsyncContextConsumer(this, testContext, (value) =>
          this.received.push(value)
        );
      }
    }
  );

  afterEach(() => sinon.restore());

  it('answers the waiting consumers of a provider that the browser defines later', async () => {
    const providerTag = 'igc-async-consumer-test-provider';
    const consumer = `<${consumerTag}></${consumerTag}>`;
    const listen = sinon.spy(document, 'addEventListener');
    const container = await fixture<HTMLElement>(
      `<div><${providerTag}>${consumer.repeat(3)}</${providerTag}></div>`
    );
    const consumers = [...container.querySelectorAll<Consumer>(consumerTag)];
    await Promise.all(consumers.map(elementUpdated));

    customElements.define(
      providerTag,
      class extends LitElement {
        public provider = new ContextProvider(this, {
          context: testContext,
          initialValue: 'value',
        });
      }
    );

    for (const each of consumers) {
      expect(each.received).to.eql(['value']);
    }

    // An earlier spec can add the shared listener first.
    expect(listen.withArgs('context-provider').callCount).to.be.at.most(1);
  });
});
