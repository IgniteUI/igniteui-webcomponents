import type { ReactiveController, ReactiveControllerHost } from 'lit';

type RootClickControllerConfig = {
  hideCallback?: () => void;
  target?: HTMLElement;
};

type RootClickControllerHost = ReactiveControllerHost &
  HTMLElement & {
    open: boolean;
    keepOpenOnOutsideClick?: boolean;
    hide(): void;
  };

class RootClickController implements ReactiveController {
  constructor(
    private readonly host: RootClickControllerHost,
    private config?: RootClickControllerConfig
  ) {
    this.host.addController(this);
  }

  private addEventListeners() {
    if (!this.host.keepOpenOnOutsideClick) {
      document.addEventListener('click', this);
    }
  }

  private removeEventListeners() {
    document.removeEventListener('click', this);
  }

  private configureListeners() {
    this.host.open ? this.addEventListeners() : this.removeEventListeners();
  }

  public handleEvent(event: MouseEvent) {
    if (this.host.keepOpenOnOutsideClick) {
      return;
    }

    const path = event.composed ? event.composedPath() : [event.target];
    const target = this.config?.target || null;
    if (path.includes(this.host) || path.includes(target)) {
      return;
    }

    this.hide();
  }

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
    this.removeEventListeners();
  }
}

export function addRootClickHandler(
  host: RootClickControllerHost,
  config?: RootClickControllerConfig
) {
  return new RootClickController(host, config);
}
