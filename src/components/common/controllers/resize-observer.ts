import {
  isServer,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';

type ResizeObserverControllerCallback = (
  ...args: Parameters<ResizeObserverCallback>
) => unknown;

/**
 * Configuration for initializing a resize controller.
 * @ignore
 */
export interface ResizeObserverControllerConfig {
  /** The callback function to run when a resize mutation is triggered. */
  callback: ResizeObserverControllerCallback;
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

class ResizeObserverController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & Element;
  private readonly _targets = new Set<Element>();
  private readonly _observer!: ResizeObserver;
  private readonly _config: ResizeObserverControllerConfig;

  constructor(
    host: ReactiveControllerHost & Element,
    config: ResizeObserverControllerConfig
  ) {
    this._host = host;
    this._config = config;

    if (this._config.target !== null) {
      this._targets.add(this._config.target ?? host);
    }

    /* c8 ignore next 3 */
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

  /** @internal */
  public hostConnected(): void {
    for (const target of this._targets) {
      this.observe(target);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._observer.disconnect();
  }
}

/**
 * Creates a new resize controller bound to the given `host`
 * with {@link ResizeObserverControllerConfig | `config`}.
 */
export function createResizeObserverController(
  host: ReactiveControllerHost & Element,
  config: ResizeObserverControllerConfig
): ResizeObserverController {
  return new ResizeObserverController(host, config);
}
