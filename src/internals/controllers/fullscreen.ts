import type { ReactiveControllerHost } from 'lit';
import { addHostListeners } from './host-listeners.js';

type FullscreenControllerConfiguration = {
  /**
   * Runs when the host enters or leaves fullscreen mode, with the new `state`.
   * Before a {@link FullscreenController.setState} change it is `cancelable`,
   * and a falsy return value stops the change. After a change by the browser
   * it is not, and the return value is ignored.
   */
  onChange?: (state: boolean, cancelable: boolean) => boolean;
};

class FullscreenController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _options: FullscreenControllerConfiguration;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options?: FullscreenControllerConfiguration
  ) {
    this._host = host;
    this._options = { ...options };

    addHostListeners(host, { events: ['fullscreenchange'], listener: this });
    host.addController(this);
  }

  /**
   * A removed host leaves fullscreen, but the event goes to the document, so
   * the state syncs on reconnect.
   * @internal
   */
  public hostConnected(): void {
    this._sync();
  }

  /** Moves the host element into or out of fullscreen mode. */
  public setState(fullscreen: boolean): void {
    const { onChange } = this._options;

    if (onChange && !onChange.call(this._host, fullscreen, true)) {
      return;
    }

    this._fullscreen = fullscreen;
    this._host.requestUpdate();

    if (fullscreen) {
      // The request rejects without user activation, or for an element that
      // cannot go fullscreen. The state then rolls back.
      this._host.requestFullscreen().catch(() => this._sync());
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  /**
   * Follows a change that the browser made, such as Escape or a
   * `requestFullscreen()` call from outside the controller.
   * @internal
   */
  public handleEvent(): void {
    this._sync();
  }

  /** Takes the state of the browser, and reports a change as not cancelable. */
  private _sync(): void {
    const fullscreen = this._host.matches(':fullscreen');

    if (fullscreen !== this._fullscreen) {
      this._fullscreen = fullscreen;
      this._options.onChange?.call(this._host, fullscreen, false);
      this._host.requestUpdate();
    }
  }
}

export function addFullscreenController(
  host: ReactiveControllerHost & HTMLElement,
  options?: FullscreenControllerConfiguration
): FullscreenController {
  return new FullscreenController(host, options);
}
