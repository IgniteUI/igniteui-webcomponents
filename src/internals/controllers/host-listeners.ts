import type { ReactiveController, ReactiveControllerHost } from 'lit';

type HostListenersHost = ReactiveControllerHost & EventTarget;

export type HostListenersConfig = {
  /**
   * The target of the listeners. Defaults to the host. A function resolves
   * when the host connects, for a target that does not exist yet, such as
   * the render root of a Lit host.
   */
  target?: EventTarget | (() => EventTarget);
  events: readonly string[];
  /** The listener. An object receives events through `handleEvent`. */
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions;
};

/**
 * Adds a set of listeners for as long as the host is connected.
 *
 * @remarks
 * One abort signal removes every listener on a disconnect, without the
 * matching options object that a manual removal needs.
 */
class HostListenersController implements ReactiveController {
  private readonly _host: HostListenersHost;
  private readonly _config: HostListenersConfig;
  private _controller?: AbortController;

  constructor(host: HostListenersHost, config: HostListenersConfig) {
    this._host = host;
    this._config = config;
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    const { target, events, listener, options } = this._config;
    const element =
      (typeof target === 'function' ? target() : target) ?? this._host;
    this._controller = new AbortController();

    const listenerOptions: AddEventListenerOptions = {
      ...options,
      signal: this._controller.signal,
    };

    for (const event of events) {
      element.addEventListener(event, listener, listenerOptions);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._controller?.abort();
    this._controller = undefined;
  }
}

/**
 * Adds a listener set to the given host.
 *
 * @example
 * ```typescript
 * addHostListeners(this, {
 *   events: ['keyup', 'focusout'],
 *   listener: this,
 *   options: { passive: true },
 * });
 * ```
 */
export function addHostListeners(
  host: HostListenersHost,
  config: HostListenersConfig
): void {
  new HostListenersController(host, config);
}
