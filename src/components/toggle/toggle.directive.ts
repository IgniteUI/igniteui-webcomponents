import {
  computePosition,
  flip,
  offset,
  shift,
  size,
  Middleware,
  autoUpdate,
  ComputePositionConfig,
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

/* blazorSuppressComponent */
export class IgcToggleDirective extends Directive {
  private part: PartInfo;

  private _floatingElement!: HTMLElement;
  private _dispose!: Function;

  private target!: HTMLElement;
  private options!: IgcToggleOptions;
  private controller?: IgcToggleController;

  private get floatingElement() {
    if (!this._floatingElement) {
      this._floatingElement = (this.part as ElementPart).element as HTMLElement;
    }

    Object.assign(this._floatingElement.style, {
      display: this.options.open ? '' : 'none',
    });

    return this._floatingElement;
  }

  private dispose() {
    if (this._dispose) {
      this._dispose();
    }
  }

  private notifyController(promise: Promise<void>) {
    if (this.controller) {
      this.controller.rendered = promise;
    }
  }

  private updatePosition() {
    this.dispose();

    if (!this.floatingElement || !this.target || !this.options.open) {
      return noChange;
    }

    this._dispose = autoUpdate(
      this.target,
      this.floatingElement,
      this.reposition
    );

    return noChange;
  }

  private reposition = () => {
    if (!this.target) {
      this.dispose();
      this.notifyController(Promise.resolve());
      return noChange;
    }

    const config: Partial<ComputePositionConfig> = {
      placement: this.options.placement ?? 'bottom-start',
      strategy: this.options.positionStrategy ?? 'absolute',
      middleware: this.createMiddleware(this.options),
    };

    const promise = computePosition(
      this.target,
      this.floatingElement,
      config
    ).then(({ x, y }) => {
      Object.assign(this.floatingElement.style, {
        left: 0,
        top: 0,
        transform: `translate(${x}px,${y}px)`,
      });
    });

    this.notifyController(promise);
    return noChange;
  };

  private createMiddleware(options: IgcToggleOptions) {
    const middleware: Middleware[] = [];
    const { style: floatingStyles } = this._floatingElement;

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

    middleware.push(
      shift({
        mainAxis: true,
      })
    );

    if (options.sameWidth) {
      middleware.push(
        size({
          apply: ({ rects }) => {
            Object.assign(floatingStyles, {
              width: `${rects.reference.width}px`,
            });
          },
        })
      );
    } else {
      // Reset previously applied `same-width` styles
      Object.assign(floatingStyles, { width: '' });
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
    Object.assign(this, { target, options, controller });
    return this.updatePosition();
  }
}

export const igcToggle = directive(IgcToggleDirective);
