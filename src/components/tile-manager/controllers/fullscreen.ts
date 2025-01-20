import type { ReactiveController, ReactiveControllerHost } from 'lit';

type FullscreenControllerCallback = (state: boolean) => boolean;

class FullscreenController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement;
  private _callback?: FullscreenControllerCallback;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    callback?: FullscreenControllerCallback
  ) {
    this._host = host;
    this._callback = callback;
    host.addController(this);
  }

  public setState(fullscreen: boolean, isUserTriggered = false): void {
    if (!this._host.isConnected) return;

    if (isUserTriggered && this._callback) {
      if (!this._callback.call(this._host, fullscreen)) {
        return;
      }
    }

    this._fullscreen = fullscreen;

    if (this._fullscreen) {
      this._host.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  public handleEvent() {
    const isFullscreen = document.fullscreenElement === this._host;
    if (!isFullscreen && this._fullscreen) {
      this.setState(false, true);
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
  callback?: FullscreenControllerCallback
) {
  return new FullscreenController(host, callback);
}
