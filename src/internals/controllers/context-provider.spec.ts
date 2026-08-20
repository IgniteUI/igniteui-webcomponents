import { ContextConsumer, createContext } from '@lit/context';
import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import {
  addContextProvider,
  type ContextProviderController,
} from './context-provider.js';

type TestValue = { first: number; second: number };

const testContext = createContext<TestValue>(Symbol('test-context'));

interface ProviderTestElement extends LitElement {
  first: number;
  second: number;
  provider: ContextProviderController<typeof testContext, ProviderTestElement>;
}

interface ConsumerTestElement extends LitElement {
  received: TestValue[];
}

describe('Context provider controller', () => {
  let providerTag: string;
  let consumerTag: string;
  let provider: ProviderTestElement;
  let consumer: ConsumerTestElement;

  before(() => {
    providerTag = defineCE(
      class extends LitElement {
        public static override properties = {
          first: { type: Number },
          second: { type: Number },
        };

        declare public first: number;
        declare public second: number;

        public readonly provider = addContextProvider(this, {
          context: testContext,
          watch: ['first'],
          value: () => ({ first: this.first, second: this.second }),
        });

        constructor() {
          super();
          this.first = 1;
          this.second = 2;
        }

        protected override render() {
          return html`<slot></slot>`;
        }
      }
    );

    consumerTag = defineCE(
      class extends LitElement {
        public received: TestValue[] = [];

        constructor() {
          super();

          new ContextConsumer(this, {
            context: testContext,
            subscribe: true,
            callback: (value) => this.received.push(value),
          });
        }
      }
    );
  });

  beforeEach(async () => {
    const provider_ = unsafeStatic(providerTag);
    const consumer_ = unsafeStatic(consumerTag);

    provider = await fixture(
      html`<${provider_}><${consumer_}></${consumer_}></${provider_}>`
    );
    consumer = provider.querySelector<ConsumerTestElement>(consumerTag)!;
  });

  it('should publish the value to subscribers on connect', () => {
    expect(consumer.received).to.eql([{ first: 1, second: 2 }]);
  });

  it('should republish when a watched property changes', async () => {
    provider.first = 10;
    await elementUpdated(provider);

    expect(consumer.received).to.eql([
      { first: 1, second: 2 },
      { first: 10, second: 2 },
    ]);
  });

  it('should not republish for changes of unwatched properties', async () => {
    provider.second = 20;
    await elementUpdated(provider);

    expect(consumer.received).to.eql([{ first: 1, second: 2 }]);
  });

  it('should republish on demand', () => {
    provider.second = 20;
    provider.provider.publish();

    expect(consumer.received).to.eql([
      { first: 1, second: 2 },
      { first: 1, second: 20 },
    ]);
  });

  it('should notify subscribers even when the value keeps its identity', async () => {
    const stable = { first: 0, second: 0 };
    const stableTag = defineCE(
      class extends LitElement {
        public static override properties = {
          first: { type: Number },
        };

        declare public first: number;

        public readonly provider = addContextProvider(this, {
          context: testContext,
          watch: ['first'],
          value: () => stable,
        });

        constructor() {
          super();
          this.first = 1;
        }

        protected override render() {
          return html`<slot></slot>`;
        }
      }
    );

    const stable_ = unsafeStatic(stableTag);
    const consumer_ = unsafeStatic(consumerTag);
    const host: ProviderTestElement = await fixture(
      html`<${stable_}><${consumer_}></${consumer_}></${stable_}>`
    );
    const child = host.querySelector<ConsumerTestElement>(consumerTag)!;

    host.first = 5;
    await elementUpdated(host);

    expect(child.received).to.have.lengthOf(2);
    expect(child.received[0]).to.equal(child.received[1]);
  });
});
