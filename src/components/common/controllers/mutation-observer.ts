import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { isElement } from '../util.js';

/** @ignore */
export interface MutationControllerConfig<T> {
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

type MutationControllerCallback<T> = (
  params: MutationControllerParams<T>
) => unknown;

/**
 * Filter configuration to return elements that either match
 * an array of selector strings or a predicate function.
 */
type MutationControllerFilter<T> = string[] | ((node: T) => boolean);

type MutationChange<T> = {
  /** Elements that have attribute(s) changes. */
  attributes: T[];
  /** Elements that have been added. */
  added: T[];
  /** Elements that have been removed. */
  removed: T[];
};

export type MutationControllerParams<T> = {
  /** The original mutation records from the underlying observer. */
  records: MutationRecord[];
  /** The aggregated changes. */
  changes: MutationChange<T>;
  /** The observer controller instance. */
  observer: MutationController<T>;
};

function mutationFilter<T>(nodes: T[], filter?: MutationControllerFilter<T>) {
  if (!filter) {
    return nodes;
  }

  return Array.isArray(filter)
    ? nodes.filter((node) =>
        filter.some((selector) => isElement(node) && node.matches(selector))
      )
    : nodes.filter((node) => filter(node));
}

class MutationController<T> implements ReactiveController {
  private _host: ReactiveControllerHost & Element;
  private _observer: MutationObserver;
  private _target: Element;
  private _config: MutationObserverInit;
  private _callback: MutationControllerCallback<T>;
  private _filter?: MutationControllerFilter<T>;

  constructor(
    host: ReactiveControllerHost & Element,
    options: MutationControllerConfig<T>
  ) {
    this._host = host;
    this._callback = options.callback;
    this._config = options.config;
    this._target = options.target ?? this._host;
    this._filter = options.filter ?? [];

    this._observer = new MutationObserver((records) => {
      this.disconnect();
      this._callback.call(this._host, this._process(records));
      this.observe();
    });

    host.addController(this);
  }

  public hostConnected() {
    this.observe();
  }

  public hostDisconnected() {
    this.disconnect();
  }

  private _process(records: MutationRecord[]): MutationControllerParams<T> {
    const changes: MutationChange<T> = {
      attributes: [],
      added: [],
      removed: [],
    };
    const filter = this._filter;

    for (const record of records) {
      if (record.type === 'attributes') {
        changes.attributes.push(
          ...mutationFilter([record.target as T], filter)
        );
      } else if (record.type === 'childList') {
        changes.added.push(
          ...mutationFilter(Array.from(record.addedNodes) as T[], filter)
        );
        changes.removed.push(
          ...mutationFilter(Array.from(record.removedNodes) as T[], filter)
        );
      }
    }

    return { records, changes, observer: this };
  }

  /**
   * Begin receiving notifications of changes to the DOM based
   * on the configured {@link MutationControllerConfig.target|target} and observer {@link MutationControllerConfig.config|options}.
   */
  public observe() {
    this._observer.observe(this._target, this._config);
  }

  /** Stop watching for mutations. */
  public disconnect() {
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
export function createMutationController<T>(
  host: ReactiveControllerHost & Element,
  config: MutationControllerConfig<T>
) {
  return new MutationController(host, config);
}
