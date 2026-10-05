import { defineCE, elementUpdated, expect, fixture } from '@open-wc/testing';
import { html, LitElement } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { Constructor } from './constructor.js';
import { EventEmitterMixin } from './event-emitter.js';
import { HostAriaMixin } from './host-aria.js';

const ARIA = ['aria-label', 'aria-labelledby', 'aria-describedby'];

class HostAriaTest extends HostAriaMixin(LitElement) {
  public static override properties = { size: { type: Number } };

  public size!: number;
  public changes: string[] = [];
  public renders = 0;

  protected override _handleHostAriaChange(name: string): void {
    this.changes.push(name);
    super._handleHostAriaChange(name);
  }

  protected override render() {
    this.renders++;
    return html``;
  }
}

describe('Host ARIA mixin', () => {
  let element: HostAriaTest;

  beforeEach(async () => {
    const tag = unsafeStatic(defineCE(class extends HostAriaTest {}));
    element = await fixture<HostAriaTest>(staticHtml`<${tag}></${tag}>`);
  });

  it('observes the attributes of the class and the host ARIA', () => {
    expect(HostAriaTest.observedAttributes).to.have.members(['size', ...ARIA]);
  });

  it('observes the host ARIA through another mixin', () => {
    const Emitter = EventEmitterMixin<object, Constructor<LitElement>>(
      HostAriaMixin(LitElement)
    );

    expect(
      (Emitter as unknown as typeof LitElement).observedAttributes
    ).to.have.members(ARIA);
  });

  it('calls the hook once for each change of the host ARIA', () => {
    for (const name of ARIA) {
      element.setAttribute(name, 'value');
    }
    element.removeAttribute('aria-label');

    expect(element.changes).to.eql([...ARIA, 'aria-label']);
  });

  it('does not call the hook for other attributes', () => {
    element.setAttribute('size', '3');
    element.setAttribute('title', 'Title');

    expect(element.changes).to.be.empty;
    expect(element.size).to.equal(3);
  });

  it('renders again after a change of the host ARIA', async () => {
    const renders = element.renders;

    element.setAttribute('aria-label', 'Name');
    await elementUpdated(element);

    expect(element.renders).to.equal(renders + 1);
  });
});
