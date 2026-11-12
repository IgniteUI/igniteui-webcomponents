import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { getElementByIdFromRoot } from '../utils/dom.js';
import {
  addIdRefResolver,
  type IdRefResolverController,
} from './id-resolver.js';

const ID = 'idref-target';

type HostInstance = LitElement & {
  resolver: IdRefResolverController;
  watched: string | null;
  received: (Element | null)[];
  capturedThis: unknown;
};

function createTarget(id = ID): HTMLDivElement {
  const element = document.createElement('div');
  element.id = id;
  return element;
}

describe('IdRefResolverController', () => {
  let tag: string;
  let instance: HostInstance;
  /** Elements that a test added to the document, removed after each test. */
  let added: Element[];

  function add<T extends Element>(element: T, parent: Node = document.body): T {
    parent.appendChild(element);
    added.push(element);
    return element;
  }

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public watched: string | null = ID;
        public received: (Element | null)[] = [];
        public capturedThis: unknown = null;

        public readonly resolver = addIdRefResolver(
          this,
          () => this.watched,
          function (this: LitElement, element: Element | null) {
            (this as unknown as HostInstance).received.push(element);
            (this as unknown as HostInstance).capturedThis = this;
            this.requestUpdate();
          }
        );
      }
    );
  });

  beforeEach(async () => {
    added = [];
    const tagName = unsafeStatic(tag);
    instance = await fixture<HostInstance>(html`<${tagName}></${tagName}>`);
  });

  afterEach(() => {
    instance.resolver.unobserve();
    // Some tests move the host out of the fixture.
    instance.remove();

    for (const element of added) {
      element.remove();
    }
  });

  describe('resolve(id)', () => {
    it('returns null when no element with that ID exists', () => {
      expect(getElementByIdFromRoot(instance, 'nonexistent')).to.be.null;
    });

    it('resolves an element present in the document by ID', () => {
      const target = add(createTarget());

      expect(getElementByIdFromRoot(instance, ID)).to.equal(target);
    });

    it('returns null after the element is removed', () => {
      const target = add(createTarget());

      expect(getElementByIdFromRoot(instance, ID)).to.not.be.null;

      target.remove();
      expect(getElementByIdFromRoot(instance, ID)).to.be.null;
    });
  });

  describe('observe() / unobserve()', () => {
    it('callback never fires when observe() was not called', async () => {
      add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.be.empty;
    });

    it('observe() reports the current element of the id', () => {
      const target = add(createTarget());
      instance.resolver.observe();

      expect(instance.received).to.eql([target]);
    });

    it('observe() is idempotent — calling it twice yields one callback per change', async () => {
      instance.resolver.observe();
      instance.resolver.observe();

      const target = add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);
    });

    it('observe() checks a new id while observing', () => {
      const other = add(createTarget('idref-other'));
      instance.resolver.observe();

      instance.watched = 'idref-other';
      instance.resolver.observe();

      expect(instance.received).to.eql([other]);
    });

    it('after unobserve(), callback stops firing', async () => {
      instance.resolver.observe();

      const target = add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);

      instance.resolver.unobserve();
      target.remove();
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);
    });

    it('unobserve() is safe when not observing', () => {
      expect(() => instance.resolver.unobserve()).to.not.throw();
    });
  });

  describe('DOM mutation detection', () => {
    beforeEach(() => instance.resolver.observe());

    it('reports an added element with the id', async () => {
      const target = add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);
    });

    it('reports null after the element with the id is removed', async () => {
      const target = add(createTarget());
      await elementUpdated(instance);

      target.remove();
      await elementUpdated(instance);

      expect(instance.received).to.eql([target, null]);
    });

    it('follows changes of the id attribute', async () => {
      const target = add(createTarget());
      await elementUpdated(instance);

      target.id = 'idref-renamed';
      await elementUpdated(instance);

      const other = add(createTarget('idref-other'));
      other.id = ID;
      await elementUpdated(instance);

      expect(instance.received).to.eql([target, null, other]);
    });

    it('reports a nested element with the id', async () => {
      const parent = document.createElement('div');
      const target = parent.appendChild(createTarget());

      add(parent);
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);
    });

    it('ignores changes that keep the element of the id', async () => {
      const target = add(createTarget());
      await elementUpdated(instance);

      const empty = document.createElement('span');
      empty.setAttribute('id', '');
      add(document.createElement('div')).append(
        document.createTextNode('text'),
        empty
      );
      add(createTarget('idref-other'));
      add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);
    });

    it('reports the next element with the id when the first leaves', async () => {
      const first = add(createTarget());
      const second = add(createTarget());
      await elementUpdated(instance);

      first.remove();
      await elementUpdated(instance);

      expect(instance.received).to.eql([first, second]);
    });
  });

  describe('host lifecycle', () => {
    afterEach(() => {
      if (!instance.isConnected) {
        document.body.appendChild(instance);
      }
    });

    it('observe() called before hostConnected reports on connect', async () => {
      const detached = document.createElement(tag) as HostInstance;
      const target = add(createTarget());
      detached.resolver.observe();

      expect(detached.received).to.be.empty;

      add(detached);
      await elementUpdated(detached);

      expect(detached.received).to.eql([target]);
    });

    it('callback is suspended while host is disconnected', async () => {
      instance.resolver.observe();
      instance.remove();

      add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.be.empty;
    });

    it('a reconnect reports a change made while disconnected, then observes again', async () => {
      instance.resolver.observe();
      instance.remove();

      const target = add(createTarget());
      await elementUpdated(instance);

      document.body.appendChild(instance);
      await elementUpdated(instance);

      expect(instance.received).to.eql([target]);

      target.remove();
      await elementUpdated(instance);

      expect(instance.received).to.eql([target, null]);
    });

    it('unobserve() during disconnect does not resume on reconnect', async () => {
      instance.resolver.observe();
      instance.remove();
      instance.resolver.unobserve();

      document.body.appendChild(instance);
      await elementUpdated(instance);

      add(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.be.empty;
    });
  });

  describe('callback context', () => {
    it('this inside callback is bound to the host element', async () => {
      instance.resolver.observe();

      add(createTarget());
      await elementUpdated(instance);

      expect(instance.capturedThis).to.equal(instance);
    });
  });

  describe('shared observation', () => {
    let second: HostInstance;

    beforeEach(async () => {
      const tagName = unsafeStatic(tag);
      second = await fixture<HostInstance>(html`<${tagName}></${tagName}>`);
    });

    afterEach(() => second.resolver.unobserve());

    it('two controllers both observing both receive callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();

      const target = add(createTarget());
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.received).to.eql([target]);
      expect(second.received).to.eql([target]);
    });

    it('one controller unobserving does not prevent the other from receiving callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();
      instance.resolver.unobserve();

      const target = add(createTarget());
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.received).to.be.empty;
      expect(second.received).to.eql([target]);
    });

    it('both controllers unobserving stops all callbacks', async () => {
      instance.resolver.observe();
      second.resolver.observe();
      instance.resolver.unobserve();
      second.resolver.unobserve();

      add(createTarget());
      await Promise.all([elementUpdated(instance), elementUpdated(second)]);

      expect(instance.received).to.be.empty;
      expect(second.received).to.be.empty;
    });
  });

  describe('Shadow DOM scoping', () => {
    let shadowRoot: ShadowRoot;
    let shadowInstance: HostInstance;

    beforeEach(() => {
      const shadowHost = add(document.createElement('div'));
      shadowRoot = shadowHost.attachShadow({ mode: 'open' });
      shadowInstance = shadowRoot.appendChild(
        document.createElement(tag) as HostInstance
      );
    });

    afterEach(() => shadowInstance.resolver.unobserve());

    it('detects additions within its own shadow root', async () => {
      shadowInstance.resolver.observe();

      const target = shadowRoot.appendChild(createTarget());
      await elementUpdated(shadowInstance);

      expect(shadowInstance.received).to.eql([target]);
    });

    it('detects removals within its own shadow root', async () => {
      const target = shadowRoot.appendChild(createTarget());
      shadowInstance.resolver.observe();

      target.remove();
      await elementUpdated(shadowInstance);

      expect(shadowInstance.received).to.eql([target, null]);
    });

    it('detects id attribute changes within its own shadow root', async () => {
      const target = shadowRoot.appendChild(createTarget('idref-other'));
      shadowInstance.resolver.observe();

      target.id = ID;
      await elementUpdated(shadowInstance);

      expect(shadowInstance.received).to.eql([target]);
    });

    it('does NOT react to changes in the document when scoped to a shadow root', async () => {
      shadowInstance.resolver.observe();

      add(createTarget());
      await elementUpdated(shadowInstance);

      expect(shadowInstance.received).to.be.empty;
    });

    it('does NOT react to changes in a different shadow root', async () => {
      shadowInstance.resolver.observe();

      const other = add(document.createElement('div'));
      other.attachShadow({ mode: 'open' }).appendChild(createTarget());
      await elementUpdated(shadowInstance);

      expect(shadowInstance.received).to.be.empty;
    });

    it('resolves elements scoped to its own shadow root', () => {
      const target = shadowRoot.appendChild(createTarget());

      expect(getElementByIdFromRoot(shadowInstance, ID)).to.equal(target);
    });

    it('does NOT resolve elements from the document root', () => {
      add(createTarget());

      expect(getElementByIdFromRoot(shadowInstance, ID)).to.be.null;
    });

    it('document-scoped controller does NOT react to shadow root changes', async () => {
      instance.resolver.observe();

      shadowRoot.appendChild(createTarget());
      await elementUpdated(instance);

      expect(instance.received).to.be.empty;
    });
  });
});
