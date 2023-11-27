import type { ReactiveController, ReactiveControllerHost } from 'lit';

interface RootClickControllerConfig {
  hideCallback?: Function;
  target?: HTMLElement;
}

type RootClickControllerHost = ReactiveControllerHost &
  HTMLElement & {
    open: boolean;
    keepOpenOnOutsideClick: boolean;
    hide(): void;
  };

class RootClickController implements ReactiveController {
  private _abortController: AbortController;

  protected get abortController() {
    if (this._abortController.signal.aborted) {
      this._abortController = new AbortController();
    }

    return this._abortController;
  }

  constructor(
    private readonly host: RootClickControllerHost,
    private config?: RootClickControllerConfig
  ) {
    this.host.addController(this);
    this._abortController = new AbortController();
  }

  private addEventListeners() {
    if (!this.host.keepOpenOnOutsideClick) {
      document.addEventListener('click', this.handleClick, {
        signal: this.abortController.signal,
      });
    }

    // TODO: Implement the scroll blocking?
  }

  private configureListeners() {
    this.host.open ? this.addEventListeners() : this.abortController.abort();
  }

  private handleClick = (event: MouseEvent) => {
    if (this.host.keepOpenOnOutsideClick) {
      return;
    }

    const path = event.composed ? event.composedPath() : [event.target];
    const target = this.config?.target || null;
    if (path.includes(this.host) || path.includes(target)) {
      return;
    }

    this.hide();
  };

  private hide() {
    this.config?.hideCallback
      ? this.config.hideCallback.call(this.host)
      : this.host.hide();
  }

  public update(config?: RootClickControllerConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.configureListeners();
  }

  public hostConnected() {
    this.configureListeners();
  }

  public hostDisconnected() {
    this.abortController.abort();
  }
}

export function addRootClickHandler(
  host: RootClickControllerHost,
  config?: RootClickControllerConfig
) {
  return new RootClickController(host, config);
}
