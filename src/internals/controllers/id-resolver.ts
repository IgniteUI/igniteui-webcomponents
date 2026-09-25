import { isServer, type LitElement, type ReactiveController } from 'lit';
import { isDocument, isElement } from '../utils/dom.js';

const ID_REF_EMITTERS = new WeakMap<Node, IdRefChangeEmitter>();
const ID_REF_EVENT = 'id-refs-change';

function getEmitter(root: Node): IdRefChangeEmitter {
  let emitter = ID_REF_EMITTERS.get(root);
  if (!emitter) {
    emitter = new IdRefChangeEmitter(root);
    ID_REF_EMITTERS.set(root, emitter);
  }
  return emitter;
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

function refObserverCallback(
  mutations: MutationRecord[],
  emitter: IdRefChangeEmitter
): void {
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

  if (affected.size > 0) {
    emitter.dispatchEvent(new CustomEvent(ID_REF_EVENT, { detail: affected }));
  }
}

/**
 * Sends an event when an ID reference in a root node changes. A reference
 * count starts the observation for the first consumer, and stops it after
 * the last one releases.
 */
class IdRefChangeEmitter extends EventTarget {
  private readonly _observer?: MutationObserver;
  private readonly _root: Node;
  private _refCount = 0;

  constructor(root: Node) {
    super();
    this._root = root;

    if (!isServer) {
      this._observer = new MutationObserver((mutations) =>
        refObserverCallback(mutations, this)
      );
    }
  }

  /** Starts the mutation observer on the first call. */
  public retain(): void {
    if (this._refCount++ === 0) {
      const root = isDocument(this._root) ? this._root.body : this._root;
      this._observer?.observe(root, {
        attributeFilter: ['id'],
        attributeOldValue: true,
        subtree: true,
        childList: true,
      });
    }
  }

  /** Stops the observer when the reference count reaches zero. */
  public release(): void {
    if (this._refCount > 0 && --this._refCount === 0) {
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

  /** The emitter of the current root node, non-null only while observing. */
  private _emitter: IdRefChangeEmitter | null = null;

  constructor(host: LitElement, callback: (ids: Set<string>) => unknown) {
    this._host = host;
    this._host.addController(this);
    this._callback = callback;
  }

  private _observe(): void {
    if (this._emitter) {
      return;
    }

    const root = this._host.getRootNode();
    this._emitter = getEmitter(root);
    this._emitter.retain();
    this._emitter.addEventListener(ID_REF_EVENT, this);
  }

  private _unobserve(): void {
    if (this._emitter) {
      this._emitter.removeEventListener(ID_REF_EVENT, this);
      this._emitter.release();
      this._emitter = null;
    }
  }

  /** @internal */
  public handleEvent(event: Event): void {
    this._callback.call(this._host, (event as CustomEvent<Set<string>>).detail);
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
