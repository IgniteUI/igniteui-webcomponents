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
  protected readonly _consumer: ContextConsumer<T, Host>;
  /**
   * The set of the document at connect time. A move to another document
   * changes `ownerDocument` before the disconnect.
   */
  private _waiting?: Set<Retry>;

  constructor(host: Host, options: AsyncContextOptions<T>) {
    this._host = host;
    this._options = options;

    // Added first, so the retry waits before the consumer asks.
    this._host.addController(this);

    // Asks at each connect. Not in `hostConnected`: the host also connects a
    // controller added while it connects, so the consumer would ask twice.
    this._consumer = new ContextConsumer(host, {
      context: options.context,
      callback: (value, dispose) => {
        this._waiting?.delete(this._retry);
        this._options.callback?.(value, dispose);
      },
      subscribe: true,
    });
  }

  public get value(): ContextType<T> | undefined {
    return this._consumer.value;
  }

  private readonly _retry: Retry = ({ context, contextTarget }) => {
    if (
      context === this._options.context &&
      mayReach(this._host, contextTarget)
    ) {
      this._consumer.hostConnected();
    }
  };

  /** Waits for a late provider until the consumer gets the context. */
  public hostConnected(): void {
    this._waiting = getOrInsertComputed(
      waiting,
      this._host.ownerDocument,
      createWaiting
    );
    this._waiting.add(this._retry);
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
