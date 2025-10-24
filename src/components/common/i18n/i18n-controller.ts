import {
  getCurrentI18n,
  getDisplayNamesFormatter,
  getI18nManager,
  type IResourceChangeEventArgs,
  type IResourceStrings,
} from 'igniteui-i18n-core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  calendarResourcesMap,
  convertToCoreResource,
  dateRangePickerResourcesMap,
} from './utils.js';

/**
 * Defines the structure for the host element that will use this controller.
 * The host must be a Lit element (ReactiveControllerHost) and an HTMLElement.
 */
interface I18nControllerHost extends ReactiveControllerHost, HTMLElement {
  // Properties the host is expected to have/use, though they are managed by the controller.
  resourceStrings?: unknown;
  locale?: string;
}

type ResourceChangeCallback = (
  event: CustomEvent<IResourceChangeEventArgs>
) => unknown;

/** Configuration object for the I18nController. */
type I18nControllerConfig<T extends object> = {
  /** The full default English resource strings object for the component. */
  defaultEN: T;
  /** An optional callback to execute when the global locale changes. */
  onResourceChange?: ResourceChangeCallback;
};

/**
 * Manages localization (i18n) for a Lit web component.
 * It handles the current locale, component-specific resource overrides,
 * and updates when the global localization state changes.
 */
class I18nController<T extends object> implements ReactiveController {
  //#region Internal properties and state

  private readonly _host: I18nControllerHost;
  private readonly _defaultEN: T;

  private _resourceChangeCallback?: ResourceChangeCallback;
  private _defaultResourceStrings: T;
  private _locale?: string;
  private _resourceStrings?: T;

  //#endregion

  //#region Public properties

  /**
   * Sets a custom locale that overrides the global one for this host component instance.
   * Setting a new locale triggers an update of the resource strings.
   */
  public set locale(value: string | undefined) {
    if (this._locale !== value) {
      this._locale = value;
      this._defaultResourceStrings = this._getCurrentResourceStrings();
      this._host.requestUpdate();
    }
  }

  /**
   * Gets the resolved locale for the host component.
   * This is the component's custom locale if set, otherwise it falls back to the
   * global locale.
   */
  public get locale(): string {
    return this._locale ?? getCurrentI18n();
  }

  /**
   * Sets custom resource string for component with this controller.
   * Gets the resolved resource string for component.
   */
  public set resourceStrings(value: T | undefined) {
    if (this._resourceStrings !== value) {
      this._resourceStrings = value;
      this._host.requestUpdate();
    }
  }

  /** Get resolved resource strings for component */
  public get resourceStrings(): T {
    return this._resourceStrings ?? this._defaultResourceStrings;
  }

  //#endregion

  //#region Life-cycle hooks and event listener

  constructor(host: I18nControllerHost, config: I18nControllerConfig<T>) {
    this._host = host;
    this._defaultEN = config.defaultEN;
    this._resourceChangeCallback = config.onResourceChange;

    this._defaultResourceStrings = this._getCurrentResourceStrings();
    this._registerResources(this._defaultEN);

    this._host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    getI18nManager().addEventListener('onResourceChange', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    getI18nManager().removeEventListener('onResourceChange', this);
  }

  /** @internal */
  public handleEvent(event: CustomEvent<IResourceChangeEventArgs>): void {
    this._defaultResourceStrings = this._getCurrentResourceStrings();
    this._resourceChangeCallback?.(event);
    this._host.requestUpdate();
  }

  //#endregion

  //#region Internal API

  /** Registers the default English resources with the global i18n manager. */
  private _registerResources(resource: T): void {
    const convertedResource = convertToCoreResource(resource);
    const manager = getI18nManager();

    manager.registerI18n(convertedResource, manager.defaultLocale);
  }

  /**
   * Helper to find the correct resource map based on the component's default resources (`#defaultEN`).
   * This relies on structural checking (the component's key names).
   */
  private _getResourceMapForComponent():
    | Map<string, string | undefined>
    | undefined {
    const keys = Object.keys(this._defaultEN);

    if (keys.includes('last7Days')) {
      return dateRangePickerResourcesMap;
    }

    if (keys.includes('selectMonth')) {
      return calendarResourcesMap;
    }

    return undefined;
  }

  /**
   * Gets the current, locale-specific resource strings for the component.
   * The logic maps component keys (from defaultEN) to core library keys
   * and retrieves the localized string from the i18n manager.
   *
   * Result is truncated, containing only relevant locale strings.
   */
  private _getCurrentResourceStrings(): T {
    const coreResourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );

    const resourceMap = this._getResourceMapForComponent();
    const normalizedResourceStrings: T = {} as T;
    const defaultComponentKeys = Object.keys(this._defaultEN) as (keyof T)[];

    for (const igcKey of defaultComponentKeys) {
      const coreKey = resourceMap?.get(igcKey as string);
      let resolvedValue: T[keyof T] = this._defaultEN[igcKey];

      if (coreKey) {
        if (coreKey.includes('getWeekLabel')) {
          resolvedValue = getDisplayNamesFormatter().getWeekLabel(this.locale, {
            style: 'short',
          }) as T[keyof T];
        } else if (coreKey in coreResourceStrings) {
          resolvedValue = coreResourceStrings[
            coreKey as keyof IResourceStrings
          ] as T[keyof T];
        }
      } else if (igcKey in coreResourceStrings) {
        // For a mix of old and core resources.
        // Only for internal default resources. Users shouldn't mix them.
        resolvedValue = coreResourceStrings[
          igcKey as keyof IResourceStrings
        ] as T[keyof T];
      }

      normalizedResourceStrings[igcKey] = resolvedValue;
    }

    return normalizedResourceStrings;
  }

  //#endregion
}

/** Factory function to create and attach the I18nController to a host. */
export function addI18nController<T extends object>(
  host: I18nControllerHost,
  config: I18nControllerConfig<T>
): I18nController<T> {
  return new I18nController<T>(host, config);
}

export type { I18nController };
