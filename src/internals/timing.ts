/** A restartable timeout handle. See {@link createTimer}. */
export type Timer = {
  /** Whether the timer is currently armed. */
  readonly active: boolean;
  /**
   * Cancels an armed run and arms the timer again. `delay` defaults to the
   * delay given at creation.
   */
  start(delay?: number): void;
  /** Cancels the armed run, if there is one. */
  stop(): void;
};

/** The longest delay `setTimeout` accepts. It runs a longer delay at once. */
const MAX_DELAY = 2 ** 31 - 1;

/**
 * Creates a restartable timeout around `callback`. The callback runs one time
 * at most, `delay` milliseconds after the most recent `start` call. A delay
 * longer than `setTimeout` accepts is capped.
 */
export function createTimer(callback: () => void, defaultDelay = 0): Timer {
  let handle: ReturnType<typeof setTimeout> | undefined;

  return {
    get active(): boolean {
      return handle !== undefined;
    },
    start(delay = defaultDelay): void {
      clearTimeout(handle);
      handle = setTimeout(
        () => {
          handle = undefined;
          callback();
        },
        Math.min(delay, MAX_DELAY)
      );
    },
    stop(): void {
      clearTimeout(handle);
      handle = undefined;
    },
  };
}
