import type { ReactiveController, ReactiveControllerHost } from 'lit';

/* blazorSuppress */
export class FocusRingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & HTMLElement;
  private _focused = false;

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

  public reset = () => {
    this._focused = false;
    this._host.requestUpdate();
  };
}

export function createFocusRing(host: ReactiveControllerHost & HTMLElement) {
  return new FocusRingController(host);
}
