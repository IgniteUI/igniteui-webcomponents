import type { ReactiveControllerHost } from 'lit';
import { asNumber } from '../utils/math.js';
import { createResizeObserverController } from './resize-observer.js';

type IndexedResizeCallback = (
  index: number,
  entry: ResizeObserverEntry
) => void;

/**
 * Configuration for an indexed resize controller.
 * @hidden
 */
export interface IndexedResizeControllerConfig {
  /**
   * The `dataset` key under which each observed element records the index it
   * currently renders, for example `vsIndex` for `data-vs-index`.
   */
  indexKey: string;
  /**
   * Called on the host once per resize entry with the index recorded on the
   * element. An element without a valid index is skipped.
   */
  callback: IndexedResizeCallback;
}

/**
 * A ResizeObserver over a pool of recycled elements, each tagged with the
 * index of the item it renders.
 *
 * A virtualized window reuses the same wrapper elements across renders.
 * After a scroll, one element can host a different item at an identical
 * size, and a ResizeObserver does not report that. An `observe` call on an
 * already observed element is a no-op too, so a re-measurement needs a
 * re-registration: unobserve, then observe. This controller keeps the index
 * each element was last observed under and applies that re-registration
 * only where the index changed.
 */
class IndexedResizeController {
  private readonly _host: ReactiveControllerHost & Element;
  private readonly _indexKey: string;
  private readonly _callback: IndexedResizeCallback;
  private readonly _observer: ReturnType<typeof createResizeObserverController>;
  private readonly _indexes = new WeakMap<Element, number>();

  constructor(
    host: ReactiveControllerHost & Element,
    config: IndexedResizeControllerConfig
  ) {
    this._host = host;
    this._indexKey = config.indexKey;
    this._callback = config.callback;
    this._observer = createResizeObserverController(host, {
      callback: (entries) => this._handleResize(entries),
      target: null,
      requestUpdate: false,
    });
  }

  private _indexOf(element: Element): number {
    return asNumber((element as HTMLElement).dataset[this._indexKey], -1);
  }

  private _handleResize(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
      const index = this._indexOf(entry.target);
      if (index >= 0) {
        this._callback.call(this._host, index, entry);
      }
    }
  }

  /**
   * Brings the observed set in line with the children of `container`:
   * elements no longer inside it are dropped, new ones are observed, and
   * ones whose recorded index changed are re-registered. Each observed
   * element gets one initial measurement. A nullish `container` drops
   * every element.
   */
  public sync(container: Element | null | undefined): void {
    const observed = this._observer.targets;

    for (const element of observed) {
      if (element.parentNode !== container) {
        this._observer.unobserve(element);
      }
    }

    for (const element of container?.children ?? []) {
      const index = this._indexOf(element);
      const isObserved = observed.has(element);

      if (isObserved && this._indexes.get(element) === index) {
        continue;
      }

      if (isObserved) {
        this._observer.unobserve(element);
      }
      this._observer.observe(element);
      this._indexes.set(element, index);
    }
  }
}

/**
 * Creates an indexed resize controller bound to `host` with
 * {@link IndexedResizeControllerConfig | `config`}.
 */
export function createIndexedResizeController(
  host: ReactiveControllerHost & Element,
  config: IndexedResizeControllerConfig
): IndexedResizeController {
  return new IndexedResizeController(host, config);
}
