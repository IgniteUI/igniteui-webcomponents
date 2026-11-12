import { isServer, type LitElement, type ReactiveController } from 'lit';
import { getElementByIdFromRoot, isDocument } from '../utils/dom.js';
import { getOrInsertComputed } from '../utils/objects.js';

const ID_REF_OBSERVERS = new WeakMap<Node, IdRefObserver>();

function getObserver(root: Node): IdRefObserver {
  return getOrInsertComputed(
    ID_REF_OBSERVERS,
    root,
    () => new IdRefObserver(root)
  );
}

/**
 * The shared observer of the resolvers of a root node. A batch of changes
 * costs one `getElementById` per resolver, not a scan of the changed nodes.
 * Not an `EventTarget`: Chromium scans all listeners on each add and remove.
 */
class IdRefObserver {
  private readonly _observer?: MutationObserver;
  private readonly _root: Node;
  private readonly _resolvers = new Set<IdRefResolverController>();

  constructor(root: Node) {
    this._root = root;

    if (!isServer) {
      this._observer = new MutationObserver(() => {
        for (const resolver of this._resolvers) {
          resolver.check();
        }
      });
    }
  }

  /** Adds a resolver, and starts the observer for the first one. */
  public add(resolver: IdRefResolverController): void {
    if (this._resolvers.size === 0) {
      const root = isDocument(this._root) ? this._root.body : this._root;
      this._observer?.observe(root, {
        attributeFilter: ['id'],
        subtree: true,
        childList: true,
      });
    }

    this._resolvers.add(resolver);
  }

  /** Removes a resolver, and stops the observer after the last one. */
  public delete(resolver: IdRefResolverController): void {
    if (this._resolvers.delete(resolver) && this._resolvers.size === 0) {
      this._observer?.disconnect();
    }
  }
}

/** Resolves an ID reference in a root node. See {@link addIdRefResolver}. */
class IdRefResolverController implements ReactiveController {
  private readonly _host: LitElement;
  private readonly _id: () => string | null;
  private readonly _callback: (element: Element | null) => unknown;
  /** Whether the consumer asked for the observation. */
  private _active = false;
  /** The element of the last callback. */
  private _element: Element | null = null;

  /** The shared observer of the current root node, non-null only while observing. */
  private _shared: IdRefObserver | null = null;

  constructor(
    host: LitElement,
    id: () => string | null,
    callback: (element: Element | null) => unknown
  ) {
    this._host = host;
    this._host.addController(this);
    this._id = id;
    this._callback = callback;
  }

  private _observe(): void {
    if (!this._shared) {
      this._shared = getObserver(this._host.getRootNode());
      this._shared.add(this);
    }

    this.check();
  }

  private _unobserve(): void {
    this._shared?.delete(this);
    this._shared = null;
  }

  /** @internal */
  public check(): void {
    const id = this._id();
    const element = id ? getElementByIdFromRoot(this._host, id) : null;

    if (element !== this._element) {
      this._element = element;
      this._callback.call(this._host, element);
    }
  }

  /** @internal */
  public hostConnected(): void {
    if (this._active) {
      this._observe();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._unobserve();
  }

  /** Starts the observation, or checks the id again while observing. */
  public observe(): void {
    this._active = true;

    if (this._host.isConnected) {
      this._observe();
    }
  }

  public unobserve(): void {
    this._active = false;
    this._element = null;
    this._unobserve();
  }
}

/**
 * Adds a controller that resolves the ID reference `id` in the root node of
 * the host.
 *
 * @remarks
 * The controller calls `callback` with the element of the id when it differs
 * from the last one: on `observe`, on a connect and after DOM changes in the
 * root node. Call `observe` to start and `unobserve` to stop. A root node
 * shares one observation.
 */
export function addIdRefResolver(
  host: LitElement,
  id: () => string | null,
  callback: (element: Element | null) => unknown
): IdRefResolverController {
  return new IdRefResolverController(host, id, callback);
}

export type { IdRefResolverController };
