import { ReactiveController, ReactiveControllerHost } from 'lit';

export class IgcToggleDocEventsController implements ReactiveController {
  constructor(host: ReactiveControllerHost) {
    host.addController(this);
  }

  public hostConnected() {
    this.addEventListeners();
  }

  public hostDisconnected() {
    this.removeEventListeners();
  }

  public documentClicked = (_ev: MouseEvent) => {};
  public handleScroll = (_ev: Event) => {};

  private addEventListeners() {
    document.addEventListener('click', this.documentClicked, true);
    document.addEventListener('scroll', this.handleScroll, true);
  }

  private removeEventListeners() {
    document.removeEventListener('click', this.documentClicked, true);
    document.removeEventListener('scroll', this.handleScroll, true);
  }
}
