import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { PopoverScrollStrategy } from '../../components/types.js';

type RootScrollControllerConfig = {
  hideCallback?: () => void;
  resetListeners?: boolean;
};

type RootScrollControllerHost = ReactiveControllerHost & {
  open: boolean;
  hide(): void;
  scrollStrategy?: PopoverScrollStrategy;
};

type ScrollRecord = { scrollTop: number; scrollLeft: number };

/**
 * `scroll` is not cancelable, so the listener never calls `preventDefault` and
 * is registered as passive to keep it off the scrolling critical path.
 */
const scrollListenerOptions: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

function readScroll(element: Element): ScrollRecord {
  return { scrollTop: element.scrollTop, scrollLeft: element.scrollLeft };
}

function writeScroll(element: Element, record: ScrollRecord): void {
  element.scrollTop = record.scrollTop;
  element.scrollLeft = record.scrollLeft;
}

class RootScrollController implements ReactiveController {
  private readonly _host: RootScrollControllerHost;
  private _config?: RootScrollControllerConfig;
  private _cache = new WeakMap<Element, ScrollRecord>();

  constructor(
    host: RootScrollControllerHost,
    config?: RootScrollControllerConfig
  ) {
    this._host = host;
    this._config = config;
    this._host.addController(this);
  }

  private _configureListeners(): void {
    this._host.open ? this._addEventListeners() : this._removeEventListeners();
  }

  private _hide(): void {
    this._config?.hideCallback
      ? this._config.hideCallback.call(this._host)
      : this._host.hide();
  }

  private _addEventListeners(): void {
    if (this._host.scrollStrategy !== 'scroll') {
      document.addEventListener('scroll', this, scrollListenerOptions);
    }
  }

  private _removeEventListeners(): void {
    document.removeEventListener('scroll', this, scrollListenerOptions);
    this._cache = new WeakMap();
  }

  /** @internal */
  public handleEvent(event: Event): void {
    this._host.scrollStrategy === 'close' ? this._hide() : this._block(event);
  }

  private _block(event: Event): void {
    const element = event.target as Element;
    const child = element.firstElementChild;

    let record = this._cache.get(element);

    if (!record) {
      record = readScroll(child ?? element);
      this._cache.set(element, record);
    }

    writeScroll(element, record);

    if (child) {
      writeScroll(child, record);
    }
  }

  public update(config?: RootScrollControllerConfig): void {
    if (config) {
      this._config = { ...this._config, ...config };
    }

    if (config?.resetListeners) {
      this._removeEventListeners();
    }

    this._configureListeners();
  }

  /** @internal */
  public hostConnected(): void {
    this._configureListeners();
  }

  /** @internal */
  public hostDisconnected(): void {
    this._removeEventListeners();
  }
}

export function addRootScrollHandler(
  host: RootScrollControllerHost,
  config?: RootScrollControllerConfig
): RootScrollController {
  return new RootScrollController(host, config);
}
