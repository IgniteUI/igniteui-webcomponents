/**
 * A utility class that wraps AbortController, allowing its signal to be
 * used for event listeners and providing a mechanism to reset it,
 * effectively generating a fresh AbortController instance on subsequent access
 * after an abort call.
 */
class AbortHandle {
  private _controller: AbortController;

  constructor() {
    this._controller = new AbortController();
  }

  /**
   * Returns the AbortSignal associated with the current AbortController instance.
   * This signal can be passed to functions like `addEventListener` or `fetch`.
   */
  public get signal(): AbortSignal {
    return this._controller.signal;
  }

  /**
   * Aborts the current AbortController instance and immediately creates a new,
   * fresh AbortController.
   *
   * Any operations or event listeners associated with the previous signal
   * will be aborted. Subsequent accesses to `signal` will return the
   * signal from the new controller.
   */
  public abort(reason?: unknown): void {
    this._controller.abort(reason);
    this._controller = new AbortController();
  }

  /**
   * Resets the controller without triggering an abort.
   * This is useful if you want to explicitly get a fresh signal without
   * aborting any ongoing operations from the previous signal.
   */
  public reset(): void {
    this._controller = new AbortController();
  }
}

/**
 * Creates and returns an `AbortHandle` object that wraps an AbortController,
 * providing a resettable AbortSignal. This allows you to use the signal for event
 * listeners, fetch requests, or other cancellable operations, and then
 * reset the underlying AbortController to get a fresh signal without
 * needing to create a new wrapper object.
 */
export function createAbortHandle(): AbortHandle {
  return new AbortHandle();
}
