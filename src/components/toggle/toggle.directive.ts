import {
  computePosition,
  flip,
  offset,
  shift,
  size,
  Middleware,
} from '@floating-ui/dom';
import {
  directive,
  Directive,
  PartInfo,
  ElementPart,
  PartType,
} from 'lit/directive.js';
import { IToggleOptions } from './utilities.js';
import { noChange } from 'lit';
import { IgcToggleController } from './toggle.controller.js';

export class IgcToggleDirective extends Directive {
  private part: PartInfo;
  private shiftOptions? = {
    mainAxis: true,
  };

  private floatingElement!: HTMLElement;
  private defaultOptions: IToggleOptions = {
    placement: 'bottom-start',
    positionStrategy: 'absolute',
    flip: false,
  };

  private updatePosition(
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions,
    controller?: IgcToggleController
  ) {
    options = options
      ? Object.assign({}, this.defaultOptions, options)
      : this.defaultOptions;

    this.floatingElement = this.createFloatingElement(open);

    if (!target) {
      if (controller) {
        controller.rendered = Promise.resolve();
      }
      return noChange;
    }

    const promise = computePosition(target, this.floatingElement, {
      placement: options.placement,
      strategy: options.positionStrategy,
      middleware: this.createMiddleware(options),
    }).then(({ x, y }) => {
      Object.assign(this.floatingElement.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });

    if (controller) {
      controller.rendered = promise;
    }

    return noChange;
  }

  private createFloatingElement(open = false) {
    if (!this.floatingElement) {
      this.floatingElement = (this.part as ElementPart).element as HTMLElement;
    }

    open
      ? (this.floatingElement.style.display = '')
      : (this.floatingElement.style.display = 'none');

    return this.floatingElement;
  }

  private createMiddleware(options: IToggleOptions) {
    const middleware: Middleware[] = [];

    if (options.distance) {
      middleware.push(
        offset({
          mainAxis: options.distance,
        })
      );
    }

    if (options.flip) {
      middleware.push(flip());
    }

    if (this.shiftOptions) {
      middleware.push(shift(this.shiftOptions));
    }

    if (options.sameWidth) {
      const floatingElement = this.floatingElement;
      middleware.push(
        size({
          apply({ reference }) {
            Object.assign(floatingElement.style, {
              width: `${reference.width}px`,
            });
          },
        })
      );
    }

    return middleware;
  }

  constructor(partInfo: PartInfo) {
    super(partInfo);
    this.part = partInfo;
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `igcToggle` directive must be attached to an element tag.'
      );
    }
  }

  public render(
    target: HTMLElement,
    open: boolean,
    options?: IToggleOptions,
    controller?: IgcToggleController
  ) {
    return this.updatePosition(target, open, options, controller);
  }
}

export const igcToggle = directive(IgcToggleDirective);
