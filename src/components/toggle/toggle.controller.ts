import { ReactiveController, ReactiveControllerHost } from 'lit';
import { igcToggle, IgcToggleDirective } from './toggle.directive';
import { IToggleOptions } from './utilities.js';
import { DirectiveResult } from 'lit/directive';
import { IToggleComponent } from './toggle.interface';

/**
 * Controller, bundling the creation of a toggle directive and handling global events,
 * related to the configuration of togglable components.
 */
export class IgcToggleController implements ReactiveController {
  private defaultOptions: IToggleOptions;
  private host: IToggleComponent & HTMLElement;
  private sourceElement?: Element;
  private initialScrollTop = 0;
  private initialScrollLeft = 0;
  private _options!: IToggleOptions;
  private _target!: HTMLElement;

  /** The directive that marks the toggle. */
  public toggleDirective!: DirectiveResult<typeof IgcToggleDirective>;

  public set options(value: IToggleOptions) {
    this._options = Object.assign({}, this.defaultOptions, value);
    this.createToggleDir();
  }

  /** The options describing the positioning and behavior of the toggle. */
  public get options() {
    return this._options;
  }

  public set target(value: HTMLElement) {
    this._target = value;
    this.createToggleDir();
  }

  /** The element, relative to which, the toggle will be positioned. */
  public get target() {
    return this._target;
  }

  constructor(
    host: ReactiveControllerHost & IToggleComponent & HTMLElement,
    target?: HTMLElement,
    options?: IToggleOptions
  ) {
    host.addController(this);

    this.host = host;
    this.defaultOptions = {
      placement: this.host.placement,
      positionStrategy: this.host.positionStrategy,
    };

    if (target) {
      this._target = target;
    }

    if (options) {
      this._options = options;
    }

    this.createToggleDir();
  }

  public hostConnected() {
    this.addEventListeners();
  }

  public hostDisconnected() {
    this.removeEventListeners();
  }

  private createToggleDir() {
    this.toggleDirective = igcToggle(
      this._target,
      this.host.open,
      this._options
    );
    this.addEventListeners();
  }

  private addEventListeners() {
    if (this.host.open) {
      document.addEventListener('scroll', this.handleScroll, true);
      if (this.host.closeOnOutsideClick) {
        document.addEventListener('click', this.documentClicked, true);
      }
    }
  }

  private removeEventListeners() {
    document.removeEventListener('click', this.documentClicked, true);
    document.removeEventListener('scroll', this.handleScroll, true);
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
    if (this.host.closeOnOutsideClick) {
      const target = event.composed ? event.composedPath() : [event.target];
      const isInsideClick: boolean =
        target.includes(this.host) ||
        (this.target !== undefined && target.includes(this.target));
      if (isInsideClick) {
        return;
      } else {
        this.host.hide();
      }
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
        this.host.hide();
        break;
      case 'none':
        event.preventDefault();
        event.stopImmediatePropagation();
        break;
    }
  };
}
