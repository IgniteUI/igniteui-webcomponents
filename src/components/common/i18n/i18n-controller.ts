import {
  getCurrentI18n,
  getI18nManager,
  type IResourceChangeEventArgs,
  type IResourceStrings,
} from 'igniteui-i18n-core';
import type { ReactiveControllerHost } from 'lit';
import {
  calendarResourcesMap,
  convertToCoreResource,
  dateRangePickerResourcesMap,
} from './utils.js';

interface I18nControllerHost extends ReactiveControllerHost, Element {
  resourceStrings: any;
  locale?: string;
}

type I18nControllerConfig = {
  defaultEN: any;
  onResourceChange?: (evt: CustomEvent<IResourceChangeEventArgs>) => void;
};

export class I18nController<T> {
  /** Set custom locale that overrides the global one. */
  public set locale(value: string) {
    this._locale = value;
    this._defaultResourceStrings = this.getCurrentResourceStrings();
  }

  /** Get resolved locale for component */
  public get locale() {
    return this._locale ?? getCurrentI18n();
  }

  /**
   * Sets custom resource string for component with this controller.
   * Gets the resolved resource string for component.
   */
  public set resourceStrings(value: T) {
    this._resourceStrings = value;
  }

  /** Get resolved resource strings for component */
  public get resourceStrings(): T {
    return this._resourceStrings ?? this._defaultResourceStrings;
  }

  private readonly _host: I18nControllerHost;
  private readonly _defaultEN: T;
  private readonly _resourceChangeHandler = this.onResourceChange.bind(this);
  private _locale: string | undefined;
  private _resourceStrings: T | undefined;
  private _defaultResourceStrings: T;
  private _resourceChangeCallback;

  constructor(host: I18nControllerHost, config: I18nControllerConfig) {
    this._host = host;
    this._defaultEN = config.defaultEN;
    this._defaultResourceStrings = this.getCurrentResourceStrings();
    this.registerResources(this._defaultEN, true);

    if (config?.onResourceChange) {
      this._resourceChangeCallback = config.onResourceChange;
    }

    this._host.addController(this);
  }

  public registerResources(resource: T, isDefault = false) {
    const convertedResource = convertToCoreResource(resource);
    getI18nManager().registerI18n(
      convertedResource,
      isDefault ? getI18nManager().defaultLocale : this.locale
    );
  }

  /** @internal */
  public hostConnected(): void {
    getI18nManager().addEventListener(
      'onResourceChange',
      this._resourceChangeHandler
    );
  }

  /** @internal */
  public hostDisconnected(): void {
    getI18nManager().removeEventListener(
      'onResourceChange',
      this._resourceChangeHandler
    );
  }

  protected onResourceChange(event: CustomEvent<IResourceChangeEventArgs>) {
    this._defaultResourceStrings = this.getCurrentResourceStrings();
    if (this._resourceChangeCallback) {
      this._resourceChangeCallback(event);
    }
    this._host.requestUpdate();
  }

  /** Get current resource strings based on default. Result is truncated result, containing only relevant locale strings. */
  protected getCurrentResourceStrings() {
    const normalizedResourceStrings: T = {} as T;
    const igcResourceStringKeys = Object.keys(this._defaultEN as any);
    const resourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );
    const resourceStringsKeys = Object.keys(resourceStrings);

    for (const igcKey of igcResourceStringKeys) {
      const coreKey =
        calendarResourcesMap.get(igcKey) ??
        dateRangePickerResourcesMap.get(igcKey) ??
        undefined;
      if (coreKey && !coreKey.includes('i18n/')) {
        if (resourceStringsKeys.includes(coreKey)) {
          normalizedResourceStrings[igcKey as keyof T] = resourceStrings[
            coreKey as keyof IResourceStrings
          ] as T[keyof T];
        } else {
          normalizedResourceStrings[igcKey as keyof T] =
            this._defaultEN[igcKey as keyof T];
        }
      } else if (coreKey?.includes('getWeekLabel')) {
        // Call core week label?
      } else {
        // No mapped keys, no need to convert the resources then.
        return resourceStrings as T;
      }
    }

    return normalizedResourceStrings;
  }
}

export function addI18nController<T>(
  host: I18nControllerHost,
  config: I18nControllerConfig
) {
  return new I18nController<T>(host, config);
}
