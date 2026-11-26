import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement, nothing, type PropertyValues } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { firstOf, lastOf } from '../utils/arrays.js';
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

  before(() => {
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

      expect(firstOf(slots.getAssignedNodes('[default]')).textContent).to.equal(
        'Slotted content'
      );
    });

    it('should return the normalized text content of assigned nodes', () => {
      const text = document.createTextNode('  Slotted\n content  ');
      instance.append(text);

      expect(slots.getAssignedText('[default]')).to.equal('Slotted content');
    });

    it('should return an empty string for slots without assigned nodes', () => {
      expect(slots.getAssignedText('start')).to.equal('');
    });

    it('should include fallback content with `flatten` = true', () => {
      expect(slots.getAssignedText('[default]', true)).to.equal(
        'Default node content'
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
      beforeEach(async () => {
        const tagName = unsafeStatic(tag);
        instance = await fixture(html`<${tagName}></${tagName}`);
        slots = instance.slotController;
      });
    });

    it('should have an initial callback state invoked on first update', () => {
      const state = firstOf(instance.slotsCallbackResults);
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

      const state = lastOf(instance.slotsCallbackResults);
      expect(state.isDefault).to.be.true;
      expect(state.isInitial).to.be.false;
      expect(state.slot).to.be.empty;
    });

    it('should return the correct callback parameters for named slots', async () => {
      const element = document.createElement('span');
      element.slot = 'start';
      instance.append(element);

      await elementUpdated(instance);

      const state = lastOf(instance.slotsCallbackResults);
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

  describe('Without observed slots', () => {
    it('runs the onChange callback for every slot', async () => {
      const changes: string[] = [];
      const tagName = unsafeStatic(
        defineCE(
          class extends LitElement {
            public readonly slotController = addSlotController(this, {
              onChange: ({ slot }) => changes.push(slot),
            });

            protected override render() {
              return html`<slot name="start"></slot><slot></slot>`;
            }
          }
        )
      );

      const host = await fixture<LitElement>(html`<${tagName}></${tagName}>`);
      const element = document.createElement('span');
      element.slot = 'start';
      host.append(element, document.createElement('span'));
      await elementUpdated(host);

      expect(changes).to.have.members(['start', '']);
    });
  });

  describe('First render', () => {
    type FirstRenderSlots = SlotController<'[default]' | 'start' | 'end'>;
    type FirstRenderHost = LitElement & { slotController: FirstRenderSlots };
    type NodeLabel = string | null;
    type QuerySnapshot = {
      start: NodeLabel[];
      defaultNodes: NodeLabel[];
      defaultElements: NodeLabel[];
      end: NodeLabel[];
    };

    let firstRenderTag: string;
    let snapshots: QuerySnapshot[];

    function nodeLabels(nodes: Node[]): NodeLabel[] {
      return nodes.map((node) =>
        node.nodeType === Node.ELEMENT_NODE
          ? (node as Element).localName
          : node.textContent
      );
    }

    function snapshotQueries(slots: FirstRenderSlots): QuerySnapshot {
      return {
        start: nodeLabels(slots.getAssignedNodes('start')),
        defaultNodes: nodeLabels(slots.getAssignedNodes('[default]')),
        defaultElements: nodeLabels(slots.getAssignedElements('[default]')),
        end: nodeLabels(slots.getAssignedNodes('end', true)),
      };
    }

    before(() => {
      firstRenderTag = defineCE(
        class extends LitElement {
          public readonly slotController: FirstRenderSlots = addSlotController(
            this,
            { slots: setSlots('start', 'end') }
          );

          protected override render() {
            snapshots.push(snapshotQueries(this.slotController));
            return html`
              <slot name="start"></slot>
              <slot></slot>
              <slot name="end"></slot>
            `;
          }
        }
      );
    });

    beforeEach(() => {
      snapshots = [];
    });

    it('reports the host children that the slots get', async () => {
      const host = document.createElement(firstRenderTag) as FirstRenderHost;

      host.innerHTML = [
        '<span slot="start"></span>',
        '<b slot="start"></b>',
        'Text',
        '<i></i>',
        '<em slot=""></em>',
        '<u slot="other"></u>',
        '<!--comment-->',
        '<slot slot="end"></slot>',
      ].join('');
      await fixture(host);

      expect(firstOf(snapshots)).to.eql({
        start: ['span', 'b'],
        defaultNodes: ['Text', 'i', 'em'],
        defaultElements: ['i', 'em'],
        // A slot outside a shadow tree does not flatten.
        end: ['slot'],
      });
      expect(firstOf(snapshots)).to.eql(snapshotQueries(host.slotController));
    });

    it('flattens a slot of an outer shadow tree', async () => {
      const outerTag = unsafeStatic(
        defineCE(
          class extends LitElement {
            protected override render() {
              const inner = unsafeStatic(firstRenderTag);
              return html`<${inner}><slot slot="end"></slot></${inner}>`;
            }
          }
        )
      );

      const outer = await fixture<LitElement>(
        html`<${outerTag}><span></span></${outerTag}>`
      );
      const inner = outer.renderRoot.firstElementChild as FirstRenderHost;
      await elementUpdated(inner);

      expect(firstOf(snapshots).end).to.eql(['span']);
      expect(firstOf(snapshots).end).to.eql(
        snapshotQueries(inner.slotController).end
      );
    });

    it('reports an element adopted from an iframe', async () => {
      const iframe = await fixture<HTMLIFrameElement>(html`<iframe></iframe>`);
      const host = document.createElement(firstRenderTag) as FirstRenderHost;
      // The element keeps the prototypes of the iframe window.
      host.append(iframe.contentDocument!.createElement('b'));
      await fixture(host);

      expect(firstOf(snapshots).defaultElements).to.eql(['b']);
      expect(snapshotQueries(host.slotController).defaultElements).to.eql([
        'b',
      ]);
    });

    it('flattens a slot of an outer shadow tree, adopted from an iframe', async () => {
      const iframe = await fixture<HTMLIFrameElement>(html`<iframe></iframe>`);
      const forwarding = iframe.contentDocument!.createElement('slot');
      forwarding.slot = 'end';

      const inner = document.createElement(firstRenderTag) as FirstRenderHost;
      inner.append(forwarding);
      const outer = document.createElement('div');
      outer.attachShadow({ mode: 'open' }).append(inner);
      outer.innerHTML = '<span></span>';
      await fixture(outer);
      await elementUpdated(inner);

      expect(firstOf(snapshots).end).to.eql(['span']);
      expect(firstOf(snapshots).end).to.eql(
        snapshotQueries(inner.slotController).end
      );
    });

    it('does not flatten an SVG element named slot', async () => {
      const svgSlot = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'slot'
      );
      svgSlot.setAttribute('slot', 'end');

      const inner = document.createElement(firstRenderTag) as FirstRenderHost;
      inner.append(svgSlot);
      const outer = document.createElement('div');
      outer.attachShadow({ mode: 'open' }).append(inner);
      await fixture(outer);
      await elementUpdated(inner);

      expect(firstOf(snapshots).end).to.eql(['slot']);
      expect(firstOf(snapshots).end).to.eql(
        snapshotQueries(inner.slotController).end
      );
    });

    it('reports the host children with other nodes in the render root', async () => {
      const tagName = defineCE(
        class extends (customElements.get(
          firstRenderTag
        ) as typeof LitElement) {
          protected override createRenderRoot() {
            const root = super.createRenderRoot();
            root.append(document.createElement('style'));
            return root;
          }
        }
      );
      const host = document.createElement(tagName) as FirstRenderHost;
      host.innerHTML = '<span slot="start"></span>';
      await fixture(host);

      expect(firstOf(snapshots).start).to.eql(['span']);
    });

    it('reports no content to a query before the first update, such as from a setter', async () => {
      const host = document.createElement(firstRenderTag) as FirstRenderHost;
      host.innerHTML = '<span slot="start"></span>';

      // Before the connection and before the first update.
      expect(host.slotController.hasAssignedElements('start')).to.be.false;

      const container = await fixture<HTMLDivElement>(html`<div></div>`);
      container.append(host);
      expect(host.slotController.hasAssignedElements('start')).to.be.false;

      await elementUpdated(host);
      expect(host.slotController.hasAssignedElements('start')).to.be.true;

      // After the first update, a slot that is not rendered has no content.
      host.renderRoot.querySelector('slot[name="start"]')!.remove();
      expect(host.slotController.hasAssignedElements('start')).to.be.false;
    });

    it('reports no content after the commit of a template without the slot', async () => {
      const results: boolean[] = [];
      const tagName = unsafeStatic(
        defineCE(
          class extends LitElement {
            public readonly slotController = addSlotController(this, {
              slots: setSlots('start'),
            });

            protected override update(changed: PropertyValues): void {
              results.push(this.slotController.hasAssignedElements('start'));
              super.update(changed);
              results.push(this.slotController.hasAssignedElements('start'));
            }

            protected override render() {
              return nothing;
            }
          }
        )
      );

      await fixture(html`<${tagName}><span slot="start"></span></${tagName}>`);

      expect(results.slice(0, 2)).to.eql([true, false]);
    });

    it('reports no content after an update request during the commit', async () => {
      const results: boolean[] = [];
      const tagName = unsafeStatic(
        defineCE(
          class extends LitElement {
            public readonly slotController = addSlotController(this, {
              slots: setSlots('start'),
            });

            private readonly _onCommit = (): void => {
              this.requestUpdate();
              results.push(this.slotController.hasAssignedElements('start'));
            };

            protected override render() {
              return html`<div ${ref(this._onCommit)}></div>`;
            }
          }
        )
      );

      await fixture(html`<${tagName}><span slot="start"></span></${tagName}>`);

      expect(firstOf(results)).to.be.false;
    });

    it('reports no content with a manual slot assignment', async () => {
      const results: boolean[] = [];
      const tagName = unsafeStatic(
        defineCE(
          class extends LitElement {
            public static override shadowRootOptions: ShadowRootInit = {
              ...LitElement.shadowRootOptions,
              slotAssignment: 'manual',
            };

            public readonly slotController = addSlotController(this, {
              slots: setSlots('start'),
            });

            protected override render() {
              results.push(this.slotController.hasAssignedElements('start'));
              return html`<slot name="start"></slot>`;
            }
          }
        )
      );

      await fixture(html`<${tagName}><span slot="start"></span></${tagName}>`);

      expect(firstOf(results)).to.be.false;
    });

    it('reports no content to a pending update after a first render that throws', async () => {
      let fail = true;
      const tagName = defineCE(
        class extends LitElement {
          public readonly slotController = addSlotController(this, {
            slots: setSlots('start'),
          });

          // Keeps the error out of the update promise, which Lit rejects and
          // fires again on the next update.
          protected override performUpdate(): void {
            try {
              super.performUpdate();
            } catch {
              fail = false;
            }
          }

          protected override render() {
            if (fail) throw new Error('First render');
            return html`<slot name="start"></slot>`;
          }
        }
      );

      const host = document.createElement(tagName) as LitElement & {
        slotController: SlotController<'start'>;
      };
      host.innerHTML = '<span slot="start"></span>';

      const container = await fixture<HTMLDivElement>(html`<div></div>`);
      container.append(host);
      await host.updateComplete;
      expect(host.hasUpdated).to.be.false;

      host.requestUpdate();
      expect(host.slotController.hasAssignedElements('start')).to.be.false;

      await elementUpdated(host);
      expect(host.slotController.hasAssignedElements('start')).to.be.true;
    });
  });

  describe('Hydration', () => {
    let queryingTag: string;
    let plainTag: string;
    let renders: boolean[];
    let changes: boolean[];
    let container: HTMLDivElement;

    before(() => {
      queryingTag = defineCE(
        class extends LitElement {
          public readonly slotController: SlotController<
            '[default]' | 'start'
          > = addSlotController(this, {
            slots: setSlots('start'),
            onChange: () =>
              changes.push(this.slotController.hasAssignedElements('start')),
          });

          protected override render() {
            renders.push(this.slotController.hasAssignedElements('start'));
            return html`<slot name="start"></slot>`;
          }
        }
      );

      plainTag = defineCE(
        class extends LitElement {
          public readonly slotController = addSlotController(this, {
            slots: setSlots('start'),
          });

          protected override render() {
            renders.push(false);
            return html`<slot name="start"></slot>`;
          }
        }
      );
    });

    beforeEach(async () => {
      renders = [];
      changes = [];
      container = await fixture<HTMLDivElement>(html`<div></div>`);
    });

    /**
     * Parses a host with a declarative shadow root that has the server slot. Synchronous, so the caller acts before
     * the first update. Without the hydration support, Lit renders its own slot before the server one.
     */
    function parseDeclarative(tag: string, content = ''): LitElement {
      container.setHTMLUnsafe(
        `<${tag}><template shadowrootmode="open"><slot name="start"></slot></template>${content}</${tag}>`
      );
      return container.firstElementChild as LitElement;
    }

    async function settle(host: LitElement): Promise<void> {
      await host.updateComplete;
      await elementUpdated(host);
    }

    it('reports no slotted content while a declarative shadow root hydrates', async () => {
      const host = parseDeclarative(queryingTag, '<span slot="start"></span>');

      // The first render matches the server render, which has no slotted content.
      await host.updateComplete;
      expect(renders).to.eql([false]);

      await elementUpdated(host);
      expect(renders.slice(0, 2)).to.eql([false, true]);
    });

    it('runs the slotchange callbacks of the hydration after it', async () => {
      await settle(parseDeclarative(queryingTag, '<span slot="start"></span>'));

      expect(changes).not.to.be.empty;
      expect(changes).not.to.include(false);
    });

    it('renders again after the hydration only when it hid a slot from a query', async () => {
      await settle(parseDeclarative(plainTag));
      expect(renders).lengthOf(1);

      renders = [];
      await settle(parseDeclarative(queryingTag));
      expect(renders).lengthOf(2);
    });
  });
});
