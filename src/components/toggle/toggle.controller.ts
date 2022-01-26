import { ReactiveController, ReactiveControllerHost } from 'lit';
import { igcToggle, IgcToggleDirective } from './toggle.directive';
import { IgcPlacement, IToggleOptions } from './utilities.js';
import { DirectiveResult } from 'lit/directive';

/**
 * Controller, bundling the creation of a toggle directive and handling global events,
 * related to the configuration of togglable components.
 */
export class IgcToggleController implements ReactiveController {
  private placement: IgcPlacement = 'bottom-start';
  private strategy: 'absolute' | 'fixed' = 'absolute';
  private flip = false;

  private _defaultOptions: IToggleOptions = {
    placement: this.placement,
    positionStrategy: this.strategy,
    flip: this.flip,
  };

  /** Sets the open state of the toggle. */
  public open = false;

  /** The directive that marks the toggle. */
  public toggleDirective!: DirectiveResult<typeof IgcToggleDirective>;

  private _options!: IToggleOptions;
  public set options(value: IToggleOptions) {
    this._options = Object.assign({}, this._defaultOptions, value);
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
    this.toggleDirective = igcToggle(this._target, this.open, this._options);
  }

  private addEventListeners() {
    document.addEventListener('click', this.documentClicked, true);
    document.addEventListener('scroll', this.handleScroll, true);
  }

  private removeEventListeners() {
    document.removeEventListener('click', this.documentClicked, true);
    document.removeEventListener('scroll', this.handleScroll, true);
  }

  constructor(
    host: ReactiveControllerHost,
    target?: HTMLElement,
    options?: IToggleOptions
  ) {
    host.addController(this);

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

  /** The document's click event handler to override in the host component. */
  public documentClicked = (_ev: MouseEvent) => {};

  /** The document's scroll event handler to override in the host component. */
  public handleScroll = (_ev: Event) => {};
}
