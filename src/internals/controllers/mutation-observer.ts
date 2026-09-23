import {
  isServer,
  type ReactiveController,
  type ReactiveControllerHost,
} from 'lit';
import { isElement } from '../utils/dom.js';

/** @hidden */
export interface MutationControllerConfig<T extends Node = Node> {
  callback: MutationControllerCallback<T>;
  /** The options of the underlying `MutationObserver`. */
  config: MutationObserverInit;
  /** The element to observe. Defaults to the host component. */
  target?: Element;
  /** See {@link MutationControllerFilter}. */
  filter?: MutationControllerFilter<T>;
}

type MutationControllerCallback<T extends Node = Node> = (
  params: MutationControllerParams<T>
) => unknown;

/** Keeps the nodes that match a selector list or a predicate. */
type MutationControllerFilter<T extends Node = Node> =
  | string[]
  | ((node: T) => boolean);

type MutationDOMChange<T extends Node = Node> = {
  /** The parent of the added element or of the removed element. */
  target: Element;
  /** The added element or the removed element. */
  node: T;
};

type MutationAttributeChange<T extends Node = Node> = {
  /** The element of the changed attribute. */
  node: T;
  attributeName: string | null;
};

type MutationChange<T extends Node = Node> = {
  attributes: MutationAttributeChange<T>[];
  added: MutationDOMChange<T>[];
  removed: MutationDOMChange<T>[];
};

export type MutationControllerParams<T extends Node = Node> = {
  /** The changes that match the filter, grouped by kind. */
  changes: MutationChange<T>;
};

/**
 * Resolves a filter configuration into a node predicate.
 *
 * @remarks
 * The selectors join once, so a node match takes one `matches` call.
 */
function createNodeMatcher<T extends Node = Node>(
  filter?: MutationControllerFilter<T>
): (node: T) => boolean {
  if (!filter) {
    return () => true;
  }

  if (!Array.isArray(filter)) {
    return filter;
  }

  const selector = filter.join(',');

  return selector
    ? (node) => isElement(node) && node.matches(selector)
    : () => false;
}

class MutationController<T extends Node = Node> implements ReactiveController {
  private readonly _host: ReactiveControllerHost & Element;
  private readonly _target: Element;
  private readonly _config: MutationObserverInit;
  private readonly _callback: MutationControllerCallback<T>;
  private readonly _matches: (node: T) => boolean;

  private _observer?: MutationObserver;

  constructor(
    host: ReactiveControllerHost & Element,
    options: MutationControllerConfig<T>
  ) {
    this._host = host;
    this._callback = options.callback;
    this._config = options.config;
    this._target = options.target ?? this._host;
    this._matches = createNodeMatcher(options.filter);

    if (!isServer) {
      this._observer = new MutationObserver((records) => {
        this.disconnect();
        this._callback.call(this._host, this._process(records));
        this.observe();
      });
    }

    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this.observe();
  }

  /** @internal */
  public hostDisconnected(): void {
    this.disconnect();
  }

  private _collect(
    nodes: NodeList,
    target: Element,
    into: MutationDOMChange<T>[]
  ): void {
    for (const node of nodes) {
      if (this._matches(node as T)) {
        into.push({ target, node: node as T });
      }
    }
  }

  private _process(records: MutationRecord[]): MutationControllerParams<T> {
    const changes: MutationChange<T> = {
      attributes: [],
      added: [],
      removed: [],
    };

    for (const record of records) {
      const { type, target, attributeName, addedNodes, removedNodes } = record;

      if (type === 'attributes') {
        if (this._matches(target as T)) {
          changes.attributes.push({ node: target as T, attributeName });
        }
      } else if (type === 'childList') {
        this._collect(addedNodes, target as Element, changes.added);
        this._collect(removedNodes, target as Element, changes.removed);
      }
    }

    return { changes };
  }

  /** Starts the observation of the configured target. */
  public observe(): void {
    this._observer?.observe(this._target, this._config);
  }

  public disconnect(): void {
    this._observer?.disconnect();
  }
}

/**
 * Creates a mutation controller with `config`, and adds it to `host`.
 *
 * @remarks
 * The observation runs while the host is connected. The observer disconnects
 * for the duration of the callback, so a change that the callback makes
 * starts no new notification.
 */
export function createMutationController<T extends Node = Node>(
  host: ReactiveControllerHost & Element,
  config: MutationControllerConfig<T>
): MutationController<T> {
  return new MutationController(host, config);
}
