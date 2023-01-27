import { ReactiveController, ReactiveControllerHost } from 'lit';
import { igcToggle, IgcToggleDirective } from './toggle.directive.js';
import type { DirectiveResult } from 'lit/directive';
import type { IgcToggleComponent } from './types.js';

type ToggleHost = ReactiveControllerHost & IgcToggleComponent & HTMLElement;

/**
 * Toggle controller configuration
 */
interface ToggleControllerConfig {
  /** The element, relative to which, the toggle will be positioned. */
  target?: HTMLElement;
  /**
   * The function to call when closing the toggle element from an user interaction (scroll, click).
   */
  closeCallback?: Function;
}

/* blazorSuppress */
/**
 * Controller, bundling the creation of a toggle directive and handling global events,
 * related to the configuration of togglable components.
 */
export class IgcToggleController implements ReactiveController {
  private host: IgcToggleComponent & HTMLElement;
  private sourceElement?: Element;
  private initialScrollTop = 0;
  private initialScrollLeft = 0;
  private _target!: HTMLElement;
  private _hide?: Function;
  private _abortController = new AbortController();

  /**
   *  Abort controller used to clean up document level event listeners
   *  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#add_an_abortable_listener
   */
  protected get abortController() {
    if (this._abortController.signal.aborted) {
      this._abortController = new AbortController();
    }
    return this._abortController;
  }

  /** The directive that marks the toggle. */
  public toggleDirective!: DirectiveResult<typeof IgcToggleDirective>;
  public rendered!: Promise<void>;

  public set target(value: HTMLElement) {
    this._target = value;
    this.update();
  }

  /** The element, relative to which, the toggle will be positioned. */
  public get target() {
    return this._target;
  }

  constructor(host: ToggleHost, config?: ToggleControllerConfig) {
    (this.host = host).addController(this);

    if (config?.target) {
      this._target = config.target;
    }

    if (config?.closeCallback) {
      this._hide = config.closeCallback;
    }

    this.update();
  }

  public hostDisconnected() {
    this.abortController.abort();
  }

  public update() {
    this.toggleDirective = igcToggle(this.target, this.host, this);
    this.configureListeners();
  }

  protected hide() {
    this._hide ? this._hide() : this.host.hide();
  }

  private addEventListeners() {
    const options: AddEventListenerOptions = {
      capture: true,
      signal: this.abortController.signal,
    };

    if (!this.host.keepOpenOnOutsideClick) {
      document.addEventListener('click', this.documentClicked, options);
    }

    document.addEventListener('scroll', this.handleScroll, options);
  }

  private configureListeners() {
    this.host.open ? this.addEventListeners() : this.abortController.abort();
  }

  private blockScroll = (event: Event) => {
    event.preventDefault();
    if (!this.sourceElement || this.sourceElement !== event.target) {
      this.sourceElement = event.target as Element;
      this.initialScrollTop =
        this.sourceElement.scrollTop ??
        this.sourceElement.firstElementChild?.scrollTop;
      this.initialScrollLeft =
        this.sourceElement.scrollLeft ??
        this.sourceElement.firstElementChild?.scrollLeft;
    }

    this.sourceElement.scrollTop = this.initialScrollTop;
    this.sourceElement.scrollLeft = this.initialScrollLeft;
    if (this.sourceElement.firstElementChild) {
      this.sourceElement.firstElementChild.scrollTop = this.initialScrollTop;
      this.sourceElement.firstElementChild.scrollLeft = this.initialScrollLeft;
    }
  };

  /** The document's click event handler to override in the host component if necessary. */
  private documentClicked = (event: MouseEvent) => {
    if (!this.host.keepOpenOnOutsideClick) {
      const tree = event.composed ? event.composedPath() : [event.target];

      if (tree.includes(this.host) || tree.includes(this.target)) {
        return;
      }

      this.hide();
    }
  };

  /** The document's scroll event handler to override in the host component if necessary. */
  private handleScroll = (event: Event) => {
    switch (this.host.scrollStrategy) {
      case 'scroll':
        break;
      case 'block':
        this.blockScroll(event);
        break;
      case 'close':
        this.hide();
        break;
    }
  };
}
