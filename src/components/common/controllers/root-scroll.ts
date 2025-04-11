import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { PopoverScrollStrategy } from '../../types.js';

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

class RootScrollController implements ReactiveController {
  private _cache: WeakMap<Element, ScrollRecord>;

  constructor(
    private readonly host: RootScrollControllerHost,
    private config?: RootScrollControllerConfig
  ) {
    this._cache = new WeakMap();
    this.host.addController(this);
  }

  private configureListeners() {
    this.host.open ? this.addEventListeners() : this.removeEventListeners();
  }

  private hide() {
    this.config?.hideCallback
      ? this.config.hideCallback.call(this.host)
      : this.host.hide();
  }

  private addEventListeners() {
    if (this.host.scrollStrategy !== 'scroll') {
      document.addEventListener('scroll', this, { capture: true });
    }
  }

  private removeEventListeners() {
    document.removeEventListener('scroll', this, { capture: true });
    this._cache = new WeakMap();
  }

  public handleEvent(event: Event) {
    this.host.scrollStrategy === 'close' ? this.hide() : this._block(event);
  }

  private _block(event: Event) {
    event.preventDefault();
    const element = event.target as Element;
    const cache = this._cache;

    if (!cache.has(element)) {
      cache.set(element, {
        scrollTop: element.firstElementChild?.scrollTop ?? element.scrollTop,
        scrollLeft: element.firstElementChild?.scrollLeft ?? element.scrollLeft,
      });
    }

    const record = cache.get(element)!;
    Object.assign(element, record);

    if (element.firstElementChild) {
      Object.assign(element.firstElementChild, record);
    }
  }

  public update(config?: RootScrollControllerConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (config?.resetListeners) {
      this.removeEventListeners();
    }

    this.configureListeners();
  }

  public hostConnected() {
    this.configureListeners();
  }

  public hostDisconnected() {
    this.removeEventListeners();
  }
}

export function addRootScrollHandler(
  host: RootScrollControllerHost,
  config?: RootScrollControllerConfig
) {
  return new RootScrollController(host, config);
}
