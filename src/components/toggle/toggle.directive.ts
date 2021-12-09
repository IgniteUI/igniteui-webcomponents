import { flip } from '@popperjs/core/lib/modifiers';
import {
  createPopper,
  Instance,
  Modifier,
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
  // public styles = styles;
  private style = `
    color: #666;
    background: white;
    border: 1px solid #666;
    font-weight: bold;
    padding: 4px 4px;
    font-size: 13px;
    border-radius: 4px;`;

  private _part: PartInfo;
  private _open = false;
  private _placement: IgcPlacement = 'bottom-start';
  private _strategy: 'absolute' | 'fixed' = 'absolute';
  private _flip = false;
  private _modifiers: Modifier<any, any>[] = [flip];
  private _instance!: Instance;
  private _popperElement!: HTMLElement;
  private _defaultOptions: IToggleOptions = {
    placement: this._placement,
    strategy: this._strategy,
    flip: this._flip,
  };

  /**
   * Creates a popper instance
   * @param target - The element, relative to which, the popper will be positioned.
   * @param open - The initial open state.
   * @param options - The popper configuration options.
   * @returns The popper instance.
   */
  private createToggleInstance(
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions
  ) {
    this._open = open;
    this._popperElement = this.createPopperElement();

    if (this._instance) {
      this.updateToggleOptions(options);
    } else {
      if (!target) {
        return;
      }

      const toggleOptions = Object.assign({}, this._defaultOptions, options);
      this._instance = createPopper(target, this._popperElement, toggleOptions);
    }

    return this._instance.state.elements.popper;
  }

  private createPopperElement() {
    if (!this._popperElement) {
      this._popperElement = (this._part as ElementPart).element as HTMLElement;
      this._popperElement.classList.add('igc-toggle');
      this._popperElement.setAttribute('style', this.style);
    }

    this._open
      ? this._popperElement.classList.remove('igc-toggle--hidden')
      : this._popperElement.classList.add('igc-toggle--hidden');

    return this._popperElement;
  }

  private updateToggleOptions(options?: IToggleOptions) {
    options = Object.assign({}, this._defaultOptions, options);
    const popperOptions: PopperOptions = {
      placement: options.placement,
      strategy: options.strategy,
      modifiers: this.updateModifiers(options),
    };

    this._instance.setOptions(popperOptions);
  }

  private updateModifiers(options: IToggleOptions) {
    const flipModifier = this._modifiers.find((m) => m.name === 'flip');
    this._flip = options.flip ?? this._flip;
    if (flipModifier) {
      flipModifier.enabled = this._flip;
    } else if (this._flip) {
      this._modifiers = [...this._modifiers, flip];
    }

    if (options.offset) {
      this.setOffset(options.offset.x, options.offset.y);
    }
    return this._modifiers;
  }

  /**
   * Offsets the popper along the corresponding axis by the provided amount in pixels.
   * @param deltaX - The amount of offset in horizontal direction.
   * @param deltaY - The amount of offset in vertical direction.
   */
  private setOffset(deltaX: number, deltaY: number) {
    let offset = [deltaX, deltaY];
    if (
      this._placement.toString().includes('left') ||
      this._placement.toString().includes('right')
    ) {
      offset = [deltaY, deltaX];
    }

    this._instance?.setOptions({
      modifiers: [
        ...this._modifiers,
        {
          name: 'offset',
          options: {
            offset: offset,
          },
        },
      ],
    });
    this._instance.update();
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

interface PopperOptions {
  placement: IgcPlacement;
  strategy: 'absolute' | 'fixed';
  modifiers?: Modifier<string, any>[];
}
