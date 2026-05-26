import { isServer, type LitElement, type ReactiveController } from 'lit';
import { getElementByIdFromRoot, isElement } from '../util.js';

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
    emitter.dispatchEvent(
      new CustomEvent('id-refs-change', { detail: affected })
    );
  }
}

/**
 * Emits events when ID references in the document change, allowing components to reactively update resolved references.
 * Uses a reference counting mechanism to avoid unnecessary observation when no components are using it.
 */
class IdRefChangeEmitter extends EventTarget {
  private readonly _observer?: MutationObserver;
  private _refCount = 0;

  constructor() {
    super();

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
      this._observer?.observe(document.body, {
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

const ID_REF_CHANGE_EMITTER = new IdRefChangeEmitter();

/**
 * Reactive controller that allows a host component to resolve ID references
 * scoped to its root node, and react to changes in those references.
 */
class IdRefResolverController implements ReactiveController {
  private readonly _host: LitElement;
  private readonly _callback: (ids: Set<string>) => unknown;
  private _active = false;
  private _connected = false;

  constructor(host: LitElement, callback: (ids: Set<string>) => unknown) {
    this._host = host;
    this._host.addController(this);
    this._callback = callback;
  }

  /** @internal */
  public handleEvent(event: Event): void {
    this._callback.call(this._host, (event as CustomEvent<Set<string>>).detail);
  }

  /** @internal */
  public hostConnected(): void {
    this._connected = true;
    if (this._active) {
      ID_REF_CHANGE_EMITTER.retain();
      ID_REF_CHANGE_EMITTER.addEventListener('id-refs-change', this);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    if (this._active) {
      ID_REF_CHANGE_EMITTER.removeEventListener('id-refs-change', this);
      ID_REF_CHANGE_EMITTER.release();
    }
    this._connected = false;
  }

  /** Start tracking ID reference changes in the document. */
  public observe(): void {
    if (this._active) return;
    this._active = true;
    if (this._connected) {
      ID_REF_CHANGE_EMITTER.retain();
      ID_REF_CHANGE_EMITTER.addEventListener('id-refs-change', this);
    }
  }

  /** Stop tracking ID reference changes in the document. */
  public unobserve(): void {
    if (!this._active) return;
    this._active = false;
    if (this._connected) {
      ID_REF_CHANGE_EMITTER.removeEventListener('id-refs-change', this);
      ID_REF_CHANGE_EMITTER.release();
    }
  }

  /** Resolve an ID string to an element, scoped to the host's root node. */
  public resolve(id: string): Element | null {
    return getElementByIdFromRoot(this._host, id);
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
