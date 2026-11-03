import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { render, type TemplateResult } from 'lit';
import { getDeepActiveElement } from '../utils/dom.js';
import { isFocused } from './helpers.spec.js';

/** Waits for the host and the components inside it to render. */
async function settle(element: HTMLElement): Promise<void> {
  await elementUpdated(element);
  await nextFrame();
}

/**
 * Tests that the first element of `template` takes the focus from a `focus()`
 * call between its connection and its first render, as a native control does.
 */
export function runFocusBeforeRenderTests(template: TemplateResult): void {
  describe('Focus before the first render', () => {
    let container: HTMLElement;

    /** Connects the first element of `template`. It renders when the caller awaits. */
    function mount(target = container): HTMLElement {
      render(template, target);
      return target.firstElementChild as HTMLElement;
    }

    beforeEach(async () => {
      container = await fixture<HTMLElement>(html`<div></div>`);
    });

    it('focuses the same element as after the render', async () => {
      const element = mount();

      element.focus();
      expect(element.matches(':focus-within')).to.be.false;
      await settle(element);
      expect(element.matches(':focus-within')).to.be.true;
      const deferred = getDeepActiveElement();

      element.blur();
      expect(element.matches(':focus-within')).to.be.false;

      element.focus();
      expect(getDeepActiveElement()).to.equal(deferred);
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

    it('does not cancel an earlier `focus()` call when disabled', async function () {
      const element = mount();
      const target = document.createElement('div');
      container.append(target);
      const disabled = mount(target);

      if (!('disabled' in disabled)) {
        this.skip();
      }

      disabled.disabled = true;
      element.focus();
      disabled.focus();
      await settle(element);

      expect(element.matches(':focus-within')).to.be.true;
    });

    it('does not take the focus when it is disconnected at the render', async () => {
      const element = mount();

      element.focus();
      element.remove();
      await settle(element);
      container.append(element);
      await settle(element);

      expect(element.matches(':focus-within')).to.be.false;
    });

    // A native element loses the focus when it moves. The request stays, because
    // the host is connected again when it renders.
    it('takes the focus when it moves in the same task before the render', async () => {
      const element = mount();
      const target = document.createElement('div');
      container.append(target);

      element.focus();
      target.append(element);
      await settle(element);

      expect(element.matches(':focus-within')).to.be.true;
    });

    it('takes the focus at once after the render, and `blur()` removes it', async () => {
      const element = mount();
      await settle(element);

      element.focus();
      expect(isFocused(element)).to.be.true;

      element.blur();
      expect(element.matches(':focus-within')).to.be.false;
    });
  });
}
