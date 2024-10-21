import {
  type ReactiveController,
  type ReactiveControllerHost,
  isServer,
} from 'lit';

type ResizeControllerCallback = (
  ...args: Parameters<ResizeObserverCallback>
) => unknown;

export interface ResizeControllerConfig {
  callback: ResizeControllerCallback;
  options?: ResizeObserverOptions;
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

  public observe(target: Element): void {
    this._targets.add(target);
    this._observer.observe(target, this._config.options);
    this._host.requestUpdate();
  }

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

export function createResizeController(
  host: ReactiveControllerHost & Element,
  config: ResizeControllerConfig
) {
  return new ResizeController(host, config);
}
