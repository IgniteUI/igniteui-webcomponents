import type { LitElement } from 'lit';

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
 * marks the transition as superseded, for example by a newer animation, and
 * the controller then sends no trailing "-ed" event.
 */
type ToggleTransitionFunction = (open: boolean) => Promise<boolean> | boolean;

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
 * The host keeps its public `open`, `show()`, `hide()` and `toggle()` members
 * and delegates to the controller. Unlike the other controllers here, the
 * host does not register it; it has no life-cycle of its own.
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

  constructor(host: ToggleHost, options?: ToggleControllerOptions) {
    this._host = host;
    this._options = { ...options };
  }

  /**
   * Sends the event through the host `emitEvent`. Consumers and framework
   * wrappers observe that one method.
   */
  private _emit(name: keyof ToggleEventMap, cancelable: boolean): boolean {
    const host = this._host;
    const detail = this._options.detail?.call(host);

    // The init omits both keys instead of a falsy value. `emitEvent` then
    // applies its own defaults, and the init of a plain event stays empty.
    return host.emitEvent(name, {
      ...(cancelable && { cancelable }),
      ...(detail !== undefined && { detail }),
    });
  }

  private async _setOpenState(
    open: boolean,
    emitEvents: boolean
  ): Promise<boolean> {
    const host = this._host;
    const { transition } = this._options;

    if ((this._pending ?? host.open) === open) {
      return false;
    }

    if (emitEvents && !this._emit(open ? 'igcOpening' : 'igcClosing', true)) {
      return false;
    }

    const generation = ++this._generation;
    this._pending = open;

    // The default transition is synchronous, so the state change and the
    // `updateComplete` subscription stay in the microtask of the caller.
    let completed = true;
    try {
      if (transition) {
        completed = (await transition.call(host, open)) !== false;
      } else {
        host.open = open;
      }
    } finally {
      // A newer operation owns the pending state from here on.
      if (generation === this._generation) {
        this._pending = undefined;
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

      this._emit(open ? 'igcOpened' : 'igcClosed', false);
    }

    return completed;
  }

  /*
   * The methods below return the underlying promise instead of being `async`.
   * An `async` wrapper costs extra microtask hops, which shift the timing of
   * caller code, for example focus management, against `updateComplete`.
   */

  /**
   * Opens the host, wrapped in the `igcOpening` and `igcOpened` events when
   * `emitEvents` is true. Returns `false` when the host is already open or
   * moves there, when the consumer canceled the opening event, when a later
   * request supersedes this one, or when the transition reports an
   * interruption.
   */
  public show(emitEvents = false): Promise<boolean> {
    return this._setOpenState(true, emitEvents);
  }

  /**
   * Closes the host, wrapped in the `igcClosing` and `igcClosed` events when
   * `emitEvents` is true. Returns `false` when the host is already closed or
   * moves there, when the consumer canceled the closing event, when a later
   * request supersedes this one, or when the transition reports an
   * interruption.
   */
  public hide(emitEvents = false): Promise<boolean> {
    return this._setOpenState(false, emitEvents);
  }

  /** Opens the host, or closes it, based on its current state. */
  public toggle(emitEvents = false): Promise<boolean> {
    return this._host.open ? this.hide(emitEvents) : this.show(emitEvents);
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
