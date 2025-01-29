import { type Context, ContextConsumer, type ContextType } from '@lit/context';
import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';

type AsyncContextOptions<T extends Context<unknown, unknown>> = {
  context: T;
  subscribe?: boolean;
};

/* blazorSuppress */
export class AsyncContextConsumer<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & HTMLElement,
> implements ReactiveController
{
  protected _host: Host;
  protected _options: AsyncContextOptions<T>;
  protected _consumer?: ContextConsumer<T, Host>;

  constructor(host: Host, options: AsyncContextOptions<T>) {
    this._host = host;
    this._options = options;

    this._host.addController(this);
  }

  public get value(): ContextType<T> | undefined {
    return this._consumer?.value;
  }

  public async hostConnected(): Promise<void> {
    await this._host.updateComplete;

    // If there is already an instance of a consumer (because of an attach/detach cycle),
    // skip creating a new instance for this host.
    if (!this._consumer) {
      this._consumer = new ContextConsumer(this._host, {
        context: this._options.context,
        subscribe: this._options.subscribe,
      });
    }
  }
}

export function createAsyncContext<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & LitElement,
>(host: Host, context: T): AsyncContextConsumer<T, Host> {
  return new AsyncContextConsumer(host, {
    context,
    subscribe: true,
  }) as AsyncContextConsumer<T, Host>;
}
