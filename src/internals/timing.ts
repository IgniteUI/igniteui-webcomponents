/**
 * A restartable timeout handle. See {@link createTimer}.
 */
export type Timer = {
  /** Whether the timer is currently armed. */
  readonly active: boolean;
  /**
   * (Re)arms the timer, canceling a previously armed run.
   *
   * When `delay` is omitted, the default delay of the timer is used.
   */
  start(delay?: number): void;
  /** Cancels the armed run, if any. */
  stop(): void;
};

/**
 * Creates a restartable timeout around `callback`.
 *
 * Every `start` supersedes the previous one, so the callback runs at most once,
 * `delay` milliseconds after the most recent `start` - the recurring
 * "clear the stored handle, then set it again" bookkeeping is kept in one place.
 *
 * @example
 * ```typescript
 * const timer = createTimer(() => this.hideTooltip(), 500);
 *
 * timer.start(); // arms the timer with the default delay
 * timer.start(1000); // supersedes the run above
 * timer.stop(); // cancels it altogether
 * ```
 */
export function createTimer(callback: () => void, defaultDelay = 0): Timer {
  let handle: ReturnType<typeof setTimeout> | undefined;

  return {
    get active(): boolean {
      return handle !== undefined;
    },
    start(delay = defaultDelay): void {
      clearTimeout(handle);
      handle = setTimeout(() => {
        handle = undefined;
        callback();
      }, delay);
    },
    stop(): void {
      clearTimeout(handle);
      handle = undefined;
    },
  };
}
