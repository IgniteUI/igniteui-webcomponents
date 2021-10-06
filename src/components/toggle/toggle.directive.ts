import { flip } from '@popperjs/core/lib/modifiers';
import {
  createPopper,
  Instance,
  Modifier,
} from '@popperjs/core/lib/popper-lite';
import { directive, Directive, PartInfo, ChildPart } from 'lit/directive.js';
import { IgcPlacement, IToggleOptions } from './utilities';

export class IgcToggleDirective extends Directive {
  /** private */
  private styles = `
    color: #666;
    border: 1px solid #666;
    font-weight: bold;
    padding: 4px 4px;
    font-size: 13px;
    border-radius: 4px;`;

  private _part: PartInfo;
  private _open = false;
  private _placement: IgcPlacement = 'right-start';
  private _strategy: 'absolute' | 'fixed' = 'absolute';
  private _flip = false;
  private _modifiers: Modifier<any, any>[] = [flip];
  private _instance!: Instance;

  private _defaultOptions: IToggleOptions = {
    placement: this._placement,
    strategy: this._strategy,
    flip: this._flip,
  };

  private createToggleInstance(
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions
  ) {
    this._open = open;
    const popperElement = this.createPopperElement(this._part as ChildPart);
    if (this._instance) {
      this.updateToggleOptions(options);
      return this._instance.state.elements.popper;
    }

    if (!target) {
      return;
    }

    const toggleOptions = Object.assign({}, this._defaultOptions, options);
    this._instance = createPopper(target, popperElement, toggleOptions);

    return this._instance.state.elements.popper;
  }

  private createPopperElement(part: ChildPart) {
    const popperElement = document.createElement('div');
    const parentNode = part.parentNode as HTMLElement;

    this._open
      ? parentNode.removeAttribute('hidden')
      : parentNode.setAttribute('hidden', 'true');

    popperElement.setAttribute('style', this.styles);
    for (const el of parentNode.children) {
      popperElement.appendChild(el.cloneNode(true));
    }

    return popperElement;
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
      this.setOffset(options.offset[0], options.offset[1] ?? 0);
    }
    return this._modifiers;
  }

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
    this.defineProcess();
  }

  // public update(_part: ChildPart, [target, open, options]: [HTMLElement, boolean, IToggleOptions] ) {
  //   return this.render(target, open, options);
  // }

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
