/** A resettable `AbortController`. See {@link createAbortHandle}. */
class AbortHandle {
  /**
   * The current controller, created by a read of `signal`. A handle that
   * aborts without such a read allocates nothing.
   */
  private _controller?: AbortController;

  /** The signal of the current controller. */
  public get signal(): AbortSignal {
    this._controller ??= new AbortController();
    return this._controller.signal;
  }

  /**
   * Aborts the current controller, then drops it. The next read of `signal`
   * gives the signal of a new controller.
   */
  public abort(reason?: unknown): void {
    this._controller?.abort(reason);
    this._controller = undefined;
  }

  /**
   * Drops the current controller without aborting it, to get a new signal
   * while the previous operations continue.
   */
  public reset(): void {
    this._controller = undefined;
  }
}

/**
 * Creates an `AbortHandle`, which wraps an `AbortController` and gives a
 * signal that the caller can reset. An abort or a reset installs a new
 * controller, so the caller keeps the same handle.
 */
export function createAbortHandle(): AbortHandle {
  return new AbortHandle();
}

export type { AbortHandle };
