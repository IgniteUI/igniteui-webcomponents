import type * as FloatingUi from '@floating-ui/dom';
import type { Dimensions, Middleware, Platform } from '@floating-ui/dom';
import {
  getCSSZoom,
  hasStickyAncestor,
  isPopoverOpen,
  roundByDPR,
  setStyles,
} from '#internals/utils/dom.js';
import {
  applyArrowStyles,
  getPlacementSide,
  OPPOSITE_SIDE,
  setArrowSide,
} from './arrow.js';
import { PopoverPositionStrategy } from './strategy.js';
import { resolvePlacement } from './types.js';

type FloatingUiModule = typeof FloatingUi;

/**
 * Loads at the first attach of the fallback strategy, so a browser that uses
 * the native strategy never loads it. The ESM build lets a consumer bundler
 * split the code at this import.
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

let zoomedPlatform: Platform | undefined;

/**
 * floating-ui measures the anchor in viewport pixels, but the floating element
 * and the arrow in CSS pixels. An ancestor `zoom` makes the two differ, so this
 * platform measures all in viewport pixels.
 */
function getZoomedPlatform({ platform }: FloatingUiModule): Platform {
  zoomedPlatform ??= {
    ...platform,
    // The DOM platform measures synchronously. Stay synchronous, so that a
    // position takes no extra microtasks.
    getDimensions: (element) => {
      const { width, height } = platform.getDimensions(element) as Dimensions;
      const zoom = getCSSZoom(element);

      return { width: width * zoom, height: height * zoom };
    },
  };

  return zoomedPlatform;
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
   * Identifies the open cycle, so a module load callback of a replaced cycle
   * does not start an update.
   */
  private _attachId = 0;

  /**
   * `fixed` for an anchor in the top layer, such as the rectangle anchor of the
   * popover, or if an ancestor of the anchor has `position: sticky`. Else
   * `absolute`.
   * It updates once per open cycle, as the check forces a style reflow.
   */
  private _strategy: 'absolute' | 'fixed' = 'absolute';

  /** Whether the anchor is an open popover, so in the top layer. */
  private _topLayer = false;

  public override attach(target: Element, container: HTMLElement): void {
    super.attach(target, container);

    const attachId = ++this._attachId;

    this._middleware = undefined;

    // Remove the previous inline styles. The first `computePosition` clears a
    // stale `visibility: hidden` too late.
    const reset: Partial<CSSStyleDeclaration> = { visibility: '' };

    if (!this._host.sameWidth) {
      reset.width = '';
    }

    setStyles(container, reset);

    this._topLayer = isPopoverOpen(target);
    this._strategy =
      this._topLayer || hasStickyAncestor(target) ? 'fixed' : 'absolute';

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

    // The positions are in viewport pixels and the styles in CSS pixels. Read
    // the zoom at each position, because a hidden container has no zoom.
    if (offset !== 0) {
      middleware.push(
        floating.offset(() => offset * getCSSZoom(this._container))
      );
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
                width: `${rects.reference.width / getCSSZoom(this._container)}px`,
              });
            }
          },
        })
      );
    }

    if (arrow) {
      middleware.push(floating.arrow({ element: arrow }));
    }

    // Matches the native `position-visibility`: `anchors-visible`, or `always`
    // for the `scroll` strategy. An anchor in the top layer is never clipped.
    if (scrollStrategy !== 'scroll' && !this._topLayer) {
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
    const requested = resolvePlacement(this._host);
    const { arrow, arrowOffset } = this._host;

    // The part can give the arrow its size, and the `arrow` middleware measures
    // it. `flip` keeps the axis, so a flipped side part can stay.
    if (arrow) {
      const side = getPlacementSide(requested);

      if (!arrow.part.contains(OPPOSITE_SIDE[side])) {
        setArrowSide(arrow, side);
      }
    }

    const { x, y, middlewareData, placement } = await floating.computePosition(
      this._target,
      container,
      {
        placement: requested,
        middleware: (this._middleware ??= this._createMiddleware(floating)),
        platform: getZoomedPlatform(floating),
        strategy,
      }
    );

    if (positionId !== this._positionId || !this._host.open) {
      return;
    }

    const zoom = getCSSZoom(container);

    setStyles(container, {
      position: strategy,
      left: '0',
      top: '0',
      transform: `translate(${roundByDPR(x / zoom)}px,${roundByDPR(y / zoom)}px)`,
      visibility: middlewareData.hide?.referenceHidden ? 'hidden' : '',
    });

    // The `arrow` middleware can shift the container for a small anchor. Its
    // arrow data mixes the units under a `zoom`, so center the arrow from the
    // client rectangles.
    if (arrow && middlewareData.arrow) {
      applyArrowStyles(
        arrow,
        container,
        this._target.getBoundingClientRect(),
        getPlacementSide(placement),
        arrowOffset
      );
    }
  }
}
