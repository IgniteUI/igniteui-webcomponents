import { isServer, type LitElement, type ReactiveController } from 'lit';
import { isDocument, isElement } from '../util.js';

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
      for (const node of mutation.addedNodes) {
        if (!isElement(node)) continue;
        if (node.id) affected.add(node.id);
        for (const child of node.querySelectorAll('[id]')) {
          if (child.id) affected.add(child.id);
        }
      }
      for (const node of mutation.removedNodes) {
        if (!isElement(node)) continue;
        if (node.id) affected.add(node.id);
        for (const child of node.querySelectorAll('[id]')) {
          if (child.id) affected.add(child.id);
        }
      }
    }
  }

  if (affected.size > 0) {
    emitter.dispatchEvent(new CustomEvent(ID_REF_EVENT, { detail: affected }));
  }
}

/**
 * Emits events when ID references in a root node change, allowing components to reactively update resolved references.
 * Uses a reference counting mechanism to avoid unnecessary observation when no components are using it.
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

  /**
   * Increment the reference count. Starts the underlying MutationObserver on the first call.
   */
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

  /**
   * Decrement the reference count. Stops the underlying MutationObserver when the count reaches zero.
   */
  public release(): void {
    if (this._refCount > 0 && --this._refCount === 0) {
      this._observer?.disconnect();
    }
  }
}

/**
 * Reactive controller that allows a host component to resolve ID references
 * scoped to its root node, and react to changes in those references.
 */
class IdRefResolverController implements ReactiveController {
  private readonly _host: LitElement;
  private readonly _callback: (ids: Set<string>) => unknown;
  private _active = false;
  private _connected = false;
  private _emitter: IdRefChangeEmitter | null = null;

  constructor(host: LitElement, callback: (ids: Set<string>) => unknown) {
    this._host = host;
    this._host.addController(this);
    this._callback = callback;
  }

  private _observe(): void {
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
    this._connected = true;
    if (this._active) {
      this._observe();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._active) {
      this._unobserve();
    }
    this._connected = false;
  }

  /** Start tracking ID reference changes in the document. */
  public observe(): void {
    if (this._active) return;
    this._active = true;
    if (this._connected) {
      this._observe();
    }
  }

  /** Stop tracking ID reference changes in the document. */
  public unobserve(): void {
    if (!this._active) return;
    this._active = false;
    if (this._connected) {
      this._unobserve();
    }
  }
}

/**
 * Adds an ID reference resolver controller to the host component, allowing it to resolve ID references scoped to
 * its root node and react to changes in those references.
 */
export function addIdRefResolver(
  host: LitElement,
  callback: (ids: Set<string>) => unknown
): IdRefResolverController {
  return new IdRefResolverController(host, callback);
}

export type { IdRefResolverController };
