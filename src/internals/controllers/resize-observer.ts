import {
  isServer,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';

type ResizeObserverControllerCallback = (
  ...args: Parameters<ResizeObserverCallback>
) => unknown;

/** @hidden */
export interface ResizeObserverControllerConfig {
  callback: ResizeObserverControllerCallback;
  /** The options of the underlying `ResizeObserver`. */
  options?: ResizeObserverOptions;
  /**
   * The first target element to observe. Defaults to the host. Pass `null`
   * for no first target.
   */
  target?: Element | null;
  /**
   * Whether an observed target requests an update on the host. Defaults to
   * `true`. Set it to `false` when the host controls its own update cycle.
   */
  requestUpdate?: boolean;
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

  public get targets(): ReadonlySet<Element> {
    return this._targets;
  }

  public observe(target: Element): void {
    this._targets.add(target);
    this._observer.observe(target, this._config.options);
    this._requestUpdate();
  }

  private _requestUpdate(): void {
    if (this._config.requestUpdate ?? true) {
      this._host.requestUpdate();
    }
  }

  public unobserve(target: Element): void {
    this._targets.delete(target);
    this._observer.unobserve(target);
  }

  /** @internal */
  public hostConnected(): void {
    for (const target of this._targets) {
      this._observer.observe(target, this._config.options);
    }

    if (this._targets.size > 0) {
      this._requestUpdate();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._observer.disconnect();
  }
}

/**
 * Creates a resize controller with
 * {@link ResizeObserverControllerConfig | `config`}, adds it to `host`, and
 * observes each target while the host is connected.
 */
export function createResizeObserverController(
  host: ReactiveControllerHost & Element,
  config: ResizeObserverControllerConfig
): ResizeObserverController {
  return new ResizeObserverController(host, config);
}
