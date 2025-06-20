import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { isElement } from '../util.js';

/** @ignore */
export interface MutationControllerConfig<T extends Node = Node> {
  /** The callback function to run when a mutation occurs. */
  callback: MutationControllerCallback<T>;
  /** The underlying mutation observer configuration parameters. */
  config: MutationObserverInit;
  /**
   * The element to observe.
   * If left out, the observer will listen on the host component itself.
   */
  target?: Element;
  /**
   * A filter configuration.
   * See {@link MutationControllerFilter|this} for additional information.
   */
  filter?: MutationControllerFilter<T>;
}

type MutationControllerCallback<T extends Node = Node> = (
  params: MutationControllerParams<T>
) => unknown;

/**
 * Filter configuration to return elements that either match
 * an array of selector strings or a predicate function.
 */
type MutationControllerFilter<T extends Node = Node> =
  | string[]
  | ((node: T) => boolean);

type MutationDOMChange<T extends Node = Node> = {
  /** The parent of the added/removed element. */
  target: Element;
  /** The added/removed element. */
  node: T;
};

type MutationAttributeChange<T extends Node = Node> = {
  /** The host element of the changed attribute. */
  node: T;
  /** The changed attribute name. */
  attributeName: string | null;
};

type MutationChange<T extends Node = Node> = {
  /** Elements that have attribute(s) changes. */
  attributes: MutationAttributeChange<T>[];
  /** Elements that have been added. */
  added: MutationDOMChange<T>[];
  /** Elements that have been removed. */
  removed: MutationDOMChange<T>[];
};

export type MutationControllerParams<T extends Node = Node> = {
  /** The original mutation records from the underlying observer. */
  records: MutationRecord[];
  /** The aggregated changes. */
  changes: MutationChange<T>;
  /** The observer controller instance. */
  observer: MutationController<T>;
};

function applyNodeFilter<T extends Node = Node>(
  nodes: T[],
  predicate?: MutationControllerFilter<T>
): T[] {
  if (!predicate) {
    return nodes;
  }

  return Array.isArray(predicate)
    ? nodes.filter(
        (node) =>
          isElement(node) &&
          predicate.some((selector) => node.matches(selector))
      )
    : nodes.filter(predicate);
}

class MutationController<T extends Node = Node> implements ReactiveController {
  private readonly _host: ReactiveControllerHost & Element;
  private readonly _observer: MutationObserver;
  private readonly _target: Element;
  private readonly _config: MutationObserverInit;
  private readonly _callback: MutationControllerCallback<T>;
  private readonly _filter?: MutationControllerFilter<T>;

  constructor(
    host: ReactiveControllerHost & Element,
    options: MutationControllerConfig<T>
  ) {
    this._host = host;
    this._callback = options.callback;
    this._config = options.config;
    this._target = options.target ?? this._host;
    this._filter = options.filter;

    this._observer = new MutationObserver((records) => {
      this.disconnect();
      this._callback.call(this._host, this._process(records));
      this.observe();
    });

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

  private _process(records: MutationRecord[]): MutationControllerParams<T> {
    const predicate = this._filter;
    const changes: MutationChange<T> = {
      attributes: [],
      added: [],
      removed: [],
    };

    for (const record of records) {
      const { type, target, attributeName, addedNodes, removedNodes } = record;

      if (type === 'attributes') {
        changes.attributes.push(
          ...applyNodeFilter([target as T], predicate).map((node) => ({
            node,
            attributeName,
          }))
        );
      } else if (type === 'childList') {
        changes.added.push(
          ...applyNodeFilter([...addedNodes] as T[], predicate).map((node) => ({
            target: target as Element,
            node,
          }))
        );
        changes.removed.push(
          ...applyNodeFilter([...removedNodes] as T[], predicate).map(
            (node) => ({
              target: target as Element,
              node,
            })
          )
        );
      }
    }

    return { records, changes, observer: this };
  }

  /**
   * Begin receiving notifications of changes to the DOM based
   * on the configured {@link MutationControllerConfig.target|target} and observer {@link MutationControllerConfig.config|options}.
   */
  public observe(): void {
    this._observer.observe(this._target, this._config);
  }

  /** Stop watching for mutations. */
  public disconnect(): void {
    this._observer.disconnect();
  }
}

/**
 * Creates and attaches a mutation controller with `config` to the passed in `host`.
 *
 * Automatically starts/stops observing for mutation changes
 * in the respective component connect/disconnect callbacks.
 *
 * The mutation observer is disconnected before invoking the passed in callback and re-attached
 * after that in order to not loop itself in endless stream of changes.
 */
export function createMutationController<T extends Node = Node>(
  host: ReactiveControllerHost & Element,
  config: MutationControllerConfig<T>
): MutationController<T> {
  return new MutationController(host, config);
}
