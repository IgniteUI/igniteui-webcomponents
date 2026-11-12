import { type Context, ContextConsumer, type ContextType } from '@lit/context';
import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';
import { getOrInsertComputed } from '../utils/objects.js';

type AsyncContextOptions<T extends Context<unknown, unknown>> = {
  context: T;
  callback?: (value: ContextType<T>, dispose?: () => void) => void;
};

type ProviderEvent = HTMLElementEventMap['context-provider'];
type Retry = (event: ProviderEvent) => void;

/** The unanswered consumers of each document. */
const waiting = new WeakMap<Document, Set<Retry>>();

/**
 * A late provider announces itself, so the unanswered consumers ask again.
 * One listener per document: Chromium scans all listeners on each add and
 * remove.
 */
function retryWaiting(event: Event): void {
  for (const retry of waiting.get(event.currentTarget as Document) ?? []) {
    retry(event as ProviderEvent);
  }
}

/**
 * Whether a request of `consumer` can reach `provider`. In one tree, it
 * reaches only the ancestors of the consumer. Across trees, slots decide, and
 * a closed shadow root hides them.
 */
function mayReach(consumer: Element, provider: Element): boolean {
  return (
    consumer.getRootNode() !== provider.getRootNode() ||
    provider.contains(consumer)
  );
}

function createWaiting(document: Document): Set<Retry> {
  document.addEventListener('context-provider', retryWaiting);
  return new Set();
}

/* blazorSuppress */
class AsyncContextConsumer<
  T extends Context<unknown, unknown>,
  Host extends ReactiveControllerHost & HTMLElement,
> implements ReactiveController {
  protected _host: Host;
  protected _options: AsyncContextOptions<T>;
  protected _consumer?: ContextConsumer<T, Host>;
  /**
   * The set of the document at connect time. A move to another document
   * changes `ownerDocument` before the disconnect.
   */
  private _waiting?: Set<Retry>;

  constructor(host: Host, options: AsyncContextOptions<T>) {
    this._host = host;
    this._options = options;

    this._host.addController(this);
  }

  public get value(): ContextType<T> | undefined {
    return this._consumer?.value;
  }

  private readonly _retry: Retry = ({ context, contextTarget }) => {
    if (
      this._consumer &&
      context === this._options.context &&
      mayReach(this._host, contextTarget)
    ) {
      this._consumer.hostConnected();
    }
  };

  // The consumer survives a disconnect, and a reconnect can land during the
  // await, so the guard runs on both sides of it.
  public async hostConnected(): Promise<void> {
    this._waiting = getOrInsertComputed(
      waiting,
      this._host.ownerDocument,
      createWaiting
    );
    this._waiting.add(this._retry);

    if (this._consumer) {
      return;
    }

    await this._host.updateComplete;

    this._consumer ??= new ContextConsumer(this._host, {
      context: this._options.context,
      callback: (value, dispose) => {
        this._waiting?.delete(this._retry);
        this._options.callback?.(value, dispose);
      },
      subscribe: true,
    });
  }

  public hostDisconnected(): void {
    this._waiting?.delete(this._retry);
  }
}

export function addAsyncContextConsumer<
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
