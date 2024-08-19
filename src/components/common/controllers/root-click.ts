import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { findElementFromEventPath } from '../util.js';

type RootClickControllerConfig = {
  hideCallback?: () => void;
  target?: HTMLElement;
};

interface RootClickControllerHost extends ReactiveControllerHost, HTMLElement {
  open: boolean;
  keepOpenOnOutsideClick?: boolean;
  hide(): void;
}

/* blazorSuppress */
export class RootClickController implements ReactiveController {
  constructor(
    private readonly host: RootClickControllerHost,
    private config?: RootClickControllerConfig
  ) {
    this.host.addController(this);
  }

  private addEventListeners() {
    if (!this.host.keepOpenOnOutsideClick) {
      document.addEventListener('click', this, { capture: true });
    }
  }

  private removeEventListeners() {
    document.removeEventListener('click', this, { capture: true });
  }

  private async configureListeners() {
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
    if (this.host.keepOpenOnOutsideClick) {
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
