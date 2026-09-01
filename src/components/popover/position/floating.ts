import type * as FloatingUi from '@floating-ui/dom';
import type { Middleware } from '@floating-ui/dom';
import {
  hasStickyAncestor,
  roundByDPR,
  setStyles,
} from '#internals/utils/dom.js';
import { applyArrowStyles, type PopoverSide } from './arrow.js';
import {
  type PopoverPositionHost,
  type PopoverPositionStrategy,
  type PopoverPositionStrategyCallbacks,
  resolvePlacement,
} from './types.js';

type FloatingUiModule = typeof FloatingUi;

/**
 * The module loads on demand when the fallback strategy attaches for the
 * first time. A browser that uses the native strategy never loads it.
 *
 * The published build is ESM and uses no bundler. Therefore the bundler of a
 * consumer can split the code at this import.
 */
let floatingUiModule: FloatingUiModule | undefined;
let floatingUiLoader: Promise<FloatingUiModule> | undefined;

function loadFloatingUi(): Promise<FloatingUiModule> {
  floatingUiLoader ??= import('@floating-ui/dom').then((module) => {
    floatingUiModule = module;
    return module;
  });

  return floatingUiLoader;
}

/**
 * The position strategy that uses `@floating-ui/dom` and JavaScript.
 *
 * The popover uses this strategy if the browser does not support the CSS
 * anchor positioning.
 */
export class FloatingPositionStrategy implements PopoverPositionStrategy {
  public readonly native = false;

  private readonly _host: PopoverPositionHost;
  private readonly _callbacks: PopoverPositionStrategyCallbacks;

  private _target?: Element;
  private _container?: HTMLElement;
  private _dispose?: () => void;
  private _middleware?: Middleware[];
  private _positionId = 0;

  /**
   * Each call to `detach` increments this counter. An `attach` call that
   * waits for the first module load compares the counter. The `attach` call
   * stops if a later call replaced it.
   */
  private _attachId = 0;

  /**
   * The value is `fixed` if an ancestor of the anchor has `position: sticky`.
   * In all other cases the value is `absolute`.
   *
   * The strategy calculates the value one time for each open cycle, because
   * the calculation walks the DOM and forces a style reflow.
   */
  private _strategy: 'absolute' | 'fixed' = 'absolute';

  constructor(
    host: PopoverPositionHost,
    callbacks: PopoverPositionStrategyCallbacks
  ) {
    this._host = host;
    this._callbacks = callbacks;
  }

  public attach(target: Element, container: HTMLElement): void {
    this.detach();

    this._target = target;
    this._container = container;
    this._middleware = undefined;

    // If the popover closes while the anchor is out of view, the container
    // keeps `visibility: hidden`. The first `computePosition` call is
    // asynchronous, so it clears that style too late. Reset the style here.
    // The popover then never opens as invisible.
    setStyles(container, { visibility: '' });

    if (!this._host.sameWidth) {
      // Remove the width that the `sameWidth` option set in a previous open
      // cycle.
      setStyles(container, { width: '' });
    }

    this._strategy = hasStickyAncestor(target) ? 'fixed' : 'absolute';

    if (floatingUiModule) {
      this._startAutoUpdate(floatingUiModule, target, container);
    } else {
      const attachId = this._attachId;

      loadFloatingUi().then((module) => {
        if (attachId === this._attachId) {
          this._startAutoUpdate(module, target, container);
        }
      });
    }
  }

  public update(): void {
    this._middleware = undefined;

    if (!this._host.sameWidth && this._container) {
      setStyles(this._container, { width: '' });
    }

    this._updatePosition();
  }

  public detach(): void {
    this._attachId++;
    this._dispose?.();
    this._dispose = undefined;
  }

  public clear(): void {
    if (this._container) {
      setStyles(this._container, {
        position: '',
        left: '',
        top: '',
        transform: '',
        width: '',
        visibility: '',
      });
    }
  }

  private _startAutoUpdate(
    floating: FloatingUiModule,
    target: Element,
    container: HTMLElement
  ): void {
    this._dispose = floating.autoUpdate(
      target,
      container,
      this._updatePosition.bind(this)
    );
  }

  private _createMiddleware(floating: FloatingUiModule): Middleware[] {
    const host = this._host;

    const chain = [
      host.offset !== 0 ? floating.offset(host.offset) : null,
      host.flip ? floating.flip() : null,
      host.sameWidth
        ? floating.size({
            apply: ({ rects }) => {
              if (this._container) {
                setStyles(this._container, {
                  width: `${rects.reference.width}px`,
                });
              }
            },
          })
        : null,
      host.arrow ? floating.arrow({ element: host.arrow }) : null,
      // This middleware matches `position-visibility: anchors-visible` of the
      // native strategy. It hides the container while the anchor is fully out
      // of view. The `scroll` strategy adds no middleware, which matches
      // `position-visibility: always`.
      host.scrollStrategy !== 'scroll' ? floating.hide() : null,
    ];

    return chain.filter((entry): entry is Middleware => entry !== null);
  }

  private async _updatePosition(): Promise<void> {
    const container = this._container;
    // The module is available whenever `autoUpdate` runs. A pending `attach`
    // positions the container when the module loads. Therefore an update that
    // runs before the first load can stop here.
    const floating = floatingUiModule;

    if (!(this._host.open && container && floating)) {
      return;
    }

    if (!this._target?.isConnected) {
      this._callbacks.onAnchorRemoved();
      return;
    }

    const positionId = ++this._positionId;
    const strategy = this._strategy;

    const { x, y, middlewareData, placement } = await floating.computePosition(
      this._target,
      container,
      {
        placement: resolvePlacement(this._host),
        middleware: (this._middleware ??= this._createMiddleware(floating)),
        strategy,
      }
    );

    if (positionId !== this._positionId || !this._host.open) {
      return;
    }

    setStyles(container, {
      position: strategy,
      left: '0',
      top: '0',
      transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
      visibility: middlewareData.hide?.referenceHidden ? 'hidden' : '',
    });

    const { arrow, arrowOffset } = this._host;

    if (arrow && middlewareData.arrow) {
      const [side] = placement.split('-') as [PopoverSide];
      const { x: arrowX, y: arrowY } = middlewareData.arrow;

      applyArrowStyles(arrow, side, arrowX, arrowY, arrowOffset);
    }
  }
}
