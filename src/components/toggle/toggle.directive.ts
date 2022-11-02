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
import { noChange } from 'lit';
import type { IgcToggleOptions } from './types.js';
import type { IgcToggleController } from './toggle.controller.js';

export class IgcToggleDirective extends Directive {
  private part: PartInfo;
  private shiftOptions? = {
    mainAxis: true,
  };

  private floatingElement!: HTMLElement;

  private updatePosition(
    target: HTMLElement,
    options: IgcToggleOptions,
    controller?: IgcToggleController
  ) {
    this.floatingElement = this.createFloatingElement(options.open);

    if (!target) {
      if (controller) {
        controller.rendered = Promise.resolve();
      }
      return noChange;
    }

    const promise = computePosition(target, this.floatingElement, {
      placement: options.placement ?? 'bottom-start',
      strategy: options.positionStrategy ?? 'absolute',
      middleware: this.createMiddleware(options),
    }).then(({ x, y }) => {
      Object.assign(this.floatingElement.style, {
        left: 0,
        top: 0,
        transform: `translate(${x}px,${y}px)`,
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

    this.floatingElement.style.display = open ? '' : 'none';

    return this.floatingElement;
  }

  private createMiddleware(options: IgcToggleOptions) {
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

    // Toggling `sameWidth` does not reset the applied style on the floater element
    Object.assign(this.floatingElement.style, { width: '' });

    if (options.sameWidth) {
      const floatingElement = this.floatingElement;
      middleware.push(
        size({
          apply({ rects }) {
            Object.assign(floatingElement.style, {
              width: `${rects.reference.width}px`,
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
    options: IgcToggleOptions,
    controller?: IgcToggleController
  ) {
    return this.updatePosition(target, options, controller);
  }
}

export const igcToggle = directive(IgcToggleDirective);
