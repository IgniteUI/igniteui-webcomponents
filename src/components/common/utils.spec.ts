import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import type { LitElement, TemplateResult } from 'lit';

import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import { parseKeys } from './controllers/key-bindings.js';
import type {
  FormAssociatedCheckboxElementInterface,
  FormAssociatedElementInterface,
} from './mixins/forms/types.js';
import { toKebabCase } from './util.js';

export class FormAssociatedTestBed<
  T extends (
    | FormAssociatedElementInterface
    | FormAssociatedCheckboxElementInterface
  ) &
    Element,
> {
  private _element!: T;
  private _form!: HTMLFormElement;

  /**
   * The form associated component for the test bed.
   */
  public get element() {
    return this._element;
  }

  /**
   * The form element from the test bed.
   */
  public get form() {
    return this._form;
  }

  public get valid() {
    return this.element.checkValidity();
  }

  constructor(private template: TemplateResult) {}

  /**
   * Creates the fixture.
   *
   * @remarks
   * Called in the async `beforeEach` test hook callback. Pass in the
   * query selector for the component.
   */
  public async setup(qs: string) {
    this._form = await fixture<HTMLFormElement>(
      html`<form><fieldset>${this.template}</fieldset></form>`
    );
    this._element = this._form.querySelector(qs) as unknown as T;
  }

  public setAncestorDisabledState(state: boolean) {
    this.form.querySelector('fieldset')?.toggleAttribute('disabled', state);
  }

  /** Resets the form controls. */
  public reset() {
    this.form.reset();
  }

  /**
   * Attempts to submit the form element.
   * If constraint validation passes returns the form data, otherwise `undefined`.
   */
  public submit(): FormData | undefined {
    let data!: FormData;

    this.form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        data = new FormData(this.form);
      },
      { once: true }
    );
    this.form.requestSubmit();
    return data;
  }

  public submitValidates(msg?: string) {
    expect(this.submit(), msg).not.to.be.undefined;
    expect(this.valid).to.be.true;
  }

  public submitFails(msg?: string) {
    expect(this.submit(), msg).to.be.undefined;
    expect(this.valid).to.be.false;
  }
}

export function simulatePointerDown(
  node: Element,
  options?: PointerEventInit,
  times = 1
) {
  for (let i = 0; i < times; i++) {
    node.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        composed: true,
        pointerId: 1,
        ...options,
      })
    );
  }
}

export function simulateLostPointerCapture(
  node: Element,
  options?: PointerEventInit
) {
  node.dispatchEvent(
    new PointerEvent('lostpointercapture', {
      composed: true,
      bubbles: true,
      pointerId: 1,
      ...options,
    })
  );
}

type PointerEventIncrement = {
  x?: number;
  y?: number;
};

export function simulatePointerMove(
  node: Element,
  options?: PointerEventInit,
  increment?: PointerEventIncrement,
  times = 1
) {
  const { x = 0, y = 0 } = increment ?? {};
  const { clientX = 0, clientY = 0 } = options ?? {};

  let i = 0;

  do {
    i += 1;
    node.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        composed: true,
        pointerId: 1,
        ...options,
        clientX: clientX + i * x,
        clientY: clientY + i * y,
      })
    );
  } while (i < times);
}

export function simulateClick(
  node: Element,
  options?: PointerEventInit,
  times = 1
) {
  for (let i = 0; i < times; i++) {
    node.dispatchEvent(
      new PointerEvent('click', { bubbles: true, composed: true, ...options })
    );
  }
}

interface MockInputEventConfig extends InputEventInit {
  /** The value to set on the passed input */
  value?: string;

  /**
   * Whether to skip setting the value to the input target.
   * Useful when the test scenario cares for the handling of the event.
   */
  skipValueProperty?: boolean;
}

/**
 * Simulates input interaction for a given input DOM element.
 *
 * @param input - the input element
 * @param options - a {@link MockInputEventConfig} object
 */
export function simulateInput(
  input: HTMLInputElement | HTMLTextAreaElement,
  options: MockInputEventConfig = { value: '', skipValueProperty: false }
) {
  if (!options.skipValueProperty) {
    input.value = options.value ?? '';
  }
  input.dispatchEvent(new InputEvent('input', options));
}

/**
 * Simulates keyboard interaction on a given element node.
 *
 * @param node - the target element
 * @param key - the key(s) to simulate
 * @param times - how many times to simulate keydown with the passed key(s). Defaults to 1.
 */
export function simulateKeyboard(
  node: Element,
  key: string | string[],
  times = 1
) {
  const { keys, modifiers } = parseKeys(key);
  const eventOptions = modifiers.reduce(
    (acc, m) => Object.assign(acc, { [`${m}Key`]: true }),
    {}
  );

  for (const k of keys) {
    for (let i = 0; i < times; i++) {
      node.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: k,
          bubbles: true,
          composed: true,
          ...eventOptions,
        })
      );
    }
  }

  for (const k of keys) {
    node.dispatchEvent(
      new KeyboardEvent('keyup', {
        key: k,
        bubbles: true,
        composed: true,
        ...eventOptions,
      })
    );
  }
}

/**
 * Simulates scrolling for a given element.
 */
export async function simulateScroll(node: Element, options?: ScrollToOptions) {
  node.scrollTo(options);
  node.dispatchEvent(new Event('scroll'));
  await elementUpdated(node);
  await nextFrame();
}

/**
 * Simulates a wheel event for a given element.
 */
export function simulateWheel(node: Element, options?: WheelEventInit) {
  node.dispatchEvent(
    new WheelEvent('wheel', { bubbles: true, composed: true, ...options })
  );
}

/**
 * Returns an array of all Animation objects affecting this element or which are scheduled to do so in the future.
 * It can optionally return Animation objects for descendant elements too.
 */
export function getAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
) {
  return element.getAnimations(options);
}

/**
 * Runs all animations for the given element and/or descendant elements to completion.
 */
export function finishAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
) {
  const animations = getAnimationsFor(element, options);
  for (const animation of animations) {
    animation.finish();
  }
}

/**
 * Returns whether all passed `names` exist as slots in the given `root`.
 */
export function hasSlots(
  root: HTMLElement | DocumentFragment,
  ...names: string[]
) {
  const slotNames = new Set(
    Array.from(root.querySelectorAll('slot')).map((slot) => slot.name ?? '')
  );

  for (const name of names) {
    if (!slotNames.has(name)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns whether the given slot `name` has any slotted content for the given `root`.
 * Pass an empty string for the default slot.
 *
 * The function will flatten the target slot discarding any slot re-projection and
 * will match only elements being projected.
 */
export function hasSlotContent(
  root: HTMLElement | DocumentFragment,
  name: string
) {
  const slot = root.querySelector<HTMLSlotElement>(
    name ? `slot[name='${name}']` : 'slot:not([name])'
  );

  return !!slot && slot.assignedElements({ flatten: true }).length > 0;
}

export async function checkValidationSlots(
  element: LitElement &
    (FormAssociatedElementInterface | FormAssociatedCheckboxElementInterface),
  ...names: Array<keyof ValidityStateFlags | 'invalid'>
) {
  const container = element.renderRoot.querySelector(
    IgcValidationContainerComponent.tagName
  )!;

  const slots = names.map((name) => toKebabCase(name));

  element.checkValidity();
  await Promise.all([elementUpdated(element), elementUpdated(container)]);

  expect(element.invalid).to.be.true;
  expect(hasSlots(container.renderRoot, ...slots)).to.be.true;

  for (const slot of slots) {
    expect(hasSlotContent(container.renderRoot, slot)).to.be.true;
  }
}

/**
 * Checks if a given element is within the view of another element.
 */
export function scrolledIntoView(el: HTMLElement, view: HTMLElement) {
  const { top, bottom, height } = el.getBoundingClientRect();
  const { top: viewTop, bottom: viewBottom } = view.getBoundingClientRect();

  return top <= viewTop
    ? viewTop - top <= height
    : bottom - viewBottom <= height;
}

export function isFocused(element?: Element) {
  return element ? element.matches(':focus') : false;
}
