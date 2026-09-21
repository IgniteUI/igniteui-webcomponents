import type * as FloatingUi from '@floating-ui/dom';
import type { Middleware } from '@floating-ui/dom';
import {
  hasStickyAncestor,
  isPopoverOpen,
  roundByDPR,
  setStyles,
} from '#internals/utils/dom.js';
import { applyArrowStyles, getPlacementSide } from './arrow.js';
import { PopoverPositionStrategy } from './strategy.js';
import { resolvePlacement } from './types.js';

type FloatingUiModule = typeof FloatingUi;

/**
 * The module loads on demand, at the first attach of the fallback strategy. A
 * browser that uses the native strategy never loads it. The published build
 * is ESM, so the bundler of a consumer can split the code at this import.
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
 * The fallback strategy, for a browser without the native CSS anchor
 * positioning. It positions the container with `@floating-ui/dom`.
 */
export class FloatingPositionStrategy extends PopoverPositionStrategy {
  private _dispose?: () => void;
  private _middleware?: Middleware[];
  private _positionId = 0;

  /** The module load of the current open cycle, with its first position. */
  private _pendingLoad?: Promise<unknown>;

  /** The position update that runs now. */
  private _pendingPosition?: Promise<void>;

  /**
   * Identifies the open cycle. Each `attach` and `detach` increments it.
   * Every `attach` chains a callback onto the shared module loader, so a
   * callback of a replaced cycle must not start an update.
   */
  private _attachId = 0;

  /**
   * `fixed` if an ancestor of the anchor has `position: sticky`, `absolute`
   * in all other cases. The value updates one time for each open cycle,
   * because the calculation walks the DOM and forces a style reflow.
   */
  private _strategy: 'absolute' | 'fixed' = 'absolute';

  public override attach(target: Element, container: HTMLElement): void {
    super.attach(target, container);

    const attachId = ++this._attachId;

    this._middleware = undefined;

    // Remove the inline styles of the previous open cycle. A popover that
    // closes while the anchor is out of view keeps `visibility: hidden`, and
    // the first `computePosition` clears it too late.
    const reset: Partial<CSSStyleDeclaration> = { visibility: '' };

    if (!this._host.sameWidth) {
      reset.width = '';
    }

    setStyles(container, reset);

    this._strategy = hasStickyAncestor(target) ? 'fixed' : 'absolute';

    if (floatingUiModule) {
      this._startAutoUpdate(floatingUiModule, target, container);
      return;
    }

    // `autoUpdate` positions the container one time before it returns, so
    // the pending position of that call completes the load.
    this._pendingLoad = loadFloatingUi().then((module) => {
      if (attachId !== this._attachId) {
        return undefined;
      }

      this._startAutoUpdate(module, target, container);
      return this._pendingPosition;
    });
  }

  /**
   * This strategy loads its module on demand and then positions
   * asynchronously, so the host waits for both.
   */
  public override async whenPositioned(): Promise<void> {
    await this._pendingLoad;
    await this._pendingPosition;
  }

  public show(): void {
    if (this._container && !isPopoverOpen(this._container)) {
      this._container.showPopover();
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
    this._pendingLoad = undefined;
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
    const { offset, flip, sameWidth, arrow, scrollStrategy } = this._host;
    const middleware: Middleware[] = [];

    if (offset !== 0) {
      middleware.push(floating.offset(offset));
    }

    if (flip) {
      middleware.push(floating.flip());
    }

    if (sameWidth) {
      middleware.push(
        floating.size({
          apply: ({ rects }) => {
            if (this._container) {
              setStyles(this._container, {
                width: `${rects.reference.width}px`,
              });
            }
          },
        })
      );
    }

    if (arrow) {
      middleware.push(floating.arrow({ element: arrow }));
    }

    // `hide()` matches `position-visibility: anchors-visible` of the native
    // strategy. The `scroll` strategy adds no middleware, which matches
    // `position-visibility: always`.
    if (scrollStrategy !== 'scroll') {
      middleware.push(floating.hide());
    }

    return middleware;
  }

  private _updatePosition(): Promise<void> {
    this._pendingPosition = this._computePosition();
    return this._pendingPosition;
  }

  private async _computePosition(): Promise<void> {
    const container = this._container;
    // A pending `attach` positions the container when the module loads, so an
    // update before the first load can stop here.
    const floating = floatingUiModule;

    if (!(this._host.open && container && floating)) {
      return;
    }

    if (!this._target?.isConnected) {
      this._onAnchorRemoved();
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
      const { x: arrowX, y: arrowY } = middlewareData.arrow;

      applyArrowStyles(
        arrow,
        getPlacementSide(placement),
        arrowX ?? arrowY ?? 0,
        arrowOffset
      );
    }
  }
}
