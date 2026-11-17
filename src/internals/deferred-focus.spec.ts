import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  fixtureSync,
  nextFrame,
} from '@open-wc/testing';
import { html, LitElement } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { spy } from 'sinon';
import { cancelDeferredFocus, deferFocus } from './deferred-focus.js';
import { runFocusBeforeRenderTests } from './testing/focus-before-render.spec.js';

class DeferredFocusTest extends LitElement {
  public disabled = false;

  public override focus(options?: FocusOptions): void {
    this.renderRoot?.querySelector('input')?.focus(options);
    deferFocus(this, options);
  }

  public override blur(): void {
    cancelDeferredFocus(this);
    this.renderRoot?.querySelector('input')?.blur();
  }

  protected override render() {
    return html`<input />`;
  }
}

const tagName = defineCE(DeferredFocusTest);
const tag = unsafeStatic(tagName);

const noRenderTagName = defineCE(
  class extends DeferredFocusTest {
    protected override shouldUpdate(): boolean {
      return false;
    }
  }
);

const lateTargetTagName = defineCE(
  class extends DeferredFocusTest {
    private _ready = false;

    protected override firstUpdated(): void {
      queueMicrotask(() => {
        this._ready = true;
        this.requestUpdate();
      });
    }

    protected override render() {
      return this._ready ? html`<input />` : html``;
    }
  }
);

const twoInputsTag = unsafeStatic(
  defineCE(
    class extends LitElement {
      protected override render() {
        return html`<input /><input />`;
      }
    }
  )
);

const nestedTag = unsafeStatic(
  defineCE(
    class extends LitElement {
      protected override render() {
        return staticHtml`<button></button><${twoInputsTag}></${twoInputsTag}>`;
      }
    }
  )
);

describe('Deferred focus', () => {
  let container: HTMLElement;

  function create(name = tagName): DeferredFocusTest {
    const element = document.createElement(name) as DeferredFocusTest;
    container.append(element);
    return element;
  }

  beforeEach(() => {
    container = fixtureSync<HTMLElement>(html`<div></div>`);
  });

  it('repeats the call with its options after the first update', async () => {
    const element = create();
    const options = { preventScroll: true };

    deferFocus(element, options);
    const focusSpy = spy(element, 'focus');
    await elementUpdated(element);

    expect(focusSpy).calledOnceWithExactly(options);
    expect(element.matches(':focus-within')).to.be.true;
  });

  // The browser applies `autofocus` once per document, so no other test here uses it.
  it('focuses the host before a native `autofocus` applies', async () => {
    const autofocused = document.createElement('input');
    autofocused.autofocus = true;
    container.append(autofocused);
    const element = create();

    element.focus();
    await elementUpdated(element);
    await nextFrame();
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.true;
    expect(document.activeElement).not.to.equal(autofocused);
  });

  it('keeps an earlier request when a host that is not connected calls it', async () => {
    const element = create();

    element.focus();
    deferFocus(document.createElement(tagName) as DeferredFocusTest);
    await elementUpdated(element);

    expect(element.matches(':focus-within')).to.be.true;
  });

  it('keeps an earlier request when a rendered host calls it', async () => {
    const rendered = await fixture<DeferredFocusTest>(
      staticHtml`<${tag}></${tag}>`
    );
    const element = create();

    element.focus();
    deferFocus(rendered);
    await elementUpdated(element);

    expect(element.matches(':focus-within')).to.be.true;
  });

  it('does not repeat the call for a host that has the focus', async () => {
    const element = create();
    element.tabIndex = 0;
    HTMLElement.prototype.focus.call(element);

    deferFocus(element);
    // A blur sends no `focusin`, so it does not cancel a stored request.
    HTMLElement.prototype.blur.call(element);
    await elementUpdated(element);

    expect(element.matches(':focus-within')).to.be.false;
  });

  it('does not repeat the call for a host that skips its render', async () => {
    const element = create(noRenderTagName);

    element.focus();
    const focusSpy = spy(element, 'focus');
    await elementUpdated(element);
    await nextFrame();

    expect(focusSpy).not.called;
    expect(element.hasUpdated).to.be.false;
  });

  it('replaces a request with a later request', async () => {
    const first = create();
    const second = create();

    first.focus();
    second.focus();
    await Promise.all([elementUpdated(first), elementUpdated(second)]);

    expect(first.matches(':focus-within')).to.be.false;
    expect(second.matches(':focus-within')).to.be.true;
  });

  // The `focusin` of such a change stops at the shadow root.
  it('does not repeat the call after a focus change inside one shadow root', async () => {
    const other = await fixture<LitElement>(
      staticHtml`<${twoInputsTag}></${twoInputsTag}>`
    );
    const [first, second] = other.renderRoot.querySelectorAll('input');
    first.focus();
    const element = create();

    element.focus();
    second.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
    expect(other.shadowRoot!.activeElement).to.equal(second);
  });

  it('does not repeat the call after the focus leaves and comes back inside one shadow root', async () => {
    const other = await fixture<LitElement>(
      staticHtml`<${twoInputsTag}></${twoInputsTag}>`
    );
    const [first, second] = other.renderRoot.querySelectorAll('input');
    first.focus();
    const element = create();

    element.focus();
    second.focus();
    first.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
    expect(other.shadowRoot!.activeElement).to.equal(first);
  });

  it('waits for an update after the first one that adds the element to focus', async () => {
    const element = create(lateTargetTagName);

    element.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.true;
  });

  it('cancels the request on a focus change in the document of the host', async () => {
    const frame = document.createElement('iframe');
    container.append(frame);
    const doc = frame.contentDocument!;
    const element = document.createElement(tagName) as DeferredFocusTest;
    const button = doc.createElement('button');
    doc.body.append(element, button);

    element.focus();
    button.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(doc.activeElement).to.equal(button);
  });

  // The frame parses this shadow root, so it belongs to the window of the frame,
  // and an `instanceof` check against this window fails for it.
  it('cancels the request on a focus change inside a shadow root of a frame', async () => {
    const frame = document.createElement('iframe');
    container.append(frame);
    const doc = frame.contentDocument!;
    doc.body.setHTMLUnsafe(
      '<div><template shadowrootmode="open"><input><input></template></div>'
    );
    const root = doc.body.firstElementChild!.shadowRoot!;
    const [first, second] = root.querySelectorAll('input');
    first.focus();
    const element = document.createElement(tagName) as DeferredFocusTest;
    doc.body.append(element);

    element.focus();
    second.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
    expect(root.activeElement).to.equal(second);
  });

  it('cancels the request of a host in a frame on a focus change in the page', async () => {
    const frame = document.createElement('iframe');
    const button = document.createElement('button');
    container.append(frame, button);
    const element = document.createElement(tagName) as DeferredFocusTest;
    frame.contentDocument!.body.append(element);

    element.focus();
    button.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(document.activeElement).to.equal(button);
  });

  // A move into a frame sends no `focusin` to the document of the page.
  it('cancels the request when the focus moves into a frame', async () => {
    const frame = document.createElement('iframe');
    container.append(frame);
    const doc = frame.contentDocument!;
    const input = doc.createElement('input');
    doc.body.append(input);
    const element = create();

    element.focus();
    input.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
    expect(doc.activeElement).to.equal(input);
  });

  // The `focusin` of such a move stops at the shadow root of the host.
  it('cancels the request when the focus moves into the shadow root of the focused host', async () => {
    const other = document.createElement('div');
    const button = document.createElement('button');
    other.tabIndex = 0;
    other.attachShadow({ mode: 'open' }).append(button);
    container.append(other);
    other.focus();
    const element = create();

    element.focus();
    button.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
    expect(other.shadowRoot!.activeElement).to.equal(button);
  });

  it('cancels the request when an element of an outer shadow root takes the focus and loses it', async () => {
    const outer = await fixture<LitElement>(
      staticHtml`<${nestedTag}></${nestedTag}>`
    );
    const button = outer.shadowRoot!.querySelector('button')!;
    const inner = outer.shadowRoot!.lastElementChild as LitElement;
    await inner.updateComplete;
    inner.shadowRoot!.querySelector('input')!.focus();
    const element = create();

    element.focus();
    button.focus();
    button.blur();
    await elementUpdated(element);
    await nextFrame();

    expect(element.matches(':focus-within')).to.be.false;
  });

  it('cancels the request of a host in a frame when the focus leaves and comes back in a shadow root of the page', async () => {
    const other = await fixture<LitElement>(
      staticHtml`<${twoInputsTag}></${twoInputsTag}>`
    );
    const [first, second] = other.renderRoot.querySelectorAll('input');
    first.focus();
    const frame = document.createElement('iframe');
    container.append(frame);
    const element = document.createElement(tagName) as DeferredFocusTest;
    frame.contentDocument!.body.append(element);

    element.focus();
    second.focus();
    first.focus();
    await elementUpdated(element);
    await nextFrame();

    expect(document.activeElement).to.equal(other);
    expect(other.shadowRoot!.activeElement).to.equal(first);
  });

  it('repeats the call after a `blur()` of the element that had the focus', async () => {
    const button = document.createElement('button');
    container.append(button);
    button.focus();
    const element = create();

    element.focus();
    button.blur();
    await elementUpdated(element);

    expect(element.matches(':focus-within')).to.be.true;
  });

  it('does not repeat the call after another element takes the focus and loses it', async () => {
    const button = document.createElement('button');
    container.append(button);
    const element = create();

    element.focus();
    button.focus();
    button.blur();
    await elementUpdated(element);

    expect(element.matches(':focus-within')).to.be.false;
  });

  it('keeps the request when another host cancels', async () => {
    const first = create();
    const second = create();

    first.focus();
    second.blur();
    await Promise.all([elementUpdated(first), elementUpdated(second)]);

    expect(first.matches(':focus-within')).to.be.true;
  });

  runFocusBeforeRenderTests(staticHtml`<${tag}></${tag}>`);
});
