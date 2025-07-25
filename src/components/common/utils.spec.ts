import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { type CalendarDay, toCalendarDay } from '../calendar/model.js';
import { parseKeys } from './controllers/key-bindings.js';
import type { IgcFormControl } from './mixins/forms/types.js';
import { toKebabCase } from './util.js';

export function createFormAssociatedTestBed<T extends IgcFormControl>(
  template: TemplateResult
): FormAssociatedTestBed<T> {
  return new FormAssociatedTestBed<T>(template);
}

const initialFormData = Object.freeze(new FormData());

class FormAssociatedTestBed<T extends IgcFormControl> {
  private _element!: T;
  private _template: TemplateResult;
  private _form!: HTMLFormElement;

  /**
   * The form associated component for the test bed.
   */
  public get element(): T {
    return this._element;
  }

  /**
   * The form element from the test bed.
   */
  public get form(): HTMLFormElement {
    return this._form;
  }

  public get formData(): FormData {
    return new FormData(this._form);
  }

  public get valid(): boolean {
    return this.element.checkValidity();
  }

  constructor(template: TemplateResult) {
    this._template = template;
  }

  /**
   * Creates the fixture.
   *
   * @remarks
   * Called in the async `beforeEach` test hook callback. Pass in the
   * query selector for the component.
   */
  public async setup(qs: string): Promise<void> {
    this._form = await fixture(
      html`<form><fieldset>${this._template}</fieldset></form>`
    );
    this._element = this._form.querySelector<T>(qs)!;
  }

  public setAncestorDisabledState(state: boolean): void {
    this.form.querySelector('fieldset')?.toggleAttribute('disabled', state);
  }

  /** Resets the form controls. */
  public reset(): void {
    this.form.reset();
  }

  /**
   * Attempts to submit the form element.
   * If constraint validation passes returns the form data, otherwise returns a
   * default `initialFormData` sentinel value.
   */
  public submit(): FormData {
    let data = initialFormData;

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

  /**
   * Assigns properties to the element and optionally waits for the update.
   *
   * This function takes an object of properties to assign to the element.
   * It then uses `Object.assign` to merge these properties into the element's properties.
   * If the `waitForUpdate` parameter is `true`, the function waits for the element to be updated before returning.
   */
  public async setProperties(
    props: { [K in keyof T]?: T[K] | string },
    waitForUpdate = false
  ): Promise<void> {
    Object.assign(this.element, props);
    if (waitForUpdate) {
      await elementUpdated(this.element);
    }
  }

  /**
   * Sets attributes on the element and optionally waits for the update.
   *
   * This function takes an object of attributes to set on the element.
   * It iterates over each attribute and its value, and uses the `setAttribute` method to set the attribute on the element.
   * If the `waitForUpdate` parameter is `true`, the function waits for the element to be updated before returning.
   */
  public async setAttributes(
    attributes: { [K in keyof T]?: T[K] | string },
    waitForUpdate = false
  ): Promise<void> {
    for (const [attr, value] of Object.entries(attributes)) {
      this.element.setAttribute(attr, `${value}`);
    }
    if (waitForUpdate) {
      await elementUpdated(this.element);
    }
  }

  /**
   * Whether the form is submitted and contains the given 'value'
   * in its form data.
   */
  public assertSubmitHasValue(value: unknown, msg?: string): void {
    expect(this.submit().get(this.element.name), msg).to.eql(value);
  }

  /**
   * Whether the form is submitted and contains the given 'value'
   * in its form data.
   */
  public assertSubmitHasValues(value: unknown, msg?: string): void {
    expect(this.submit().getAll(this.element.name), msg).to.eql(value);
  }

  /**
   * Whether the form is submitted and contains the given 'key'-'value' pair
   * in its form data.
   */
  public assertSubmitHasKeyValue = (
    key: string,
    value: unknown,
    msg?: string
  ) => {
    expect(this.submit().get(key), msg).to.eql(value);
  };

  /**
   * Whether the form fails to submit.
   * The component will be in invalid state and the form data will be empty.
   */
  public assertSubmitFails(msg?: string): void {
    expect(this.submit() === initialFormData, msg).to.be.true;
    expect(this.valid, msg).to.be.false;
  }

  /**
   * Whether the form submits.
   * The component will be in valid state and the form data will include the
   * component name and value.
   */
  public assertSubmitPasses(msg?: string): void {
    expect(this.submit() === initialFormData, msg).to.be.false;
    expect(this.valid, msg).to.be.true;
  }

  /**
   * Whether the form element is in 'pristine' state.
   */
  public assertIsPristine(msg?: string): void {
    // biome-ignore lint/complexity/useLiteralKeys: Pristine state test
    expect(this.element['_pristine'], msg).to.be.true;
  }
}

export function simulatePointerEnter(
  node: Element,
  options?: PointerEventInit
): void {
  node.dispatchEvent(
    new PointerEvent('pointerenter', {
      bubbles: true,
      composed: true,
      pointerId: 1,
      ...options,
    })
  );
}

export function simulatePointerLeave(
  node: Element,
  options?: PointerEventInit
): void {
  node.dispatchEvent(
    new PointerEvent('pointerleave', {
      bubbles: true,
      composed: true,
      pointerId: 1,
      ...options,
    })
  );
}

export function simulateFocus(node: Element): void {
  node.dispatchEvent(new FocusEvent('focus'));
}

export function simulateBlur(node: Element): void {
  node.dispatchEvent(new FocusEvent('blur'));
}

export function simulatePointerDown(
  node: Element,
  options?: PointerEventInit,
  times = 1
): void {
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
): void {
  node.dispatchEvent(
    new PointerEvent('lostpointercapture', {
      composed: true,
      bubbles: true,
      pointerId: 1,
      ...options,
    })
  );
}

export function simulatePointerMove(
  node: Element,
  options?: PointerEventInit,
  increment?: { x?: number; y?: number },
  times = 1
): void {
  const { x = 0, y = 0 } = increment ?? {};
  const { clientX = 0, clientY = 0 } = options ?? {};

  for (let i = 1; i <= times; i++) {
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
  }
}

export function simulateClick(
  node: Element,
  options?: PointerEventInit,
  times = 1
): void {
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
): void {
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
): void {
  const { keys, modifiers } = parseKeys(key);
  const eventOptions: Record<string, boolean> = {};

  for (const each of modifiers) {
    eventOptions[`${each}Key`] = true;
  }

  for (const key of keys) {
    for (let i = 0; i < times; i++) {
      node.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
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
export async function simulateScroll(
  node: Element,
  options?: ScrollToOptions
): Promise<void> {
  node.scrollTo(options);
  node.dispatchEvent(new Event('scroll'));
  await elementUpdated(node);
  await nextFrame();
}

/**
 * Simulates a wheel event for a given element.
 */
export function simulateWheel(node: Element, options?: WheelEventInit): void {
  node.dispatchEvent(
    new WheelEvent('wheel', { bubbles: true, composed: true, ...options })
  );
}

export function simulateDoubleClick(node: Element): void {
  node.dispatchEvent(
    new PointerEvent('dblclick', { bubbles: true, composed: true })
  );
}

/**
 * Returns an array of all Animation objects affecting this element or which are scheduled to do so in the future.
 * It can optionally return Animation objects for descendant elements too.
 */
export function getAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): Animation[] {
  return element.getAnimations(options);
}

/**
 * Runs all animations for the given element and/or descendant elements to completion.
 */
export function finishAnimationsFor(
  element: ShadowRoot | Element,
  options?: GetAnimationsOptions
): void {
  const animations = getAnimationsFor(element, options);
  for (const animation of animations) {
    animation.finish();
  }
}

/**
 * Checks if a given element is within the view of another element.
 */
export function scrolledIntoView(el: HTMLElement, view: HTMLElement): boolean {
  const { top, bottom, height } = el.getBoundingClientRect();
  const { top: viewTop, bottom: viewBottom } = view.getBoundingClientRect();

  return top <= viewTop
    ? viewTop - top <= height
    : bottom - viewBottom <= height;
}

export function isFocused(element?: Element): boolean {
  return element ? element.matches(':focus') : false;
}

/**
 * Compares and returns whether the passed in CSS `{ prop: value }` entries match against
 * the resolved `(getComputedStyle)` styles of the element.
 */
export function compareStyles(
  element: Element,
  values: Partial<CSSStyleDeclaration>
): boolean {
  const computed = getComputedStyle(element);
  return Object.entries(values).every(
    ([key, value]) => computed.getPropertyValue(toKebabCase(key)) === value
  );
}

/**
 * Compares two date values
 */
export function checkDatesEqual(a: CalendarDay | Date, b: CalendarDay | Date) {
  expect(toCalendarDay(a).equalTo(toCalendarDay(b))).to.be.true;
}
