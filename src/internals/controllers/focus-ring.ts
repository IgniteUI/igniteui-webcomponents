import type { ReactiveControllerHost } from 'lit';
import { addHostListeners } from './host-listeners.js';

/** Tracks the keyboard focus state. See {@link addKeyboardFocusRing}. */
class KeyboardFocusRingController {
  private static readonly _events = ['keyup', 'focusout', 'pointerup'] as const;

  private readonly _host: ReactiveControllerHost & HTMLElement;
  private _isKeyboardFocused = false;

  /** Whether a keyboard interaction activated the current focus state. */
  public get focused(): boolean {
    return this._isKeyboardFocused;
  }

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this._host = host;

    addHostListeners(host, {
      events: KeyboardFocusRingController._events,
      listener: this,
      options: { passive: true },
    });
  }

  /** @internal */
  public handleEvent(event: Event): void {
    const focused = event.type === 'keyup';

    if (focused !== this._isKeyboardFocused) {
      this._isKeyboardFocused = focused;
      this._host.requestUpdate();
    }
  }
}

export type { KeyboardFocusRingController };

/**
 * Adds a controller that reports whether the host has focus from the
 * keyboard. A component shows its focus ring only in that condition.
 *
 * @remarks
 * Use it for an atomic component, such as a button or a form field. A
 * composite component or a layout needs ARIA attributes, a managed
 * `tabindex`, or an implementation of its own.
 */
export function addKeyboardFocusRing(
  host: ReactiveControllerHost & HTMLElement
): KeyboardFocusRingController {
  return new KeyboardFocusRingController(host);
}
