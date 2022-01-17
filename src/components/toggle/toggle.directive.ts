import { flip, offset } from '@popperjs/core/lib/modifiers';
import {
  createPopper,
  Instance,
  Modifier,
  OptionsGeneric,
} from '@popperjs/core/lib/popper-lite.js';
import {
  directive,
  Directive,
  PartInfo,
  ElementPart,
  PartType,
} from 'lit/directive.js';
import { IgcPlacement, IToggleOptions } from './utilities.js';
import { styles } from './toggle.material.css';

export class IgcToggleDirective extends Directive {
  /** @private */
  public static styles = styles;

  private style = `
    color: #666;
    background: white;
    border: 1px solid #666;
    font-weight: bold;
    padding: 4px 4px;
    font-size: 13px;
    border-radius: 4px;`;

  private _part: PartInfo;
  private _placement: IgcPlacement = 'bottom-start';
  private _strategy: 'absolute' | 'fixed' = 'absolute';
  private _flip? = false;
  private _offset: { x: number; y: number } | undefined;
  private _modifiers: Modifier<any, any>[] = [];
  private _instance!: Instance;
  private _popperElement!: HTMLElement;
  private _defaultOptions: IToggleOptions = {
    placement: this._placement,
    positionStrategy: this._strategy,
    flip: this._flip,
  };

  /**
   * Creates a popper instance
   * @param target - The element, relative to which, the popper will be positioned.
   * @param open - The initial open state. Default is false.
   * @param options - The popper configuration options.
   * @returns The popper element.
   */
  private createToggleInstance(
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions
  ) {
    this._popperElement = this.createPopperElement(open);

    const popperOptions = this.createPopperOptions(options);

    if (!this._instance) {
      if (!target) {
        return;
      }
      this._instance = createPopper(target, this._popperElement, popperOptions);
    } else {
      this.updatePopperOptions(popperOptions);
    }

    return this._instance.state.elements.popper;
  }

  /** Gets the popper element and sets the specified open state. */
  private createPopperElement(open = false) {
    if (!this._popperElement) {
      this._popperElement = (this._part as ElementPart).element as HTMLElement;
      this._popperElement.classList.add('igc-toggle');
      this._popperElement.setAttribute('style', this.style);
    }

    open
      ? this._popperElement.classList.remove('igc-toggle-hidden')
      : this._popperElement.classList.add('igc-toggle-hidden');

    return this._popperElement;
  }

  private createPopperOptions(options?: IToggleOptions) {
    options = options
      ? Object.assign({}, this._defaultOptions, options)
      : this._defaultOptions;
    this._placement = options.placement;
    this._strategy = options.positionStrategy;
    this._modifiers = this.updateModifiers(options);
    return {
      placement: this._placement,
      strategy: this._strategy,
      modifiers: this._modifiers,
    };
  }

  /** Updates the options of the popper _instance. */
  private updatePopperOptions(
    options: Partial<OptionsGeneric<Modifier<any, any>>>
  ) {
    this._instance?.setOptions(options);
    this._instance?.update();
  }

  /** Updates the popper modifiers. */
  private updateModifiers(options: IToggleOptions) {
    if (this._flip !== options.flip) {
      this._flip = options.flip;
      this._flip ? this.addModifier(flip) : this.removeModifier(flip);
    }
    if (this._offset !== options.offset) {
      this._offset = options.offset;
      this._offset
        ? this.setOffset(this._offset.x, this._offset.y)
        : this.removeModifier(offset);
    }
    return this._modifiers;
  }

  /**
   * Offsets the popper along the corresponding axis by the provided amount in pixels.
   * @param deltaX - The amount of offset in horizontal direction.
   * @param deltaY - The amount of offset in vertical direction.
   */
  private setOffset(deltaX: number, deltaY: number) {
    let offsetValue = [deltaX, deltaY];
    if (
      this._placement.toString().includes('left') ||
      this._placement.toString().includes('right')
    ) {
      offsetValue = [deltaY, deltaX];
    }

    this.addModifier(offset, { offset: offsetValue });
  }

  private addModifier(modifier: Modifier<any, any>, options?: any) {
    let mod = this._modifiers.find((m) => m.name === modifier.name);
    if (!mod) {
      mod = modifier;
      this._modifiers.push(mod);
    }
    if (options && mod.options !== options) {
      mod.options = options;
    }

    return mod;
  }

  private removeModifier(modifier: Modifier<any, any>) {
    const index = this._modifiers.findIndex((m) => m.name === modifier.name);
    if (index > -1) {
      this._modifiers.splice(index, 1);
    }
  }

  // Temporary workaround for the unguarded environment checks in popperjs code before implementing the package bundling.
  private defineProcess() {
    const script = document.createElement('script');
    script.innerHTML = `var process = { env: {} };`;
    document.head.appendChild(script);
  }

  constructor(partInfo: PartInfo) {
    super(partInfo);
    this._part = partInfo;
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `igcToggle` directive must be attached to an element tag.'
      );
    }
    this.defineProcess();
  }

  public render(target: HTMLElement, open: boolean, options?: IToggleOptions) {
    return this.createToggleInstance(target, open, options);
  }
}

export const igcToggle = directive(IgcToggleDirective);
