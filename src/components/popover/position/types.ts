import { isServer } from 'lit';
import type { PopoverScrollStrategy } from '../../types.js';
import type { PopoverPlacement } from '../popover.js';

/**
 * True if the browser supports the CSS features that the native strategy
 * needs.
 *
 * `CSS.supports` cannot detect the implicit anchor of
 * `showPopover({ source })`. The `native.ts` module tests that feature
 * separately.
 */
export const SUPPORTS_ANCHOR_POSITIONING =
  !isServer &&
  typeof CSS !== 'undefined' &&
  CSS.supports('anchor-name: --a') &&
  // Some engines support only a part of the `position-area` grammar. The
  // aligned placements need the span keywords, so test one of them.
  CSS.supports('position-area: top span-right');

type PopoverPositionStrategyMode = 'native' | 'floating';

let forcedStrategy: PopoverPositionStrategyMode | undefined;

/** @internal Forces one position strategy. Only the tests call this function. */
export function setPopoverPositionStrategy(
  mode?: PopoverPositionStrategyMode
): void {
  forcedStrategy = mode;
}

/** @internal Returns the forced position strategy, if the tests set one. */
export function getForcedPopoverPositionStrategy():
  | PopoverPositionStrategyMode
  | undefined {
  return forcedStrategy;
}

/**
 * The read-only inputs that a position strategy reads from the popover
 * component.
 */
export interface PopoverPositionHost {
  /** The value is null or undefined at run time if the attribute is removed. */
  readonly placement: PopoverPlacement | null | undefined;
  readonly offset: number;
  readonly flip: boolean;
  readonly sameWidth: boolean;
  readonly arrow: HTMLElement | null;
  readonly arrowOffset: number;
  readonly open: boolean;
  readonly scrollStrategy: PopoverScrollStrategy;
}

/**
 * Returns the placement of the host. Returns the default placement if the
 * attribute is removed.
 */
export function resolvePlacement(host: PopoverPositionHost): PopoverPlacement {
  return host.placement ?? 'bottom-start';
}

export interface PopoverPositionStrategyCallbacks {
  /**
   * The strategy calls this callback if the anchor leaves the DOM while the
   * popover is open. The host then hides the container. The host does not
   * change the `open` property.
   */
  onAnchorRemoved(): void;
}

export interface PopoverPositionStrategy {
  /**
   * True if the strategy uses the native CSS anchor positioning. If it is
   * true, the host shows the container with `showPopover({ source })`.
   */
  readonly native: boolean;

  /** Starts to position the `container` against the `target`. */
  attach(target: Element, container: HTMLElement): void;

  /** Positions the container again after a host property changes. */
  update(): void;

  /** Stops all observers, listeners and pending updates of the strategy. */
  detach(): void;

  /**
   * Removes the styles and the attributes that the strategy owns from the
   * container. The host calls this method when it changes the strategy.
   */
  clear(): void;
}
