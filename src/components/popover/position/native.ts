import { getRoot, isPopoverOpen, setStyles } from '#internals/utils/dom.js';
import { clamp } from '#internals/utils/math.js';
import { applyArrowStyles, type PopoverSide } from './arrow.js';
import {
  getForcedPopoverPositionStrategy,
  type PopoverPositionHost,
  type PopoverPositionStrategy,
  type PopoverPositionStrategyCallbacks,
  resolvePlacement,
  SUPPORTS_ANCHOR_POSITIONING,
} from './types.js';

const OFFSET_PROPERTY = '--_igc-popover-offset';

let implicitAnchorUsable: boolean | undefined;

/**
 * Tests the implicit anchor of `showPopover({ source })` one time.
 *
 * `CSS.supports` cannot detect this feature. Chromium 125 to 132 passes the
 * CSS tests, but it ignores the `source` option. The browser then shows the
 * popover at the centered default position.
 */
function canUseImplicitAnchor(): boolean {
  if (implicitAnchorUsable !== undefined) {
    return implicitAnchorUsable;
  }

  const anchor = document.createElement('div');
  const popover = document.createElement('div');

  popover.popover = 'manual';

  setStyles(anchor, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
  });
  setStyles(popover, {
    margin: '0',
    inset: 'auto',
    border: 'none',
    padding: '0',
    width: '1px',
    height: '1px',
  });
  popover.style.setProperty('position-area', 'bottom');

  try {
    document.body.append(anchor, popover);
    popover.showPopover({ source: anchor });

    // If the browser anchors the popover, the popover sits directly below
    // the anchor of 1 pixel. The tolerance allows for fractional rounding.
    // If the browser ignores `source`, the popover sits at the centered
    // default position, which is far away.
    implicitAnchorUsable =
      Math.abs(popover.getBoundingClientRect().top - 1) <= 1;

    popover.hidePopover();
  } catch {
    implicitAnchorUsable = false;
  } finally {
    anchor.remove();
    popover.remove();
  }

  return implicitAnchorUsable;
}

/**
 * True if the popover can position the `target` with the native CSS anchor
 * positioning.
 *
 * The `source` option accepts an HTMLElement. Therefore the floating-ui
 * fallback positions an anchor that is not an HTML element, for example an
 * SVG element.
 */
export function shouldUseNativeAnchorPositioning(
  target: Element
): target is HTMLElement {
  const forced = getForcedPopoverPositionStrategy();

  if (forced) {
    return forced === 'native';
  }

  return (
    SUPPORTS_ANCHOR_POSITIONING &&
    target instanceof HTMLElement &&
    canUseImplicitAnchor()
  );
}

/**
 * The position strategy that uses the native CSS anchor positioning.
 *
 * The host shows the container with `showPopover({ source: target })`. This
 * call establishes the implicit anchor. The implicit anchor is necessary,
 * because `anchor-name` is tree-scoped and cannot cross the shadow boundary.
 *
 * The CSS rules then do all the positioning. The rules apply only when the
 * `data-anchored` attribute is present. This strategy owns that attribute.
 */
export class NativePositionStrategy implements PopoverPositionStrategy {
  public readonly native = true;

  private readonly _host: PopoverPositionHost;
  private readonly _callbacks: PopoverPositionStrategyCallbacks;

  private _target?: Element;
  private _container?: HTMLElement;
  private _observer?: MutationObserver;
  private _arrowFrame = 0;

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

    container.toggleAttribute('data-anchored', true);
    this._syncOffset();
    this._observeAnchorRemoval(target);
    this._syncArrowWatcher();
  }

  public update(): void {
    this._syncOffset();
    this._syncArrowWatcher();
    this._updateArrow();
    // Once more after layout settles - the container content may still be
    // sizing right after showPopover.
    this._scheduleArrowUpdate();
  }

  public detach(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    this._removeArrowListeners();
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

  private _observeAnchorRemoval(target: Element): void {
    // If the anchor leaves the DOM and returns in the same task, this
    // observer does nothing. The implicit anchor holds an element reference,
    // so the browser anchors the container again.
    // This observer does not detect the removal of a shadow host above the
    // root of the anchor. The fallback strategy does not detect it either.
    this._observer = new MutationObserver(() => {
      if (!target.isConnected) {
        this._callbacks.onAnchorRemoved();
      }
    });

    this._observer.observe(getRoot(target), {
      childList: true,
      subtree: true,
    });
  }

  //#region Arrow support

  /**
   * The CSS rules position the container, but the arrow needs JavaScript.
   * CSS gives no signal about the position-try fallback that the browser
   * applies. Also, a descendant of the container cannot reference the
   * implicit anchor.
   *
   * The strategy calculates the side from the rectangles of the container
   * and the anchor. It repeats the calculation on scroll and on resize while
   * the popover has an arrow.
   */
  private readonly _handleArrowInvalidation = (): void => {
    this._scheduleArrowUpdate();
  };

  /**
   * The listener reference is stable. Therefore `addEventListener` and
   * `removeEventListener` are idempotent, and this method needs no state.
   */
  private _syncArrowWatcher(): void {
    this._host.arrow ? this._addArrowListeners() : this._removeArrowListeners();
  }

  private _addArrowListeners(): void {
    window.addEventListener('scroll', this._handleArrowInvalidation, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', this._handleArrowInvalidation);
  }

  private _removeArrowListeners(): void {
    window.removeEventListener('scroll', this._handleArrowInvalidation, {
      capture: true,
    });
    window.removeEventListener('resize', this._handleArrowInvalidation);

    cancelAnimationFrame(this._arrowFrame);
    this._arrowFrame = 0;
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
    const [base] = resolvePlacement(this._host).split('-') as [PopoverSide];

    // Compare the centers to find the side that the container uses after a
    // flip fallback. This test stays correct for an offset gap and for a
    // negative offset that overlaps the anchor.
    if (base === 'top' || base === 'bottom') {
      const side =
        containerRect.top + containerRect.height / 2 <
        anchorRect.top + anchorRect.height / 2
          ? 'top'
          : 'bottom';

      // Center the arrow on the anchor. Keep the arrow inside the container.
      const x = clamp(
        anchorRect.left +
          anchorRect.width / 2 -
          containerRect.left -
          arrow.offsetWidth / 2,
        0,
        container.clientWidth - arrow.offsetWidth
      );

      applyArrowStyles(arrow, side, x, undefined, arrowOffset);
    } else {
      const side =
        containerRect.left + containerRect.width / 2 <
        anchorRect.left + anchorRect.width / 2
          ? 'left'
          : 'right';

      const y = clamp(
        anchorRect.top +
          anchorRect.height / 2 -
          containerRect.top -
          arrow.offsetHeight / 2,
        0,
        container.clientHeight - arrow.offsetHeight
      );

      applyArrowStyles(arrow, side, undefined, y, arrowOffset);
    }
  }

  //#endregion
}
