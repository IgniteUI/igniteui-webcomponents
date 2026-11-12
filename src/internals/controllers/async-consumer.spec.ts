import { ContextProvider, createContext } from '@lit/context';
import { defineCE, elementUpdated, expect, fixture } from '@open-wc/testing';
import { LitElement } from 'lit';
import sinon from 'sinon';
import { addAsyncContextConsumer } from './async-consumer.js';

const testContext = createContext<string>(Symbol('async-consumer-test'));

type Consumer = LitElement & { received: string[] };

function defineProvider(tag: string): void {
  customElements.define(
    tag,
    class extends LitElement {
      public provider = new ContextProvider(this, {
        context: testContext,
        initialValue: 'value',
      });
    }
  );
}

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

    defineProvider(providerTag);

    for (const each of consumers) {
      expect(each.received).to.eql(['value']);
    }

    // An earlier spec can add the shared listener first.
    expect(listen.withArgs('context-provider').callCount).to.be.at.most(1);
  });

  it('asks again only for the waiting consumers inside the provider', async () => {
    const providerTag = 'igc-async-consumer-test-scoped-provider';
    const container = await fixture<HTMLElement>(
      `<div><${providerTag}><${consumerTag}></${consumerTag}></${providerTag}><${consumerTag}></${consumerTag}></div>`
    );
    const [inside, outside] = container.querySelectorAll<Consumer>(consumerTag);
    await Promise.all([elementUpdated(inside), elementUpdated(outside)]);

    const requests = sinon.spy();
    outside.addEventListener('context-request', requests);

    defineProvider(providerTag);

    expect(inside.received).to.eql(['value']);
    expect(outside.received).to.be.empty;
    expect(requests.called).to.be.false;
  });

  it('answers a waiting consumer slotted into a provider in a closed shadow root', async () => {
    const providerTag = 'igc-async-consumer-test-closed-provider';
    const wrapperTag = defineCE(
      class extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({
            mode: 'closed',
          }).innerHTML = `<${providerTag}><slot></slot></${providerTag}>`;
        }
      }
    );
    const wrapper = await fixture<HTMLElement>(
      `<${wrapperTag}><${consumerTag}></${consumerTag}></${wrapperTag}>`
    );
    const consumer = wrapper.querySelector<Consumer>(consumerTag)!;
    await elementUpdated(consumer);

    defineProvider(providerTag);

    expect(consumer.received).to.eql(['value']);
  });
});
