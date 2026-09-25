/** A restartable timeout handle. See {@link createTimer}. */
export type Timer = {
  /** Whether the timer is currently armed. */
  readonly active: boolean;
  /** Arms the timer, cancels an armed run, and defaults `delay`. */
  start(delay?: number): void;
  /** Cancels the armed run, if there is one. */
  stop(): void;
};

/**
 * Creates a restartable timeout around `callback`. The callback runs one time
 * at most, `delay` milliseconds after the most recent `start` call.
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
