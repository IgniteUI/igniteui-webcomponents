import type { ReactiveController, ReactiveControllerHost } from 'lit';

/* blazorSuppress */
/**
 * A controller class which determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard, not with a mouse, touch, or other input methods.
 *
 * By default the class attaches a keyup event handler on the component host and will update its keyboard focus
 * state based on it.
 */
export class KeyboardFocusRingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & HTMLElement;
  private _focused = false;

  /**
   * Gets whether the current focus state is activated through a keyboard interaction.
   */
  public get focused() {
    return this._focused;
  }

  constructor(readonly host: ReactiveControllerHost & HTMLElement) {
    this._host = host;
    host.addController(this);
  }

  public hostConnected() {
    this._host.addEventListener('keyup', this);
  }

  public hostDisconnected() {
    this._host.removeEventListener('keyup', this);
  }

  public handleEvent() {
    if (!this._focused) {
      this._focused = true;
    }
    this._host.requestUpdate();
  }

  /**
   * Resets the keyboard focus state.
   *
   * Usually called on blur of the component or when a pointer based interaction
   * is executed.
   */
  public reset = () => {
    this._focused = false;
    this._host.requestUpdate();
  };
}

/**
 * Adds a {@link KeyboardFocusRingController} responsible for managing keyboard focus state.
 */
export function addKeyboardFocusRing(
  host: ReactiveControllerHost & HTMLElement
) {
  return new KeyboardFocusRingController(host);
}
