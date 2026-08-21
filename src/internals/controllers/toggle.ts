import type { LitElement } from 'lit';

/**
 * The events emitted by a {@link ToggleController}.
 *
 * Include (a subset of) these in a host's event map to document them.
 */
export interface ToggleEventMap {
  /** Emitted before opening. Cancelable - preventing it aborts the sequence. */
  igcOpening: CustomEvent<unknown>;
  /** Emitted after the host has opened and its transition has completed. */
  igcOpened: CustomEvent<unknown>;
  /** Emitted before closing. Cancelable - preventing it aborts the sequence. */
  igcClosing: CustomEvent<unknown>;
  /** Emitted after the host has closed and its transition has completed. */
  igcClosed: CustomEvent<unknown>;
}

/**
 * A toggleable host must expose the event-emitter mixin's `emitEvent` -
 * extend {@link ../mixins/event-emitter.js#EventEmitterMixin | EventEmitterMixin}
 * with (a subset of) the {@link ToggleEventMap}.
 */
type ToggleHost = LitElement & {
  open: boolean;
  emitEvent(name: string, init?: CustomEventInit): boolean;
};

/**
 * Runs the host's visual transition to the requested state - flipping `open`,
 * playing animations, awaiting updates - in whatever order the host needs.
 *
 * Resolving `false` marks the transition as superseded (an animation was
 * interrupted by a newer one), which skips the trailing "-ed" event.
 */
type ToggleTransitionFunction = (open: boolean) => Promise<boolean> | boolean;

type ToggleControllerOptions = {
  /**
   * The host transition. When omitted, the controller flips `host.open` itself
   * and the transition always counts as completed.
   */
  transition?: ToggleTransitionFunction;
  /** Factory for the `detail` payload of the emitted events. */
  detail?: () => unknown;
};

/**
 * Implements the open/close choreography shared by every toggleable component:
 *
 * 1. Bail when the host is already in the requested state.
 * 2. When emitting, fire the cancelable `igcOpening`/`igcClosing` event and
 *    bail if the consumer prevented it.
 * 3. Run the host transition.
 * 4. When emitting and the transition completed, await the host update and
 *    fire the `igcOpened`/`igcClosed` event.
 *
 * The host keeps its public `open` property, `show()`/`hide()`/`toggle()`
 * methods and event documentation, and delegates to the controller.
 *
 * Unlike the other controllers of this directory it is not registered with the
 * host - it drives the host on demand and has no life-cycle of its own.
 */
class ToggleController {
  private readonly _host: ToggleHost;
  private readonly _options: ToggleControllerOptions;

  constructor(host: ToggleHost, options?: ToggleControllerOptions) {
    this._host = host;
    this._options = { ...options };
  }

  /**
   * Events go through the host's `emitEvent` - it is the choke point
   * consumers and framework wrappers observe.
   */
  private _emit(name: keyof ToggleEventMap, cancelable: boolean): boolean {
    const host = this._host;
    const detail = this._options.detail?.call(host);

    // Both keys are omitted rather than passed as falsy, so that `emitEvent`
    // applies its own defaults and the init of a plain event stays empty.
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

    if (host.open === open) {
      return false;
    }

    if (emitEvents && !this._emit(open ? 'igcOpening' : 'igcClosing', true)) {
      return false;
    }

    // The default transition runs synchronously so the state flip - and the
    // `updateComplete` subscription below - happen within the caller's own
    // microtask, exactly as if the host had flipped the property itself.
    let completed = true;
    if (transition) {
      completed = (await transition.call(host, open)) !== false;
    } else {
      host.open = open;
    }

    if (emitEvents && completed) {
      await host.updateComplete;
      this._emit(open ? 'igcOpened' : 'igcClosed', false);
    }

    return completed;
  }

  /*
   * The methods below deliberately return the underlying promise instead of
   * being `async` - every `async` wrapper that returns a promise costs extra
   * microtask hops on resolution, which shifts the timing of caller code
   * (e.g. focus management) relative to `updateComplete` subscribers.
   */

  /**
   * Opens the host. When `emitEvents` is true, wraps the transition in
   * `igcOpening`/`igcOpened` events.
   *
   * Returns `false` when the host was already open, the opening event was
   * canceled, or the transition reported itself superseded.
   */
  public show(emitEvents = false): Promise<boolean> {
    return this._setOpenState(true, emitEvents);
  }

  /**
   * Closes the host. When `emitEvents` is true, wraps the transition in
   * `igcClosing`/`igcClosed` events.
   *
   * Returns `false` when the host was already closed, the closing event was
   * canceled, or the transition reported itself superseded.
   */
  public hide(emitEvents = false): Promise<boolean> {
    return this._setOpenState(false, emitEvents);
  }

  /** Opens or closes the host based on its current state. */
  public toggle(emitEvents = false): Promise<boolean> {
    return this._host.open ? this.hide(emitEvents) : this.show(emitEvents);
  }
}

/** Creates and adds a {@link ToggleController} to the given host. */
export function addToggleController(
  host: ToggleHost,
  options?: ToggleControllerOptions
): ToggleController {
  return new ToggleController(host, options);
}

export type { ToggleController, ToggleControllerOptions, ToggleHost };
