import {
  aTimeout,
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { addHiddenUntilFoundController } from './hidden-until-found.js';

describe('Hidden until found controller', () => {
  /** The order of the reveals of all hosts in a test. */
  let order: string[];

  class TestHost extends LitElement {
    public static override styles = [componentBase];

    @property({ type: Boolean, reflect: true })
    public open = false;

    @property({ type: Boolean })
    public findable = true;

    /** Refuses the open, as a handler that cancels the opening event. */
    public refuse = false;

    /** `revealing` at each call of `reveal`. */
    public readonly reveals: boolean[] = [];

    public readonly untilFound = addHiddenUntilFoundController(this, {
      reveal: () => {
        this.reveals.push(this.untilFound.revealing);
        order.push(this.id);

        if (!this.refuse) {
          this.open = true;
        }

        return this.open;
      },
    });

    public get content(): HTMLElement {
      return this.renderRoot.querySelector('[part="content"]')!;
    }

    protected override render() {
      return html`
        <div
          part="content"
          hidden=${this.untilFound.value(!this.open, this.findable)}
          @beforematch=${this.untilFound.handleBeforeMatch}
        >
          <slot></slot>
        </div>
      `;
    }
  }

  let tag: ReturnType<typeof unsafeStatic>;
  let targetCount = 0;

  before(() => {
    tag = unsafeStatic(defineCE(TestHost));
  });

  beforeEach(() => {
    order = [];
  });

  afterEach(async () => {
    history.replaceState(null, '', location.pathname + location.search);
    await resetMouse();
  });

  /** A fixture with a link to a new target id, and the content around it. */
  async function setup(
    content: (id: string) => TemplateResult
  ): Promise<{ root: HTMLElement; target: HTMLElement; link: HTMLElement }> {
    const id = `until-found-target-${++targetCount}`;
    const root = await fixture<HTMLElement>(html`
      <div>
        <a href="#${id}">Go</a>
        ${content(id)}
      </div>
    `);

    return {
      root,
      target: root.querySelector<HTMLElement>(`#${id}`)!,
      link: root.querySelector('a')!,
    };
  }

  /** A trusted click, which reveals with the timing of find-in-page. */
  async function follow(link: HTMLElement): Promise<void> {
    const { left, top, width, height } = link.getBoundingClientRect();
    await sendMouse({
      type: 'click',
      position: [Math.round(left + width / 2), Math.round(top + height / 2)],
    });
  }

  /** Waits for the end of the reveal, in the next task, and the render after it. */
  async function settle(...hosts: TestHost[]): Promise<void> {
    await aTimeout(0);
    await Promise.all(hosts.map((host) => elementUpdated(host)));
  }

  const hostOf = (root: HTMLElement, id = 'host') =>
    root.querySelector<TestHost>(`#${id}`)!;

  it('hides the content until found while it is closed', async () => {
    const { root } = await setup(
      (id) => html`<${tag} id="host"><p id=${id}>Match</p></${tag}>`
    );
    const host = hostOf(root);

    expect(host.content.getAttribute('hidden')).to.equal('until-found');
    // The base sheet keeps the box of `until-found`, so find-in-page can reach it.
    expect(getComputedStyle(host.content).display).to.not.equal('none');

    host.findable = false;
    await elementUpdated(host);

    expect(host.content.getAttribute('hidden')).to.equal('');
    expect(getComputedStyle(host.content).display).to.equal('none');

    host.open = true;
    await elementUpdated(host);

    expect(host.content.hasAttribute('hidden')).to.be.false;
  });

  it('opens the host when a link targets its content', async () => {
    const { root, target, link } = await setup(
      (id) => html`<${tag} id="host"><p id=${id}>Match</p></${tag}>`
    );
    const host = hostOf(root);

    await follow(link);

    expect(host.open).to.be.true;
    expect(host.reveals).to.eql([true]);
    expect(host.content.hasAttribute('hidden')).to.be.false;

    await settle(host);

    expect(host.untilFound.revealing).to.be.false;
    expect(host.content.hasAttribute('hidden')).to.be.false;
    expect(target.checkVisibility()).to.be.true;
  });

  it('opens nested hosts from the inside out', async () => {
    const { root, target, link } = await setup(
      (id) => html`
        <${tag} id="outer">
          <${tag} id="inner"><p id=${id}>Match</p></${tag}>
        </${tag}>
      `
    );
    const outer = hostOf(root, 'outer');
    const inner = hostOf(root, 'inner');

    await follow(link);
    await settle(outer, inner);

    expect(order).to.eql(['inner', 'outer']);
    expect(outer.open).to.be.true;
    expect(inner.open).to.be.true;
    expect(outer.content.hasAttribute('hidden')).to.be.false;
    expect(inner.content.hasAttribute('hidden')).to.be.false;
    expect(target.checkVisibility()).to.be.true;
  });

  it('keeps the content hidden when the host refuses to open', async () => {
    const { root, target, link } = await setup(
      (id) => html`<${tag} id="host"><p id=${id}>Match</p></${tag}>`
    );
    const host = hostOf(root);
    host.refuse = true;

    await follow(link);
    await settle(host);

    expect(host.reveals).to.eql([true]);
    expect(host.open).to.be.false;
    expect(host.content.getAttribute('hidden')).to.equal('until-found');
    expect(target.checkVisibility()).to.be.false;
  });

  it('does not reveal content that is not findable', async () => {
    const { root, target, link } = await setup(
      (id) =>
        html`<${tag} id="host" .findable=${false}
          ><p id=${id}>Match</p></${tag}
        >`
    );
    const host = hostOf(root);

    await follow(link);
    await settle(host);

    expect(host.reveals).to.be.empty;
    expect(host.open).to.be.false;
    expect(host.content.getAttribute('hidden')).to.equal('');
    expect(target.checkVisibility()).to.be.false;
  });

  it('ignores the reveal of an element in the slotted content', async () => {
    const { root, target, link } = await setup(
      (id) => html`
        <${tag} id="host" open>
          <div hidden="until-found"><p id=${id}>Match</p></div>
        </${tag}>
      `
    );
    const host = hostOf(root);

    await follow(link);
    await settle(host);

    expect(host.reveals).to.be.empty;
    expect(target.checkVisibility()).to.be.true;
  });

  it('ends the reveal when the host disconnects', async () => {
    const { root } = await setup(
      (id) => html`<${tag} id="host"><p id=${id}>Match</p></${tag}>`
    );
    const host = hostOf(root);

    host.content.dispatchEvent(new Event('beforematch'));
    expect(host.untilFound.revealing).to.be.true;

    host.remove();
    expect(host.untilFound.revealing).to.be.false;
  });
});
