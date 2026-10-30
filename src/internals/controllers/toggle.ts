import type { LitElement } from 'lit';
import { createAbortHandle } from '../abort-handler.js';

/**
 * The events that a {@link ToggleController} sends. Include them, or a subset
 * of them, in the event map of a host to document them.
 */
export interface ToggleEventMap {
  /** Sent before an open. Cancelable; a prevented event stops the sequence. */
  igcOpening: CustomEvent<unknown>;
  /** Sent after the host opens and its transition ends. */
  igcOpened: CustomEvent<unknown>;
  /** Sent before a close. Cancelable; a prevented event stops the sequence. */
  igcClosing: CustomEvent<unknown>;
  /** Sent after the host closes and its transition ends. */
  igcClosed: CustomEvent<unknown>;
}

/**
 * A toggleable host must give the `emitEvent` method of the event-emitter
 * mixin. Extend {@link ../mixins/event-emitter.js#EventEmitterMixin | EventEmitterMixin}
 * with the {@link ToggleEventMap}, or with a subset of it.
 */
type ToggleHost = LitElement & {
  open: boolean;
  emitEvent(name: string, init?: CustomEventInit): boolean;
};

/**
 * Runs the visual transition of the host to the requested state: it sets
 * `open`, plays the animations and awaits the updates. A resolved `false`
 * marks the transition as superseded, and the controller then sends no
 * trailing "-ed" event.
 *
 * The signal aborts when a newer request or a direct change of `open` takes
 * over. The transition then stops its animations and changes no more state.
 */
type ToggleTransitionFunction = (
  open: boolean,
  signal: AbortSignal
) => Promise<boolean> | boolean;

type ToggleControllerOptions = {
  /**
   * The host transition. Without one, the controller sets `host.open` itself
   * and the transition always counts as complete.
   */
  transition?: ToggleTransitionFunction;
  /** The factory for the `detail` payload of the events. */
  detail?: () => unknown;
};

/**
 * Implements the open and close sequence of every toggleable component.
 *
 * @remarks
 * The sequence stops when the host is already in the requested state, sends
 * the cancelable `igcOpening` or `igcClosing` event, runs the host
 * transition, awaits the host update, then sends `igcOpened` or `igcClosed`.
 * The events run only when the caller asks for them.
 *
 * The controller has no life cycle, so the host does not register it. A host
 * whose transition outlives a task calls {@link ToggleController.sync} from
 * its `open` setter.
 */
class ToggleController {
  private readonly _host: ToggleHost;
  private readonly _options: ToggleControllerOptions;

  /**
   * The target of an operation in flight. A transition can set `host.open` at
   * its end only.
   */
  private _pending?: boolean;

  /** Incremented per operation. A superseded operation stops. */
  private _generation = 0;

  /** Aborts the transition of the operation in flight. */
  private readonly _abort = createAbortHandle();

  constructor(host: ToggleHost, options?: ToggleControllerOptions) {
    this._host = host;
    this._options = { ...options };
  }

  /**
   * Sends the event through the host `emitEvent`. Consumers and framework
   * wrappers observe that one method.
   */
  private _emit(
    name: keyof ToggleEventMap,
    cancelable: boolean,
    detail: unknown = this._options.detail?.call(this._host)
  ): boolean {
    const host = this._host;

    // Omit the falsy keys, so `emitEvent` applies its own defaults.
    return host.emitEvent(name, {
      ...(cancelable && { cancelable }),
      ...(detail !== undefined && { detail }),
    });
  }

  /** Ends the operation in flight, if any, and starts a new generation. */
  private _supersede(): number {
    this._pending = undefined;
    this._abort.abort();
    return ++this._generation;
  }

  private async _setOpenState(
    open: boolean,
    emitEvents: boolean,
    detail?: unknown
  ): Promise<boolean> {
    const host = this._host;
    const { transition } = this._options;

    if ((this._pending ?? host.open) === open) {
      return false;
    }

    if (
      emitEvents &&
      !this._emit(open ? 'igcOpening' : 'igcClosing', true, detail)
    ) {
      return false;
    }

    const generation = this._supersede();
    this._pending = open;

    // The default transition is synchronous, so the state change and the
    // `updateComplete` subscription stay in the microtask of the caller.
    let completed = true;
    try {
      if (transition) {
        completed =
          (await transition.call(host, open, this._abort.signal)) !== false;
      } else {
        host.open = open;
      }
    } finally {
      // A newer operation owns the pending state from here on.
      if (generation === this._generation) {
        this._pending = undefined;
        this._abort.reset();
      }
    }

    if (generation !== this._generation) {
      return false;
    }

    if (emitEvents && completed) {
      await host.updateComplete;

      // A newer operation can take over while the update settles.
      if (generation !== this._generation) {
        return false;
      }

      this._emit(open ? 'igcOpened' : 'igcClosed', false, detail);
    }

    return completed;
  }

  /*
   * The methods below are not `async`. An `async` wrapper adds microtask
   * hops, which shift the timing of caller code against `updateComplete`.
   */

  /**
   * Opens the host, and sends `igcOpening` and `igcOpened` when `emitEvents`
   * is true. Returns `false` when the host is already open or opening, the
   * opening event is canceled, a later request supersedes this one, or the
   * transition is interrupted.
   */
  public show(emitEvents = false): Promise<boolean> {
    return this._setOpenState(true, emitEvents);
  }

  /**
   * Closes the host, and sends `igcClosing` and `igcClosed` when `emitEvents`
   * is true. A `detail` other than `undefined` replaces the one of the
   * `detail` option in both events. Returns `false` when the host is already closed or closing, the
   * closing event is canceled, a later request supersedes this one, or the
   * transition is interrupted.
   */
  public hide(emitEvents = false, detail?: unknown): Promise<boolean> {
    return this._setOpenState(false, emitEvents, detail);
  }

  /** Opens the host, or closes it, based on its current state. */
  public toggle(emitEvents = false): Promise<boolean> {
    return this._host.open ? this.hide(emitEvents) : this.show(emitEvents);
  }

  /**
   * Reports a change of `host.open`; call it from the `open` setter. A value
   * against the request in flight means that the application took over: the
   * request resolves `false`, and the signal of its transition aborts.
   */
  public sync(open: boolean): void {
    if (this._pending !== undefined && open !== this._pending) {
      this._supersede();
    }
  }
}

/** Creates a {@link ToggleController} for the given host. */
export function addToggleController(
  host: ToggleHost,
  options?: ToggleControllerOptions
): ToggleController {
  return new ToggleController(host, options);
}

export type { ToggleController, ToggleControllerOptions, ToggleHost };
