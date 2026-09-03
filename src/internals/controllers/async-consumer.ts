import { type Context, ContextConsumer, type ContextType } from '@lit/context';
import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';

type AsyncContextOptions<T extends Context<unknown, unknown>> = {
  context: T;
  callback?: (value: ContextType<T>, dispose?: () => void) => void;
  subscribe?: boolean;
};

/* blazorSuppress */
export class AsyncContextConsumer<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & HTMLElement,
> implements ReactiveController {
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

  // If there is already an instance of a consumer (because of an attach/detach cycle),
  // skip creating a new instance for this host - checked both before and after the
  // await, since a reconnect can land in between.
  public async hostConnected(): Promise<void> {
    if (this._consumer) {
      return;
    }

    await this._host.updateComplete;

    this._consumer ??= new ContextConsumer(this._host, {
      context: this._options.context,
      callback: this._options.callback,
      subscribe: this._options.subscribe,
    });
  }
}

export function createAsyncContext<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & LitElement,
>(
  host: Host,
  context: T,
  callback?: (value: ContextType<T>, dispose?: () => void) => void
): AsyncContextConsumer<T, Host> {
  return new AsyncContextConsumer(host, {
    context,
    callback,
    subscribe: true,
  });
}
