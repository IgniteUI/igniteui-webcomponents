import { isServer } from 'lit';
import { createTimer, withDeadline } from '../timing.js';

/**
 * `scrollend` reports exactly when a scroll has settled. Safari before 18.2
 * does not have it, and {@link waitForScrollSettled} falls back to a
 * scroll-idle timer there.
 */
const SUPPORTS_SCROLL_END = !isServer && 'onscrollend' in window;

/** How long the scroll position must stay unchanged to count as settled. */
const SCROLL_IDLE_MS = 100;

/** Resolves on the next `scrollend` event of `target`. */
export function waitForScrollEnd(
  target: EventTarget,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve) => {
    target.addEventListener('scrollend', () => resolve(), {
      once: true,
      signal,
    });
  });
}

/**
 * Resolves when no `scroll` event arrives on `target` for `idleMs`: the
 * closest replacement for `scrollend`. The timer starts immediately, so a
 * scroll that does not move still settles.
 */
export function waitForScrollIdle(
  target: EventTarget,
  signal: AbortSignal,
  idleMs = SCROLL_IDLE_MS
): Promise<void> {
  return new Promise((resolve) => {
    const idle = createTimer(resolve, idleMs);
    idle.start();

    target.addEventListener('scroll', () => idle.start(), {
      passive: true,
      signal,
    });
    signal.addEventListener('abort', () => idle.stop(), { once: true });
  });
}

/**
 * Resolves when a scroll on `target` has settled: through `scrollend` where
 * the browser has it, otherwise through a scroll-idle timer.
 */
export function waitForScrollSettled(
  target: EventTarget,
  signal: AbortSignal
): Promise<void> {
  return SUPPORTS_SCROLL_END
    ? waitForScrollEnd(target, signal)
    : waitForScrollIdle(target, signal);
}

/**
 * Runs `scroll`, which applies a scroll to `target`, and resolves when that
 * scroll has settled or after `deadlineMs`, whichever comes first.
 *
 * The settle listener is attached before `scroll` runs. An instant scroll
 * can settle before a listener that is attached afterwards sees anything.
 * `scrollend` does not fire for a scroll that does not move the position,
 * so callers should skip the call in that case; the deadline covers it
 * otherwise.
 */
export function scrollAndWaitForSettled(
  target: EventTarget,
  scroll: () => void,
  deadlineMs: number
): Promise<void> {
  return withDeadline(deadlineMs, (signal) => {
    const settled = waitForScrollSettled(target, signal);
    scroll();
    return settled;
  });
}
