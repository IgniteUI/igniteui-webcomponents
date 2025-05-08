import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * A controller class which determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard, not with a mouse, touch, or other input methods.
 *
 * By default the class attaches a keyup event handler on the component host and will update its keyboard focus
 * state based on it.
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

  constructor(readonly host: ReactiveControllerHost & HTMLElement) {
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

/**
 * Adds a {@link KeyboardFocusRingController} responsible for managing keyboard focus state.
 */
export function addKeyboardFocusRing(
  host: ReactiveControllerHost & HTMLElement
): KeyboardFocusRingController {
  return new KeyboardFocusRingController(host);
}
