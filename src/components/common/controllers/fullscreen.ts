import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Callback invoked when the host element is about to enter/leave fullscreen mode.
 *
 * The callback is passed the current fullscreen `state`.
 * Returning a falsy value from the callback will stop the current fullscreen state change.
 */
type FullscreenControllerCallback = (state: boolean) => boolean;

/** Configuration object for the fullscreen controller. */
type FullscreenControllerConfiguration = {
  /**
   * Invoked when the host element is entering fullscreen mode.
   * See the {@link FullscreenControllerCallback} for details.
   */
  enter?: FullscreenControllerCallback;
  /**
   * Invoked when the host element is leaving fullscreen mode.
   * See the {@link FullscreenControllerCallback} for details.
   */
  exit?: FullscreenControllerCallback;
};

class FullscreenController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _options: FullscreenControllerConfiguration = {};

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options?: FullscreenControllerConfiguration
  ) {
    this._host = host;
    Object.assign(this._options, options);
    host.addController(this);
  }

  /**
   * Transitions the host element to/from fullscreen mode.
   * This method **will invoke** enter/exit callbacks if present.
   */
  public setState(fullscreen: boolean): void {
    const callback = fullscreen ? this._options.enter : this._options.exit;

    if (callback && !callback.call(this._host, fullscreen)) {
      return;
    }

    this._fullscreen = fullscreen;

    if (this._fullscreen) {
      this._host.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  /** @internal */
  public handleEvent(): void {
    if (!document.fullscreenElement && this._fullscreen) {
      this.setState(false);
    }
  }

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('fullscreenchange', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.removeEventListener('fullscreenchange', this);
  }
}

export function addFullscreenController(
  host: ReactiveControllerHost & HTMLElement,
  options?: FullscreenControllerConfiguration
): FullscreenController {
  return new FullscreenController(host, options);
}
