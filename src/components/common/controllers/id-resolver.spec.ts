import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { getElementByIdFromRoot } from '../util.js';
import {
  addIdRefResolver,
  type IdRefResolverController,
} from './id-resolver.js';

// Shared host definition (registered once)
type HostInstance = LitElement & {
  resolver: IdRefResolverController;
  receivedIds: Set<string> | null;
  callCount: number;
  capturedThis: unknown;
};

// Second host definition for multi-controller tests
type SecondHostInstance = LitElement & {
  resolver: IdRefResolverController;
  callCount: number;
};

describe('IdRefResolverController', () => {
  let tag: string;
  let instance: HostInstance;

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public receivedIds: Set<string> | null = null;
        public callCount = 0;
        public capturedThis: unknown = null;

        public readonly resolver = addIdRefResolver(
          this,
          function (this: LitElement, ids: Set<string>) {
            (this as unknown as HostInstance).receivedIds = new Set(ids);
            (this as unknown as HostInstance).callCount++;
            (this as unknown as HostInstance).capturedThis = this;
            this.requestUpdate();
          }
        );
      }
    );
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    instance = await fixture<HostInstance>(html`<${tagName}></${tagName}>`);
  });

  describe('resolve(id)', () => {
    let target: HTMLDivElement;

    afterEach(() => {
      target?.remove();
    });

    it('returns null when no element with that ID exists', () => {
      expect(getElementByIdFromRoot(instance, 'nonexistent')).to.be.null;
    });

    it('resolves an element present in the document by ID', () => {
      target = document.createElement('div');
      target.id = 'resolve-target';
      document.body.appendChild(target);

      expect(getElementByIdFromRoot(instance, 'resolve-target')).to.equal(
        target
      );
    });

    it('returns null after the element is removed', () => {
      target = document.createElement('div');
      target.id = 'removed-target';
      document.body.appendChild(target);

      expect(getElementByIdFromRoot(instance, 'removed-target')).to.not.be.null;

      target.remove();
      expect(getElementByIdFromRoot(instance, 'removed-target')).to.be.null;
    });
  });

  describe('observe() / unobserve()', () => {
    let added: HTMLDivElement;

    afterEach(() => {
      added?.remove();
      instance.resolver.unobserve();
    });

    it('callback never fires when observe() was not called', async () => {
      added = document.createElement('div');
      added.id = 'no-observe';
      document.body.appendChild(added);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);
    });

    it('observe() is idempotent — calling it twice yields one callback per mutation', async () => {
      instance.resolver.observe();
      instance.resolver.observe();

      added = document.createElement('div');
      added.id = 'idempotent';
      document.body.appendChild(added);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(1);
    });

    it('after unobserve(), callback stops firing', async () => {
      instance.resolver.observe();

      added = document.createElement('div');
      added.id = 'first-add';
      document.body.appendChild(added);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(1);

      instance.resolver.unobserve();

      const second = document.createElement('div');
      second.id = 'second-add';
      document.body.appendChild(second);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(1);

      second.remove();
    });

    it('unobserve() is safe when not observing', () => {
      expect(() => instance.resolver.unobserve()).to.not.throw();
    });
  });

  describe('DOM mutation detection', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      instance.resolver.observe();
    });

    afterEach(() => {
      container.remove();
      instance.resolver.unobserve();
    });

    it('adding element with an id fires callback with that ID', async () => {
      const el = document.createElement('div');
      el.id = 'added-foo';
      container.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.be.greaterThan(0);
      expect(instance.receivedIds!.has('added-foo')).to.be.true;
    });

    it('removing element with an id fires callback with that ID', async () => {
      const el = document.createElement('div');
      el.id = 'removed-bar';
      container.appendChild(el);
      await elementUpdated(instance);

      instance.callCount = 0;

      el.remove();
      await elementUpdated(instance);

      expect(instance.callCount).to.be.greaterThan(0);
      expect(instance.receivedIds!.has('removed-bar')).to.be.true;
    });

    it('changing an element id attribute fires for both old and new IDs', async () => {
      const el = document.createElement('div');
      el.id = 'old-id';
      container.appendChild(el);
      await elementUpdated(instance);

      instance.callCount = 0;

      el.id = 'new-id';
      await elementUpdated(instance);

      expect(instance.callCount).to.be.greaterThan(0);
      expect(instance.receivedIds!.has('old-id')).to.be.true;
      expect(instance.receivedIds!.has('new-id')).to.be.true;
    });

    it('adding a subtree with nested [id] descendants fires for all nested IDs', async () => {
      const parent = document.createElement('div');
      const childA = document.createElement('span');
      const childB = document.createElement('span');
      childA.id = 'nested-a';
      childB.id = 'nested-b';
      parent.appendChild(childA);
      parent.appendChild(childB);

      container.appendChild(parent);
      await elementUpdated(instance);

      expect(instance.receivedIds!.has('nested-a')).to.be.true;
      expect(instance.receivedIds!.has('nested-b')).to.be.true;
    });

    it('DOM mutations with no ID-bearing nodes do not fire callback', async () => {
      const el = document.createElement('div');
      container.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);
    });
  });

  describe('host lifecycle', () => {
    let el: HTMLDivElement;

    afterEach(() => {
      el?.remove();
      instance.resolver.unobserve();
      if (!instance.isConnected) {
        document.body.appendChild(instance);
      }
    });

    it('observe() called before hostConnected activates on connect', async () => {
      const detached = document.createElement(tag) as HostInstance;
      detached.resolver.observe();

      document.body.appendChild(detached);
      await elementUpdated(detached);

      el = document.createElement('div');
      el.id = 'before-connect';
      document.body.appendChild(el);
      await elementUpdated(detached);

      expect(detached.callCount).to.be.greaterThan(0);
      expect(detached.receivedIds!.has('before-connect')).to.be.true;

      detached.remove();
    });

    it('callback is suspended while host is disconnected', async () => {
      instance.resolver.observe();
      instance.remove();

      el = document.createElement('div');
      el.id = 'during-disconnect';
      document.body.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);
    });

    it('observation resumes after host is reconnected', async () => {
      instance.resolver.observe();
      instance.remove();

      el = document.createElement('div');
      el.id = 'during-disconnect';
      document.body.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);

      document.body.appendChild(instance);
      await elementUpdated(instance);

      const el2 = document.createElement('div');
      el2.id = 'after-reconnect';
      document.body.appendChild(el2);
      await elementUpdated(instance);

      expect(instance.callCount).to.be.greaterThan(0);
      expect(instance.receivedIds!.has('after-reconnect')).to.be.true;

      el2.remove();
    });

    it('unobserve() during disconnect does not resume on reconnect', async () => {
      instance.resolver.observe();
      instance.remove();
      instance.resolver.unobserve();

      document.body.appendChild(instance);
      await elementUpdated(instance);

      el = document.createElement('div');
      el.id = 'after-unobserve-reconnect';
      document.body.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);
    });
  });

  describe('callback context', () => {
    let el: HTMLDivElement;

    afterEach(() => {
      el?.remove();
      instance.resolver.unobserve();
    });

    it('this inside callback is bound to the host element', async () => {
      instance.resolver.observe();

      el = document.createElement('div');
      el.id = 'context-check';
      document.body.appendChild(el);
      await elementUpdated(instance);

      expect(instance.capturedThis).to.equal(instance);
    });
  });

  describe('reference counting', () => {
    let secondTag: string;
    let second: SecondHostInstance;
    let el: HTMLDivElement;

    before(() => {
      secondTag = defineCE(
        class extends LitElement {
          public callCount = 0;
          public readonly resolver = addIdRefResolver(
            this,
            function (this: LitElement) {
              (this as unknown as SecondHostInstance).callCount++;
              this.requestUpdate();
            }
          );
        }
      );
    });

    beforeEach(async () => {
      const tagName = unsafeStatic(secondTag);
      second = await fixture<SecondHostInstance>(
        html`<${tagName}></${tagName}>`
      );
    });

    afterEach(() => {
      el?.remove();
      instance.resolver.unobserve();
      second.resolver.unobserve();
    });

    it('two controllers both observing both receive callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();

      el = document.createElement('div');
      el.id = 'shared-both';
      document.body.appendChild(el);
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.callCount).to.be.greaterThan(0);
      expect(second.callCount).to.be.greaterThan(0);
    });

    it('one controller unobserving does not prevent the other from receiving callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();
      instance.resolver.unobserve();

      el = document.createElement('div');
      el.id = 'shared-one-unobserve';
      document.body.appendChild(el);
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.callCount).to.equal(0);
      expect(second.callCount).to.be.greaterThan(0);
    });

    it('both controllers unobserving stops all callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();
      instance.resolver.unobserve();
      second.resolver.unobserve();

      el = document.createElement('div');
      el.id = 'shared-both-unobserve';
      document.body.appendChild(el);
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.callCount).to.equal(0);
      expect(second.callCount).to.equal(0);
    });
  });

  // ─── Group 7: Shadow DOM scoping ──────────────────────────────────────────

  describe('Shadow DOM scoping', () => {
    let shadowTag: string;
    let shadowHost: HTMLElement;
    let shadowInstance: HostInstance;

    before(() => {
      shadowTag = defineCE(
        class extends LitElement {
          public receivedIds: Set<string> | null = null;
          public callCount = 0;
          public capturedThis: unknown = null;

          public readonly resolver = addIdRefResolver(
            this,
            function (this: LitElement, ids: Set<string>) {
              (this as unknown as HostInstance).receivedIds = new Set(ids);
              (this as unknown as HostInstance).callCount++;
              (this as unknown as HostInstance).capturedThis = this;
              this.requestUpdate();
            }
          );
        }
      );
    });

    beforeEach(() => {
      shadowHost = document.createElement('div');
      shadowHost.attachShadow({ mode: 'open' });
      document.body.appendChild(shadowHost);

      shadowInstance = document.createElement(shadowTag) as HostInstance;
      shadowHost.shadowRoot!.appendChild(shadowInstance);
    });

    afterEach(() => {
      shadowInstance.resolver.unobserve();
      shadowHost.remove();
    });

    it('detects ID additions within its own shadow root', async () => {
      shadowInstance.resolver.observe();
      await elementUpdated(shadowInstance);

      const el = document.createElement('div');
      el.id = 'shadow-target';
      shadowHost.shadowRoot!.appendChild(el);
      await elementUpdated(shadowInstance);

      expect(shadowInstance.callCount).to.be.greaterThan(0);
      expect(shadowInstance.receivedIds!.has('shadow-target')).to.be.true;
    });

    it('detects ID removals within its own shadow root', async () => {
      const el = document.createElement('div');
      el.id = 'shadow-remove';
      shadowHost.shadowRoot!.appendChild(el);

      shadowInstance.resolver.observe();
      await elementUpdated(shadowInstance);

      shadowInstance.callCount = 0;
      el.remove();
      await elementUpdated(shadowInstance);

      expect(shadowInstance.callCount).to.be.greaterThan(0);
      expect(shadowInstance.receivedIds!.has('shadow-remove')).to.be.true;
    });

    it('detects ID attribute changes within its own shadow root', async () => {
      const el = document.createElement('div');
      el.id = 'shadow-old';
      shadowHost.shadowRoot!.appendChild(el);

      shadowInstance.resolver.observe();
      await elementUpdated(shadowInstance);

      shadowInstance.callCount = 0;
      el.id = 'shadow-new';
      await elementUpdated(shadowInstance);

      expect(shadowInstance.callCount).to.be.greaterThan(0);
      expect(shadowInstance.receivedIds!.has('shadow-old')).to.be.true;
      expect(shadowInstance.receivedIds!.has('shadow-new')).to.be.true;
    });

    it('does NOT react to ID changes in the document when scoped to a shadow root', async () => {
      shadowInstance.resolver.observe();
      await elementUpdated(shadowInstance);

      const el = document.createElement('div');
      el.id = 'document-only';
      document.body.appendChild(el);
      await elementUpdated(shadowInstance);

      expect(shadowInstance.callCount).to.equal(0);
      el.remove();
    });

    it('does NOT react to ID changes in a different shadow root', async () => {
      shadowInstance.resolver.observe();
      await elementUpdated(shadowInstance);

      const otherHost = document.createElement('div');
      otherHost.attachShadow({ mode: 'open' });
      document.body.appendChild(otherHost);

      const el = document.createElement('div');
      el.id = 'other-shadow';
      otherHost.shadowRoot!.appendChild(el);
      await elementUpdated(shadowInstance);

      expect(shadowInstance.callCount).to.equal(0);
      otherHost.remove();
    });

    it('resolves elements scoped to its own shadow root', () => {
      const el = document.createElement('div');
      el.id = 'resolve-shadow';
      shadowHost.shadowRoot!.appendChild(el);

      expect(getElementByIdFromRoot(shadowInstance, 'resolve-shadow')).to.equal(
        el
      );
    });

    it('does NOT resolve elements from the document root', () => {
      const el = document.createElement('div');
      el.id = 'doc-element';
      document.body.appendChild(el);

      expect(getElementByIdFromRoot(shadowInstance, 'doc-element')).to.be.null;
      el.remove();
    });

    it('document-scoped controller does NOT react to shadow root changes', async () => {
      instance.resolver.observe();

      const el = document.createElement('div');
      el.id = 'inside-shadow-only';
      shadowHost.shadowRoot!.appendChild(el);
      await elementUpdated(instance);

      expect(instance.callCount).to.equal(0);
      instance.resolver.unobserve();
    });
  });
});
