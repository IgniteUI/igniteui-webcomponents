import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
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

const twoInputsTag = unsafeStatic(
  defineCE(
    class extends LitElement {
      protected override render() {
        return html`<input /><input />`;
      }
    }
  )
);

describe('Deferred focus', () => {
  let container: HTMLElement;

  function create(): DeferredFocusTest {
    const element = document.createElement(tagName) as DeferredFocusTest;
    container.append(element);
    return element;
  }

  beforeEach(async () => {
    container = await fixture<HTMLElement>(html`<div></div>`);
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
    const element = document.createElement(
      noRenderTagName
    ) as DeferredFocusTest;
    container.append(element);

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
