import {
  type ReactiveController,
  type ReactiveControllerHost,
  isServer,
} from 'lit';

type ResizeControllerCallback = (
  ...args: Parameters<ResizeObserverCallback>
) => unknown;

/** Configuration for initializing a resize controller. */
export interface ResizeControllerConfig {
  /** The callback function to run when a resize mutation is triggered. */
  callback: ResizeControllerCallback;
  /** Configuration options passed to the underlying ResizeObserver. */
  options?: ResizeObserverOptions;
  /**
   * The initial target element to observe for resize mutations.
   *
   * If not provided, the host element will be set as initial target.
   * Pass in `null` to skip setting an initial target.
   */
  target?: Element | null;
}

class ResizeController implements ReactiveController {
  private _host: ReactiveControllerHost & Element;
  private _targets = new Set<Element>();
  private _config: ResizeControllerConfig;
  private _observer!: ResizeObserver;

  constructor(
    host: ReactiveControllerHost & Element,
    config: ResizeControllerConfig
  ) {
    this._host = host;
    this._config = config;

    if (this._config.target !== null) {
      this._targets.add(this._config.target ?? host);
    }

    if (isServer) {
      return;
    }

    this._observer = new ResizeObserver((entries) =>
      this._config.callback.call(this._host, entries, this._observer)
    );

    host.addController(this);
  }

  /** Starts observing the `targe` element. */
  public observe(target: Element): void {
    this._targets.add(target);
    this._observer.observe(target, this._config.options);
    this._host.requestUpdate();
  }

  /** Stops observing the `target` element. */
  public unobserve(target: Element): void {
    this._targets.delete(target);
    this._observer.unobserve(target);
  }

  public hostConnected(): void {
    for (const target of this._targets) {
      this.observe(target);
    }
  }

  public hostDisconnected(): void {
    this.disconnect();
  }

  protected disconnect(): void {
    this._observer.disconnect();
  }
}

/**
 * Creates a new resize controller bound to the given `host`
 * with {@link ResizeControllerConfig | `config`}.
 */
export function createResizeController(
  host: ReactiveControllerHost & Element,
  config: ResizeControllerConfig
) {
  return new ResizeController(host, config);
}
