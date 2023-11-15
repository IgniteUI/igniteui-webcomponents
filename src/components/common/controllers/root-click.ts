import type { ReactiveController, ReactiveControllerHost } from 'lit';

type IgcPopoverLikeComponent = {
  open: boolean;
  keepOpenOnOutsideClick: boolean;
  hide(): void;
};

interface RootClickControllerConfig {
  hideCallback?: Function;
  target?: HTMLElement;
}

export class RootClickController implements ReactiveController {
  private _abortController: AbortController;

  protected get abortController() {
    if (this._abortController.signal.aborted) {
      this._abortController = new AbortController();
    }

    return this._abortController;
  }

  constructor(
    private readonly host: ReactiveControllerHost &
      IgcPopoverLikeComponent &
      HTMLElement,
    private readonly config?: RootClickControllerConfig
  ) {
    this.host.addController(this);
    this._abortController = new AbortController();
  }

  private addEventListeners() {
    if (!this.host.keepOpenOnOutsideClick) {
      document.addEventListener('click', this.handleClick, {
        // capture: true,
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
    this.config?.hideCallback ? this.config.hideCallback() : this.host.hide();
  }

  public update() {
    this.configureListeners();
  }

  public hostConnected() {
    this.configureListeners();
  }

  public hostDisconnected() {
    this.abortController.abort();
  }
}
