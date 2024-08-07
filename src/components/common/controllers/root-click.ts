import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { findElementFromEventPath } from '../util.js';

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

/* blazorSuppress */
export class RootClickController implements ReactiveController {
  public disabled = false;

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

  private shouldHide(event: PointerEvent) {
    const targets = new Set<Element>([this.host]);

    if (this.config?.target) {
      targets.add(this.config.target);
    }

    return !findElementFromEventPath((node) => targets.has(node), event);
  }

  public handleEvent(event: PointerEvent) {
    if (this.host.keepOpenOnOutsideClick || this.disabled) {
      return;
    }

    if (this.shouldHide(event)) {
      this.hide();
    }
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
