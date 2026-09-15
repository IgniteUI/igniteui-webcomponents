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

/**
 * Resolves after `ms`. An abort of `signal` stops the timer, so no live
 * handle remains once the other side of a race has settled.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = createTimer(resolve, ms);
    timer.start();
    signal.addEventListener('abort', () => timer.stop(), { once: true });
  });
}

/**
 * Resolves with `task` or with a deadline of `ms`, whichever comes first.
 * The signal then tears down the other, so no live timer or dangling
 * listener remains.
 */
export function withDeadline(
  ms: number,
  task: (signal: AbortSignal) => Promise<void>
): Promise<void> {
  const controller = new AbortController();

  return Promise.race([
    task(controller.signal),
    delay(ms, controller.signal),
  ]).finally(() => controller.abort());
}

/**
 * Resolves on the next animation frame, or after `deadlineMs` when no frame
 * arrives. A hidden tab or a disconnected element gets no frames, and a
 * caller that waits for layout must still settle there. That state has no
 * layout to wait for, so an early resolve is safe.
 */
export function nextAnimationFrame(deadlineMs: number): Promise<void> {
  return withDeadline(
    deadlineMs,
    (signal) =>
      new Promise((resolve) => {
        const id = requestAnimationFrame(() => resolve());
        signal.addEventListener('abort', () => cancelAnimationFrame(id), {
          once: true,
        });
      })
  );
}
