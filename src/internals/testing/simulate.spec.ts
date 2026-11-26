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

  /** Skips the value assignment, so that only the event fires. */
  skipValueProperty?: boolean;
}

/** Simulates input interaction for a given input DOM element. */
export function simulateInput(
  input: HTMLInputElement | HTMLTextAreaElement,
  options: MockInputEventConfig = { value: '', skipValueProperty: false }
): void {
  if (!options.skipValueProperty) {
    input.value = options.value ?? '';
  }
  input.dispatchEvent(new InputEvent('input', options));
}

/** A masked editor, such as the date-time input, that renders a native `input`. */
type MaskedEditor = HTMLElement & {
  renderRoot: HTMLElement | DocumentFragment;
  setSelectionRange(start: number, end: number): void;
};

/** Focuses `editor`, selects all of its text and types `text` over it. */
export async function simulateTypingOver(
  editor: MaskedEditor,
  text: string
): Promise<void> {
  const input = editor.renderRoot.querySelector('input')!;

  editor.focus();
  await elementUpdated(editor);

  editor.setSelectionRange(0, input.value.length);
  simulateInput(input, { value: text, inputType: 'insertText' });
  await elementUpdated(editor);
}

/** Selects the text from `start` to `end` in the focused `editor` and deletes it with Backspace. */
export async function simulateBackspaceOver(
  editor: MaskedEditor,
  start: number,
  end: number
): Promise<void> {
  const input = editor.renderRoot.querySelector('input')!;

  editor.setSelectionRange(start, end);
  simulateKeyboard(input, 'Backspace');
  simulateInput(input, {
    inputType: 'deleteContentBackward',
    skipValueProperty: true,
  });
  await elementUpdated(editor);
}

/**
 * Simulates keyboard interaction on a given element node.
 *
 * @param times - how many times to simulate keydown with the passed key(s). Defaults to 1.
 * @param options.repeat - whether each keydown is an auto-repeat of a held key.
 */
export function simulateKeyboard(
  node: Element,
  key: string | string[],
  times = 1,
  { repeat = false }: { repeat?: boolean } = {}
): void {
  const { keys, modifiers } = parseKeys(key);
  const eventOptions: Record<string, boolean> = { repeat };

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

/** Dispatches a cancelable `keydown` of `key` and returns whether a listener canceled it. */
export function simulateCancelableKeydown(node: Element, key: string): boolean {
  return !node.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );
}

/**
 * Dispatches a cancelable `keydown` of each key that an IME handles: with
 * `isComposing`, then with `keyCode` 229, as Safari sends it after
 * `compositionend`. Returns whether a listener canceled one of them.
 */
export function simulateComposingKeys(
  node: Element,
  ...keys: string[]
): boolean {
  let canceled = false;

  for (const init of [{ isComposing: true }, { keyCode: 229 }]) {
    for (const key of keys) {
      canceled ||= !node.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
          ...init,
        })
      );
    }
  }

  return canceled;
}

/** Simulates scrolling for a given element. */
export async function simulateScroll(
  node: Element,
  options?: ScrollToOptions
): Promise<void> {
  node.scrollTo(options);
  node.dispatchEvent(new Event('scroll'));
  await elementUpdated(node);
  await nextFrame();
}

/** Simulates a wheel event for a given element. */
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
/** Creates a `DataTransfer` that holds `files`. */
export function createDataTransfer(files: File[]): DataTransfer {
  const dataTransfer = new DataTransfer();

  for (const file of files) {
    dataTransfer.items.add(file);
  }

  return dataTransfer;
}

export function simulateFileUpload(
  input: HTMLInputElement,
  files: File[]
): void {
  input.files = createDataTransfer(files).files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
