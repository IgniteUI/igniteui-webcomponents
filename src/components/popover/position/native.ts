import { isServer } from 'lit';
import { getRoot, isPopoverOpen } from '#internals/utils/dom.js';
import { toggleEventListener } from '#internals/utils/events.js';
import { clamp } from '#internals/utils/math.js';
import {
  applyArrowStyles,
  getPlacementSide,
  isBlockSide,
  OPPOSITE_SIDE,
} from './arrow.js';
import { PopoverPositionStrategy } from './strategy.js';
import {
  getForcedPopoverPositionStrategy,
  resolvePlacement,
  SCROLL_LISTENER_OPTIONS,
} from './types.js';

const OFFSET_PROPERTY = '--_igc-popover-offset';

let nativeSupport: boolean | undefined;

/**
 * Tests the native CSS anchor positioning once, with a real popover.
 * `CSS.supports` cannot test `showPopover({ source })`, which Chromium 125 to
 * 132 ignores.
 */
function supportsNativeAnchoring(): boolean {
  nativeSupport ??= probeNativeAnchoring();
  return nativeSupport;
}

function probeNativeAnchoring(): boolean {
  if (
    isServer ||
    typeof CSS === 'undefined' ||
    !CSS.supports('anchor-name: --a')
  ) {
    return false;
  }

  const anchor = document.createElement('div');
  const popover = document.createElement('div');

  popover.popover = 'manual';
  anchor.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px';
  // `span-right` also tests the span keywords that the aligned placements need.
  popover.style.cssText =
    'margin:0;inset:auto;border:none;padding:0;width:1px;height:1px;position-area:bottom span-right';

  try {
    document.body.append(anchor, popover);
    popover.showPopover({ source: anchor });

    // An anchored popover sits directly below the 1px anchor. A browser that
    // ignores `source` centers it.
    const anchored = Math.abs(popover.getBoundingClientRect().top - 1) <= 1;

    popover.hidePopover();
    return anchored;
  } catch {
    return false;
  } finally {
    anchor.remove();
    popover.remove();
  }
}

/**
 * True if the native CSS anchor positioning can position the `target`.
 * `source` accepts only an HTMLElement, so an SVG anchor uses the fallback.
 */
export function shouldUseNativeAnchorPositioning(
  target: Element
): target is HTMLElement {
  const forced = getForcedPopoverPositionStrategy();

  if (forced) {
    return forced === 'native';
  }

  return target instanceof HTMLElement && supportsNativeAnchoring();
}

/**
 * The position strategy that uses the native CSS anchor positioning.
 *
 * `showPopover({ source })` sets the implicit anchor, as `anchor-name` cannot
 * cross the shadow boundary. The CSS rules apply only with the `data-anchored`
 * attribute, which this strategy owns.
 */
export class NativePositionStrategy extends PopoverPositionStrategy {
  /** The anchor that the container currently shows against. */
  private _shownSource?: Element;
  private _arrowFrame = 0;

  /**
   * Detects the removal of the anchor. It misses the removal of a shadow host
   * above the anchor root, as the fallback strategy does.
   */
  private readonly _anchorObserver = new MutationObserver(() => {
    if (this._target?.isConnected === false) {
      this._onAnchorRemoved();
    }
  });

  public override attach(target: Element, container: HTMLElement): void {
    super.attach(target, container);

    container.toggleAttribute('data-anchored', true);
    this._anchorObserver.observe(getRoot(target), {
      childList: true,
      subtree: true,
    });
  }

  public show(): void {
    const container = this._container;
    const target = this._target;

    if (!(container && target)) {
      return;
    }

    // The browser binds the implicit anchor only in `showPopover`, so a new
    // anchor needs a hide and a show. The focus moves out and then back.
    if (isPopoverOpen(container)) {
      if (this._shownSource !== target) {
        container.hidePopover();
        container.showPopover({ source: target as HTMLElement });
        this._shownSource = target;
      }
    } else {
      container.showPopover({ source: target as HTMLElement });
      this._shownSource = target;
    }

    this.update();
  }

  public override hide(): void {
    this._shownSource = undefined;
    super.hide();
  }

  public update(): void {
    this._syncOffset();
    this._syncArrowListeners();
    // The browser positions the container. The arrow follows in the next
    // frame, when the content has its final size.
    this._scheduleArrowUpdate();
  }

  public detach(): void {
    this._anchorObserver.disconnect();
    this._syncArrowListeners(false);
  }

  public clear(): void {
    if (this._container) {
      this._container.toggleAttribute('data-anchored', false);
      this._container.style.removeProperty(OFFSET_PROPERTY);
    }
  }

  private _syncOffset(): void {
    this._container?.style.setProperty(
      OFFSET_PROPERTY,
      `${this._host.offset}px`
    );
  }

  //#region Arrow support

  /**
   * The arrow needs JavaScript: CSS gives no position-try signal, and a
   * descendant of the container cannot reference the implicit anchor.
   */
  private readonly _handleArrowInvalidation = (): void => {
    this._scheduleArrowUpdate();
  };

  /** Keeps the invalidation listeners bound while an open popover has an arrow. */
  private _syncArrowListeners(
    active = this._host.arrow != null &&
      this._container != null &&
      isPopoverOpen(this._container)
  ): void {
    toggleEventListener(
      window,
      active,
      'scroll',
      this._handleArrowInvalidation,
      SCROLL_LISTENER_OPTIONS
    );
    toggleEventListener(
      window,
      active,
      'resize',
      this._handleArrowInvalidation
    );

    if (!active) {
      cancelAnimationFrame(this._arrowFrame);
      this._arrowFrame = 0;
    }
  }

  private _scheduleArrowUpdate(): void {
    if (this._arrowFrame || !this._host.arrow) {
      return;
    }

    this._arrowFrame = requestAnimationFrame(() => {
      this._arrowFrame = 0;
      this._updateArrow();
    });
  }

  private _updateArrow(): void {
    const { arrow, arrowOffset } = this._host;
    const target = this._target;
    const container = this._container;

    if (!(arrow && target && container && isPopoverOpen(container))) {
      return;
    }

    const anchorRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const placementSide = getPlacementSide(resolvePlacement(this._host));
    const block = isBlockSide(placementSide);

    // The main axis carries the placement. The cross axis centers the arrow.
    const main = block ? 'top' : 'left';
    const mainSize = block ? 'height' : 'width';
    const cross = block ? 'left' : 'top';
    const crossSize = block ? 'width' : 'height';
    const arrowSize = block ? arrow.offsetWidth : arrow.offsetHeight;
    const containerSize = block
      ? container.clientWidth
      : container.clientHeight;

    // Compare the centers to find the side after a flip. This works for any offset.
    const nearSide =
      containerRect[main] + containerRect[mainSize] / 2 <
      anchorRect[main] + anchorRect[mainSize] / 2;
    const side = nearSide ? main : OPPOSITE_SIDE[main];

    // Center the arrow on the anchor. Keep the arrow inside the container.
    const distance = clamp(
      anchorRect[cross] +
        anchorRect[crossSize] / 2 -
        containerRect[cross] -
        arrowSize / 2,
      0,
      containerSize - arrowSize
    );

    applyArrowStyles(arrow, side, distance, arrowOffset);
  }

  //#endregion
}
