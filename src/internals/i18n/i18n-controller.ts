import {
  getCurrentI18n,
  getDateFormatter,
  getI18nManager,
  type IResourceChangeEventArgs,
  type IResourceStrings,
} from 'igniteui-i18n-core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  convertToCoreResource,
  convertToIgcResource,
  type ResourceMap,
} from './utils.js';

interface I18nControllerHost extends ReactiveControllerHost, HTMLElement {
  // Declared by the host, managed by the controller.
  resourceStrings?: unknown;
  locale?: string;
}

type ResourceChangeCallback = (
  event: CustomEvent<IResourceChangeEventArgs>
) => unknown;

/** The date-time formats a locale resolves to, cached against that locale. */
type LocaleDateTimeFormats = {
  locale: string;
  display: string;
  input: string;
};

/** Configuration object for the `I18nController`. */
export type I18nControllerConfig<T extends object> = {
  /** Default English resource strings, always from `igniteui-i18n-core`. */
  defaultEN: T;
  /**
   * @deprecated since 7.2.0. The map of the component, if it uses mixed
   * resource strings. To be removed with the deprecated resources.
   */
  resourceMap?: ResourceMap;
  /** Optional callback for a change of the global locale. */
  onResourceChange?: ResourceChangeCallback;
};

/**
 * The default strings each component resolves, keyed by `defaultEN` and by
 * the core resource object of the locale.
 *
 * @remarks
 * Every instance resolves the same strings through the same key walk and
 * converters, so they share one result. The manager replaces the core
 * resource object on each store, so its identity expires the entry. An event
 * cannot, because `registerI18n` for a non-current locale fires none.
 */
const defaultStringsCache = new WeakMap<object, WeakMap<object, object>>();

/** The `defaultEN` objects already registered with the i18n manager. */
const registeredDefaults = new WeakSet<object>();

/**
 * Manages the localization (i18n) of a Lit web component, and updates it on
 * a change of the global localization state.
 */
class I18nController<T extends object> implements ReactiveController {
  //#region Internal properties and state

  private readonly _host: I18nControllerHost;
  private readonly _defaultEN: T;
  /**
   * @deprecated since 7.2.0. Resource map to use when converting new to old
   * and vice versa resource objects.
   */
  private readonly _resourceMap?: ResourceMap;
  private readonly _resourceChangeCallback?: ResourceChangeCallback;

  private _locale?: string;
  /** Resolved lazily, and again after a locale or locale data change. */
  private _dateTimeFormats?: LocaleDateTimeFormats;
  /** Cache of the default resource strings from the i18n manager. */
  private _defaultResourceStrings: T;
  /** Only the custom strings, which override a part of the defaults. */
  private _customResourceStrings?: T;
  /** The custom resource strings merged over the default ones. */
  private _resourceStrings?: T;

  //#endregion

  //#region Public properties

  /**
   * Sets a custom locale for this host component instance, which overrides
   * the global locale.
   */
  public set locale(value: string | undefined) {
    if (this._locale !== value) {
      this._locale = value;
      this._refreshResourceStrings();
      this._host.requestUpdate();
    }
  }

  /**
   * Gets the resolved locale of the host component: its custom locale, or
   * the global one.
   */
  public get locale(): string {
    return this._locale ?? getCurrentI18n();
  }

  /** Sets the custom resource strings of the component. */
  public set resourceStrings(value: T | undefined) {
    if (this._resourceStrings !== value) {
      if (value) {
        this._customResourceStrings = this._resourceMap
          ? this.getMixedResourceStrings(value)
          : value;
        this._resourceStrings = Object.assign(
          {},
          this._defaultResourceStrings,
          this._customResourceStrings
        );
      } else {
        this._customResourceStrings = value;
        this._resourceStrings = value;
      }

      this._host.requestUpdate();
    }
  }

  /** Gets the resolved resource strings of the component. */
  public get resourceStrings(): T {
    return this._resourceStrings ?? this._defaultResourceStrings;
  }

  /** The locale-default format for displaying a date-time value. */
  public get localeDisplayFormat(): string {
    return this._getDateTimeFormats().display;
  }

  /**
   * The locale-default format for editing a date-time value: the display
   * format with the leading zeros a mask needs.
   */
  public get localeInputFormat(): string {
    return this._getDateTimeFormats().input;
  }

  //#endregion

  //#region Life-cycle hooks and event listener

  constructor(host: I18nControllerHost, config: I18nControllerConfig<T>) {
    this._host = host;
    this._defaultEN = config.defaultEN;
    this._resourceMap = config.resourceMap;
    this._resourceChangeCallback = config.onResourceChange;

    if (!registeredDefaults.has(this._defaultEN)) {
      registeredDefaults.add(this._defaultEN);
      const manager = getI18nManager();
      manager.registerI18n(this._defaultEN, manager.defaultLocale);
    }

    this._defaultResourceStrings = this._getDefaultResourceStrings();

    this._host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    getI18nManager().addEventListener('onResourceChange', this);

    // Global changes are missed while disconnected, so the resolved state
    // can hold a locale that is no longer current.
    this._dateTimeFormats = undefined;
    this._refreshResourceStrings();
    this._host.requestUpdate();
  }

  /** @internal */
  public hostDisconnected(): void {
    getI18nManager().removeEventListener('onResourceChange', this);
  }

  /** @internal */
  public handleEvent(event: CustomEvent<IResourceChangeEventArgs>): void {
    this._dateTimeFormats = undefined;
    this._refreshResourceStrings();
    this._resourceChangeCallback?.call(this._host, event);
    this._host.requestUpdate();
  }

  //#endregion

  //#region Internal API

  /**
   * Resolves the locale defaults again and applies the custom overrides on
   * top, so the merged strings keep no value of a previous locale.
   */
  private _refreshResourceStrings(): void {
    this._defaultResourceStrings = this._getDefaultResourceStrings();

    if (this._customResourceStrings) {
      this._resourceStrings = Object.assign(
        {},
        this._defaultResourceStrings,
        this._customResourceStrings
      );
    }
  }

  /**
   * Gets the current, locale-specific resource strings for the component.
   *
   * @remarks
   * Maps the `defaultEN` keys to the core library keys and reads each
   * localized string from the i18n manager. Every instance resolves the same
   * result, so it is cached. See {@link defaultStringsCache}.
   */
  private _getDefaultResourceStrings(): T {
    const coreResourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );

    let perResources = defaultStringsCache.get(this._defaultEN);

    if (!perResources) {
      perResources = new WeakMap();
      defaultStringsCache.set(this._defaultEN, perResources);
    }

    let strings = perResources.get(coreResourceStrings) as T | undefined;

    if (!strings) {
      const normalizedResourceStrings: T = {} as T;
      const defaultComponentKeys = Object.keys(this._defaultEN) as (keyof T)[];
      for (const key of defaultComponentKeys) {
        let resolvedValue: T[keyof T] = this._defaultEN[key];
        if (key in coreResourceStrings) {
          // Internal defaults only. A user must not mix old and core
          // resources.
          resolvedValue = coreResourceStrings[
            key as keyof IResourceStrings
          ] as T[keyof T];
        }

        normalizedResourceStrings[key] = resolvedValue;
      }

      strings = this.getMixedResourceStrings(normalizedResourceStrings);
      perResources.set(coreResourceStrings, strings);
    }

    // A copy per instance, because the cached object is shared.
    return { ...strings };
  }

  /**
   * Returns the date-time formats of the resolved locale.
   *
   * @remarks
   * An `Intl` format string is expensive and the date editors read these on
   * every render, so they are cached against the resolved locale. A global
   * resource change clears the cache, because the shared date formatter can
   * hold new locale data.
   */
  private _getDateTimeFormats(): LocaleDateTimeFormats {
    const locale = this.locale;

    if (this._dateTimeFormats?.locale !== locale) {
      const formatter = getDateFormatter();
      this._dateTimeFormats = {
        locale,
        display: formatter.getLocaleDateTimeFormat(locale),
        input: formatter.getLocaleDateTimeFormat(locale, true),
      };
    }

    return this._dateTimeFormats;
  }

  private getMixedResourceStrings(value: T): T {
    const map = this._resourceMap;

    if (map) {
      return Object.assign(
        {},
        convertToCoreResource(value, map),
        convertToIgcResource(value, map)
      ) as T;
    }
    return value;
  }

  //#endregion
}

type DateTimeStyle = 'short' | 'long' | 'medium' | 'full';

const DATE_TIME_STYLES = new Set<string>(['short', 'long', 'medium', 'full']);

function extractStyle(format: string, suffix: string): DateTimeStyle {
  return format.toLowerCase().split(suffix)[0] as DateTimeStyle;
}

/** Returns the date-time format string with a predefined style suffix. */
export function getDateTimeFormat(
  format?: string,
  suffix: 'Date' | 'Time' = 'Date'
): string | undefined {
  return format && DATE_TIME_STYLES.has(format) ? `${format}${suffix}` : format;
}

export function formatDisplayDate(
  value: Date,
  locale: string,
  displayFormat?: string
): string {
  const formatter = getDateFormatter();
  let options: Intl.DateTimeFormatOptions;

  if (!displayFormat) {
    options = {};
  } else if (DATE_TIME_STYLES.has(displayFormat)) {
    const style = displayFormat as DateTimeStyle;
    options = { dateStyle: style, timeStyle: style };
  } else if (displayFormat.endsWith('Date')) {
    options = { dateStyle: extractStyle(displayFormat, 'date') };
  } else if (displayFormat.endsWith('Time')) {
    options = { timeStyle: extractStyle(displayFormat, 'time') };
  } else {
    return formatter.formatDateCustomFormat(value, displayFormat, { locale });
  }

  return formatter.formatDateTime(value, locale, options);
}

/** Creates an `I18nController`, and adds it to the host. */
export function addI18nController<T extends object>(
  host: I18nControllerHost,
  config: I18nControllerConfig<T>
): I18nController<T> {
  return new I18nController<T>(host, config);
}

export type { I18nController };
