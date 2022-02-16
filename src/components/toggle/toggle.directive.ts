import { flip, offset, preventOverflow } from '@popperjs/core/lib/modifiers';
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
import { IgcPlacement, IOverflowOptions, IToggleOptions } from './utilities.js';
import { styles } from './toggle.material.css';

export class IgcToggleDirective extends Directive {
  /** @private */
  public static styles = styles;

  private part: PartInfo;
  private placement: IgcPlacement = 'bottom-start';
  private strategy: 'absolute' | 'fixed' = 'absolute';
  private flip = false;
  private preventOverflow: IOverflowOptions | undefined = {
    mainAxis: true,
  };
  private offset: { x: number; y: number } | undefined;
  private modifiers: Modifier<any, any>[] = [];
  private instance!: Instance;
  private popperElement!: HTMLElement;
  private defaultOptions: IToggleOptions = {
    placement: this.placement,
    positionStrategy: this.strategy,
    flip: this.flip,
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
    this.popperElement = this.createPopperElement(open);

    const popperOptions = this.createPopperOptions(options);

    if (!this.instance) {
      if (!target) {
        return;
      }
      this.instance = createPopper(target, this.popperElement, popperOptions);
    } else {
      if (this.instance.state.elements.reference !== target) {
        this.instance.state.elements.reference = target;
      }
      this.updatePopperOptions(popperOptions);
    }

    return this.instance.state.elements.popper;
  }

  /** Gets the popper element and sets the specified open state. */
  private createPopperElement(open = false) {
    if (!this.popperElement) {
      this.popperElement = (this.part as ElementPart).element as HTMLElement;
    }

    open
      ? (this.popperElement.style.display = '')
      : (this.popperElement.style.display = 'none');

    return this.popperElement;
  }

  private createPopperOptions(options?: IToggleOptions) {
    options = options
      ? Object.assign({}, this.defaultOptions, options)
      : this.defaultOptions;
    this.placement = options.placement;
    this.strategy = options.positionStrategy ?? this.strategy;
    this.modifiers = this.updateModifiers(options);
    return {
      placement: this.placement,
      strategy: this.strategy,
      modifiers: this.modifiers,
    };
  }

  /** Updates the options of the popper instance. */
  private updatePopperOptions(
    options: Partial<OptionsGeneric<Modifier<any, any>>>
  ) {
    this.instance?.setOptions(options);
    this.instance?.update();
  }

  /** Updates the popper modifiers. */
  private updateModifiers(options: IToggleOptions) {
    this.updateFlip(options);
    this.updateOffset(options);
    this.updatePreventOverflow();
    this.updateSameWidth(options);

    return this.modifiers;
  }

  private updateFlip(options: IToggleOptions) {
    if (options.flip && this.flip !== options.flip) {
      this.flip = options.flip;
      this.flip ? this.addModifier(flip) : this.removeModifier(flip);
    }
  }

  private updateOffset(options: IToggleOptions) {
    if (this.offset !== options.offset) {
      this.offset = options.offset;
      this.offset
        ? this.setOffset(this.offset.x, this.offset.y)
        : this.removeModifier(offset);
    }
  }

  private updatePreventOverflow() {
    this.preventOverflow
      ? this.addModifier(preventOverflow, this.preventOverflow)
      : this.removeModifier(preventOverflow);
  }

  private updateSameWidth(options: IToggleOptions) {
    options.sameWidth
      ? this.addModifier(this.sameWidthModifier())
      : this.removeModifier(this.sameWidthModifier());
  }

  /** Custom modifier that makes the popper the same width as the target element. */
  private sameWidthModifier(): Modifier<'sameWidth', null> {
    return {
      name: 'sameWidth',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: ({ state }) => {
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      effect: ({ state }) => {
        state.elements.popper.style.width = `${
          state.elements.reference.getBoundingClientRect().width
        }px`;
      },
    };
  }

  /**
   * Offsets the popper along the corresponding axis by the provided amount in pixels.
   * @param deltaX - The amount of offset in horizontal direction.
   * @param deltaY - The amount of offset in vertical direction.
   */
  private setOffset(deltaX: number, deltaY: number) {
    let offsetValue = [deltaX, deltaY];
    if (
      this.placement.toString().includes('left') ||
      this.placement.toString().includes('right')
    ) {
      offsetValue = [deltaY, deltaX];
    }

    this.addModifier(offset, { offset: offsetValue });
  }

  private addModifier(modifier: Modifier<any, any>, options?: any) {
    let mod = this.modifiers.find((m) => m.name === modifier.name);
    if (!mod) {
      mod = modifier;
      this.modifiers.push(mod);
    }
    if (options && mod.options !== options) {
      mod.options = options;
    }

    return mod;
  }

  private removeModifier(modifier: Modifier<any, any>) {
    const index = this.modifiers.findIndex((m) => m.name === modifier.name);
    if (index > -1) {
      this.modifiers.splice(index, 1);
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
    this.part = partInfo;
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
