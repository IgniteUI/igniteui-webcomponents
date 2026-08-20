import { type Context, ContextProvider, type ContextType } from '@lit/context';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

type ProviderHost = ReactiveControllerHost & HTMLElement;

type ContextProviderControllerOptions<
  C extends Context<unknown, unknown>,
  H extends ProviderHost,
> = {
  /** The context to provide. */
  context: C;
  /** Computes the context value published to subscribers. */
  value: () => ContextType<C>;
  /**
   * Host properties whose value changes republish the context - the shared
   * "provider plus republish-on-these-props" wiring. Anything else that must
   * republish (internal state changes) calls {@link ContextProviderController.publish}.
   */
  watch?: readonly (keyof H)[];
};

/**
 * Provides a context from the host and keeps subscribers current: the value
 * is published when the host connects, republished before an update whenever
 * one of the watched host properties has changed, and on demand via
 * {@link ContextProviderController.publish}.
 *
 * Every publish notifies subscribers, also when the value keeps its identity -
 * hosts that share one mutable context object still propagate their changes.
 *
 * @example
 * ```typescript
 * private readonly _provider = addContextProvider(this, {
 *   context: themeContext,
 *   watch: ['theme', 'variant'],
 *   value: () => ({ theme: this.theme, variant: this.variant }),
 * });
 * ```
 */
class ContextProviderController<
  C extends Context<unknown, unknown>,
  H extends ProviderHost,
> implements ReactiveController {
  private readonly _host: H;
  private readonly _options: ContextProviderControllerOptions<C, H>;
  private readonly _provider: ContextProvider<C, H>;
  private readonly _snapshot = new Map<keyof H, unknown>();

  constructor(host: H, options: ContextProviderControllerOptions<C, H>) {
    this._host = host;
    this._options = options;
    this._provider = new ContextProvider(host, { context: options.context });

    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this.publish();
  }

  /** @internal */
  public hostUpdate(): void {
    const watched = this._options.watch;

    if (watched?.some((key) => this._host[key] !== this._snapshot.get(key))) {
      this.publish();
    }
  }

  /** Publishes the current value to the subscribers. */
  public publish(): void {
    for (const key of this._options.watch ?? []) {
      this._snapshot.set(key, this._host[key]);
    }

    this._provider.setValue(this._options.value.call(this._host), true);
  }
}

/**
 * Creates and adds a {@link ContextProviderController} to the given host.
 */
export function addContextProvider<
  C extends Context<unknown, unknown>,
  H extends ProviderHost,
>(
  host: H,
  options: ContextProviderControllerOptions<C, H>
): ContextProviderController<C, H> {
  return new ContextProviderController(host, options);
}

export type { ContextProviderController, ContextProviderControllerOptions };
