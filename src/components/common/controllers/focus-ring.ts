import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * A controller class which determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard, not with a mouse, touch, or other input methods.
 *
 * By default the class attaches a keyup event handler on the component host and will update its keyboard focus
 * state based on it.
 *
 * **Important Note:** This controller is designed for use with **atomic web components** that represent single,
 * interactive elements (e.g., buttons, form fields, interactive icons). It helps these components correctly
 * display a focus indicator *only* when keyboard navigation is occurring, improving accessibility without
 * visual clutter during mouse or touch interactions.
 *
 * **Do not use this controller as a general-purpose shortcut for managing focus state in complex components or layouts.**
 * Misusing it in this way can lead to incorrect focus ring behavior, accessibility issues, and make your
 * application harder to maintain. For managing focus within larger, composite components, consider alternative
 * strategies like ARIA attributes, managing `tabindex`, or a bespoke implementation if needed.
 */
class KeyboardFocusRingController implements ReactiveController {
  private static readonly _events = [
    'keyup',
    'focusout',
    'pointerdown',
  ] as const;

  private readonly _host: ReactiveControllerHost & HTMLElement;
  private _isKeyboardFocused = false;

  /**
   * Gets whether the current focus state is activated through a keyboard interaction.
   */
  public get focused(): boolean {
    return this._isKeyboardFocused;
  }

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this._host = host;
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    for (const event of KeyboardFocusRingController._events) {
      this._host.addEventListener(event, this, { passive: true });
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    for (const event of KeyboardFocusRingController._events) {
      this._host.removeEventListener(event, this);
    }
  }

  /** @internal */
  public handleEvent(event: Event): void {
    this._isKeyboardFocused = event.type === 'keyup';
    this._host.requestUpdate();
  }
}

export type { KeyboardFocusRingController };

/**
 * Adds a {@link KeyboardFocusRingController} responsible for managing keyboard focus state.
 *
 * This utility function is intended for use with **atomic web components** that require
 * dynamic focus ring visibility based on keyboard interaction.
 */
export function addKeyboardFocusRing(
  host: ReactiveControllerHost & HTMLElement
): KeyboardFocusRingController {
  return new KeyboardFocusRingController(host);
}
