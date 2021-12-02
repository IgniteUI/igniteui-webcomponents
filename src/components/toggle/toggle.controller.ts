import { ReactiveController, ReactiveControllerHost } from 'lit';
import { igcToggle } from './toggle.directive';
import { IToggleOptions } from './utilities';

/**
 * Controller, bundling the creation of a toggle directive and handling global events,
 * related to the configuration of togglable components.
 */
export class IgcToggleController implements ReactiveController {
  constructor(host: ReactiveControllerHost) {
    host.addController(this);
  }

  public hostConnected() {
    this.addEventListeners();
  }

  public hostDisconnected() {
    this.removeEventListeners();
  }

  /** The document's click event handler to override in the host component. */
  public documentClicked = (_ev: MouseEvent) => {};

  /** The document's scroll event handler to override in the host component. */
  public handleScroll = (_ev: Event) => {};

  private addEventListeners() {
    document.addEventListener('click', this.documentClicked, true);
    document.addEventListener('scroll', this.handleScroll, true);
  }

  private removeEventListeners() {
    document.removeEventListener('click', this.documentClicked, true);
    document.removeEventListener('scroll', this.handleScroll, true);
  }

  /**
   * Creates a toggle directive with the parameters specified.
   * @param target - The target element.
   * @param open - The open state to be created with.
   * @param options - The toggle configuration options.
   * @returns The toggle directive.
   */
  public createToggle(
    target: HTMLElement,
    open = false,
    options?: IToggleOptions
  ) {
    return igcToggle(target, open, options);
  }
}
