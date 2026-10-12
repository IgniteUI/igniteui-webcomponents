import type { PopoverScrollStrategy } from '../../types.js';
import type { PopoverPlacement } from '../popover.js';

/**
 * The capture phase catches the scroll of each ancestor element. The `scroll`
 * event is not cancelable, so a passive listener does not delay the scroll.
 */
export const SCROLL_LISTENER_OPTIONS: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

export type PopoverPositionStrategyMode = 'native' | 'floating';

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

/** The inputs that a position strategy reads from the popover component. */
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

/** Returns the placement, or the default if the attribute is removed. */
export function resolvePlacement(host: PopoverPositionHost): PopoverPlacement {
  return host.placement ?? 'bottom-start';
}
