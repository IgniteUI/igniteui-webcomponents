import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Callback invoked when the host element is about to enter/leave fullscreen mode.
 *
 * The callback is passed the current fullscreen `state`.
 * Returning a falsy value from the callback will stop the current fullscreen state change.
 */
type FullscreenControllerCallback = (state: boolean) => boolean;

/** Configuration object for the fullscreen controller. */
type FullscreenControllerConfig = {
  /**
   * Invoked when the host element is entering fullscreen mode.
   * See the {@link FullscreenControllerCallback} for details.
   */
  onEnterFullscreen?: FullscreenControllerCallback;
  /**
   * Invoked when the host element is leaving fullscreen mode.
   * See the {@link FullscreenControllerCallback} for details.
   */
  onExitFullscreen?: FullscreenControllerCallback;
};

class FullscreenController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _config: FullscreenControllerConfig = {};

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config?: FullscreenControllerConfig
  ) {
    this._host = host;
    Object.assign(this._config, config);
    host.addController(this);
  }

  /**
   * Transitions the host element to/from fullscreen mode.
   * This method **will invoke** onEnter/onExitFullscreen callbacks if present.
   */
  public setState(fullscreen: boolean): void {
    const callback = fullscreen
      ? this._config.onEnterFullscreen
      : this._config.onExitFullscreen;

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
    const isFullscreen = document.fullscreenElement === this._host;
    if (!isFullscreen && this._fullscreen) {
      this.setState(false);
    }
  }

  public hostConnected(): void {
    this._host.addEventListener('fullscreenchange', this);
  }

  public hostDisconnected(): void {
    this._host.removeEventListener('fullscreenchange', this);
  }
}

export function addFullscreenController(
  host: ReactiveControllerHost & HTMLElement,
  config?: FullscreenControllerConfig
) {
  return new FullscreenController(host, config);
}
