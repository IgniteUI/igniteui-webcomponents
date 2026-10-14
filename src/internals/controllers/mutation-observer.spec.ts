import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import {
  createMutationController,
  type MutationControllerConfig,
  type MutationControllerParams,
} from './mutation-observer.js';

type ObservedHost = LitElement & {
  records: MutationControllerParams[];
  extra: HTMLElement;
};

/** Waits for the delivery of the pending mutation records. */
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('Mutation controller', () => {
  function defineHost(
    config: (host: ObservedHost) => Partial<MutationControllerConfig>
  ) {
    return unsafeStatic(
      defineCE(
        class extends LitElement {
          public readonly records: MutationControllerParams[] = [];
          public readonly extra = document.createElement('div');

          constructor() {
            super();
            createMutationController(this, {
              callback: (params) => this.records.push(params),
              config: { childList: true, attributes: true },
              ...config(this as unknown as ObservedHost),
            });
          }
        }
      )
    );
  }

  it('keeps the nodes that a predicate filter accepts', async () => {
    const tag = defineHost(() => ({
      filter: (node: Node) => node.nodeName === 'P',
    }));
    const host = await fixture<ObservedHost>(html`<${tag}></${tag}>`);

    host.append(document.createElement('p'), document.createElement('span'));
    host.setAttribute('data-state', 'on');
    await flush();

    const [{ changes }] = host.records;
    expect(changes.added.map(({ node }) => node.nodeName)).to.eql(['P']);
    expect(changes.attributes).to.be.empty;
  });

  it('keeps no node for an empty selector list', async () => {
    const tag = defineHost(() => ({ filter: [] }));
    const host = await fixture<ObservedHost>(html`<${tag}></${tag}>`);

    host.append(document.createElement('p'));
    host.setAttribute('data-state', 'on');
    await flush();

    const [{ changes }] = host.records;
    expect(changes.added).to.be.empty;
    expect(changes.attributes).to.be.empty;
  });

  it('observes the elements of a target function', async () => {
    const tag = defineHost((host) => ({ target: () => [host.extra] }));
    const host = await fixture<ObservedHost>(html`<${tag}></${tag}>`);

    host.append(document.createElement('p'));
    await flush();
    expect(host.records).to.be.empty;

    host.extra.append(document.createElement('p'));
    await flush();

    const [{ changes }] = host.records;
    expect(changes.added).to.have.lengthOf(1);
    expect(changes.added[0].target).to.equal(host.extra);
  });
});
