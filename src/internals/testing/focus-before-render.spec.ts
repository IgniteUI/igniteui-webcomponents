import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { render, type TemplateResult } from 'lit';

/** The focused elements, from the document down through the shadow roots. */
function focusPath(): Element[] {
  const path: Element[] = [];
  let active = document.activeElement;

  while (active) {
    path.push(active);
    active = active.shadowRoot?.activeElement ?? null;
  }

  return path;
}

/** Waits for the host and the components inside it to render. */
async function settle(element: HTMLElement): Promise<void> {
  await elementUpdated(element);
  await nextFrame();
  await nextFrame();
}

/**
 * Tests that the first element of `template` takes the focus from a `focus()`
 * call between its connection and its first render, as a native control does.
 */
export function runFocusBeforeRenderTests(template: TemplateResult): void {
  describe('Focus before the first render', () => {
    let container: HTMLElement;

    /**
     * Renders `template` in the container. Its first element has not rendered
     * yet, until the caller awaits.
     */
    function mount(): HTMLElement {
      render(template, container);
      return container.firstElementChild as HTMLElement;
    }

    beforeEach(async () => {
      container = await fixture<HTMLElement>(html`<div></div>`);
    });

    it('focuses the same element as after the render', async () => {
      const element = mount();

      element.focus();
      expect(element.matches(':focus-within')).to.be.false;
      await settle(element);
      const deferred = focusPath();

      element.blur();
      expect(element.matches(':focus-within')).to.be.false;

      element.focus();
      expect(deferred).to.include(element);
      expect(deferred).to.have.ordered.members(focusPath());
    });

    it('does not take the focus when `blur()` follows `focus()`', async () => {
      const element = mount();

      element.focus();
      element.blur();
      await settle(element);

      expect(element.matches(':focus-within')).to.be.false;
    });

    it('leaves the focus on an element that a later `focus()` call focuses', async () => {
      const element = mount();
      const other = document.createElement('button');
      container.append(other);

      element.focus();
      other.focus();
      await settle(element);

      expect(document.activeElement).to.equal(other);
    });

    it('does not take the focus when it disconnects before the render', async () => {
      const element = mount();

      element.focus();
      element.remove();
      await settle(element);
      container.append(element);
      await settle(element);

      expect(element.matches(':focus-within')).to.be.false;
    });

    it('takes the focus at once after the render', async () => {
      const element = mount();
      await settle(element);

      element.focus();
      expect(element.matches(':focus-within')).to.be.true;
    });
  });
}
