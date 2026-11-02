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
  public override focus(options?: FocusOptions): void {
    const input = this.renderRoot?.querySelector('input');

    if (input) {
      input.focus(options);
    } else {
      deferFocus(this, options);
    }
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

    expect(deferFocus(element, options)).to.be.true;
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

  it('does nothing for a host that is not connected', () => {
    const element = document.createElement(tagName) as DeferredFocusTest;
    expect(deferFocus(element)).to.be.false;
  });

  it('does nothing for a host that has rendered', async () => {
    const element = await fixture<DeferredFocusTest>(
      staticHtml`<${tag}></${tag}>`
    );

    expect(deferFocus(element)).to.be.false;
  });

  it('does nothing for a host that has the focus', () => {
    const element = create();
    element.tabIndex = 0;
    HTMLElement.prototype.focus.call(element);

    expect(deferFocus(element)).to.be.false;
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
