import type { ReactiveControllerHost } from 'lit';
import { addHostListeners } from './host-listeners.js';

/**
 * Runs before the host enters or leaves fullscreen mode, with the requested
 * `state`. A falsy return value stops the change.
 */
type FullscreenControllerCallback = (state: boolean) => boolean;

type FullscreenControllerConfiguration = {
  /** Runs before the host enters fullscreen mode. */
  enter?: FullscreenControllerCallback;
  /** Runs before the host leaves fullscreen mode. */
  exit?: FullscreenControllerCallback;
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
  }

  /** Moves the host element into or out of fullscreen mode. */
  public setState(fullscreen: boolean): void {
    const callback = fullscreen ? this._options.enter : this._options.exit;

    if (callback && !callback.call(this._host, fullscreen)) {
      return;
    }

    this._fullscreen = fullscreen;

    if (fullscreen) {
      // The request rejects without user activation, or for an element that
      // cannot go fullscreen. The state then rolls back.
      this._host.requestFullscreen().catch(() => {
        this._fullscreen = false;
        this._host.requestUpdate();
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  /** @internal */
  public handleEvent(): void {
    if (!document.fullscreenElement && this._fullscreen) {
      this.setState(false);
    }
  }
}

export function addFullscreenController(
  host: ReactiveControllerHost & HTMLElement,
  options?: FullscreenControllerConfiguration
): FullscreenController {
  return new FullscreenController(host, options);
}
