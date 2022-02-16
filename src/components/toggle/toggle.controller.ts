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

  /** The directive that marks the toggle. */
  public toggleDirective!: DirectiveResult<typeof IgcToggleDirective>;

  private _options!: IToggleOptions;
  public set options(value: IToggleOptions) {
    this._options = Object.assign({}, this.defaultOptions, value);
    this.createToggleDir();
  }

  /** The options describing the positioning and behavior of the toggle. */
  public get options() {
    return this._options;
  }

  private _target!: HTMLElement;
  public set target(value: HTMLElement) {
    this._target = value;
    this.createToggleDir();
  }

  /** The element, relative to which, the toggle will be positioned. */
  public get target() {
    return this._target;
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

  private _sourceElement?: Element;
  private _initialScrollTop = 0;
  private _initialScrollLeft = 0;

  private blockScroll = (event: Event) => {
    event.preventDefault();
    if (!this._sourceElement || this._sourceElement !== event.target) {
      this._sourceElement = event.target as Element;
      this._initialScrollTop =
        this._sourceElement.scrollTop ??
        this._sourceElement.firstElementChild?.scrollTop;
      this._initialScrollLeft =
        this._sourceElement.scrollLeft ??
        this._sourceElement.firstElementChild?.scrollLeft;
    }

    this._sourceElement.scrollTop = this._initialScrollTop;
    this._sourceElement.scrollLeft = this._initialScrollLeft;
    if (this._sourceElement.firstElementChild) {
      this._sourceElement.firstElementChild.scrollTop = this._initialScrollTop;
      this._sourceElement.firstElementChild.scrollLeft =
        this._initialScrollLeft;
    }
  };

  /** The document's click event handler to override in the host component if necessary. */
  public documentClicked = (event: MouseEvent) => {
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
  public handleScroll = (event: Event) => {
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
