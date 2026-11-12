import { isServer, type LitElement, type ReactiveController } from 'lit';
import { isDocument, isElement } from '../utils/dom.js';
import { getOrInsertComputed } from '../utils/objects.js';

const ID_REF_OBSERVERS = new WeakMap<Node, IdRefObserver>();

function getObserver(root: Node): IdRefObserver {
  return getOrInsertComputed(
    ID_REF_OBSERVERS,
    root,
    () => new IdRefObserver(root)
  );
}

/** Adds the ids of `nodes` and of any of their descendants to `affected`. */
function collectIds(nodes: NodeList, affected: Set<string>): void {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node.id) affected.add(node.id);
    for (const child of node.querySelectorAll('[id]')) {
      if (child.id) affected.add(child.id);
    }
  }
}

function changedIds(mutations: MutationRecord[]): Set<string> {
  const affected = new Set<string>();

  for (const mutation of mutations) {
    if (mutation.type === 'attributes') {
      if (!isElement(mutation.target)) continue;
      const oldId = mutation.oldValue;
      const newId = mutation.target.id;
      if (oldId) affected.add(oldId);
      if (newId) affected.add(newId);
    } else {
      collectIds(mutation.addedNodes, affected);
      collectIds(mutation.removedNodes, affected);
    }
  }

  return affected;
}

/**
 * Tells the resolvers of a root node which ids changed. They share one
 * observer. Not an `EventTarget`: Chromium scans all listeners on each add
 * and remove.
 */
class IdRefObserver {
  private readonly _observer?: MutationObserver;
  private readonly _root: Node;
  private readonly _resolvers = new Set<IdRefResolverController>();

  constructor(root: Node) {
    this._root = root;

    if (!isServer) {
      this._observer = new MutationObserver((mutations) => {
        const ids = changedIds(mutations);

        if (ids.size > 0) {
          for (const resolver of this._resolvers) {
            resolver.idsChanged(ids);
          }
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
        attributeOldValue: true,
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

/** Resolves ID references in a root node. See {@link addIdRefResolver}. */
class IdRefResolverController implements ReactiveController {
  private readonly _host: LitElement;
  private readonly _callback: (ids: Set<string>) => unknown;
  /** Whether the consumer asked for the observation. */
  private _active = false;

  /** The shared observer of the current root node, non-null only while observing. */
  private _shared: IdRefObserver | null = null;

  constructor(host: LitElement, callback: (ids: Set<string>) => unknown) {
    this._host = host;
    this._host.addController(this);
    this._callback = callback;
  }

  private _observe(): void {
    if (!this._shared) {
      this._shared = getObserver(this._host.getRootNode());
      this._shared.add(this);
    }
  }

  private _unobserve(): void {
    this._shared?.delete(this);
    this._shared = null;
  }

  /** @internal */
  public idsChanged(ids: Set<string>): void {
    this._callback.call(this._host, ids);
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

  public observe(): void {
    this._active = true;

    if (this._host.isConnected) {
      this._observe();
    }
  }

  public unobserve(): void {
    this._active = false;
    this._unobserve();
  }
}

/**
 * Adds a controller that resolves ID references in the root node of the host.
 *
 * @remarks
 * The controller calls `callback` with the ids that changed. Call `observe`
 * to start and `unobserve` to stop. A root node shares one observation.
 */
export function addIdRefResolver(
  host: LitElement,
  callback: (ids: Set<string>) => unknown
): IdRefResolverController {
  return new IdRefResolverController(host, callback);
}

export type { IdRefResolverController };
