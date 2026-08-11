import { elementUpdated, nextFrame } from '@open-wc/testing';
import { MODIFIER_EVENT_KEYS, parseKeys } from '../controllers/key-bindings.js';

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

export function simulatePointerUp(
  node: Element,
  options?: PointerEventInit,
  times = 1
): void {
  for (let i = 0; i < times; i++) {
    node.dispatchEvent(
      new PointerEvent('pointerup', {
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
    eventOptions[MODIFIER_EVENT_KEYS[each]] = true;
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
 * Simulates the user selecting the given files through a native file input,
 * dispatching the resulting `change` event.
 */
export function simulateFileUpload(
  input: HTMLInputElement,
  files: File[]
): void {
  const dataTransfer = new DataTransfer();

  for (const file of files) {
    dataTransfer.items.add(file);
  }

  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
