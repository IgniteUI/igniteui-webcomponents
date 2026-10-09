import { type Context, ContextConsumer, type ContextType } from '@lit/context';
import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import { createAbortHandle } from '../abort-handler.js';

type AsyncContextOptions<T extends Context<unknown, unknown>> = {
  context: T;
  callback?: (value: ContextType<T>, dispose?: () => void) => void;
};

/* blazorSuppress */
class AsyncContextConsumer<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & HTMLElement,
> implements ReactiveController {
  protected _host: Host;
  protected _options: AsyncContextOptions<T>;
  protected _consumer?: ContextConsumer<T, Host>;
  /** Whether a provider answered the request of the current connection. */
  private _answered = false;
  private readonly _abort = createAbortHandle();

  constructor(host: Host, options: AsyncContextOptions<T>) {
    this._host = host;
    this._options = options;

    this._host.addController(this);
  }

  public get value(): ContextType<T> | undefined {
    return this._consumer?.value;
  }

  /**
   * A provider that connects after the host, such as one that the browser
   * defines later, announces itself. An unanswered request then goes again.
   */
  private readonly _handleProvider = (event: Event): void => {
    const { context } = event as Event & { context?: unknown };

    if (!this._answered && context === this._options.context) {
      this._consumer?.hostConnected();
    }
  };

  // The consumer survives a disconnect, and a reconnect can land during the
  // await, so the guard runs on both sides of it.
  public async hostConnected(): Promise<void> {
    this._answered = false;
    this._host.ownerDocument.addEventListener(
      'context-provider',
      this._handleProvider,
      { signal: this._abort.signal }
    );

    if (this._consumer) {
      return;
    }

    await this._host.updateComplete;

    this._consumer ??= new ContextConsumer(this._host, {
      context: this._options.context,
      callback: (value, dispose) => {
        this._answered = true;
        this._options.callback?.(value, dispose);
      },
      subscribe: true,
    });
  }

  public hostDisconnected(): void {
    this._abort.abort();
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
  return new AsyncContextConsumer(host, { context, callback });
}

export type { AsyncContextConsumer };
