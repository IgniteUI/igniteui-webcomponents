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
  type I18nResourceMapNames,
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
  /** The full default English resource strings object for the component. Should always come from igniteui-i18n-core. */
  defaultEN: T;
  /** @deprecated Optional name if component uses mixed resource strings. To be removed with deprecated resources. */
  resourceMapName?: I18nResourceMapNames;
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
  /** @deprecated Resource name to use when converting new to old and vice versa resource objects. */
  private readonly _resourceMapName?: I18nResourceMapNames;
  private readonly _resourceChangeCallback?: ResourceChangeCallback;

  private _locale?: string;
  /** Cache of default resource strings coming from i18n Manager. */
  private _defaultResourceStrings: T;
  /** Collection containing only custom resource strings provided. Allows for partial override of resource strings. */
  private _customResourceStrings?: T;
  /** Merged collection of custom resource strings and default resource strings. */
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
      this._defaultResourceStrings = this._getDefaultResourceStrings();
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
      if (value) {
        this._customResourceStrings = this._resourceMapName
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

  /** Get resolved resource strings for component */
  public get resourceStrings(): T {
    return this._resourceStrings ?? this._defaultResourceStrings;
  }

  //#endregion

  //#region Life-cycle hooks and event listener

  constructor(host: I18nControllerHost, config: I18nControllerConfig<T>) {
    this._host = host;
    this._defaultEN = config.defaultEN;
    this._resourceMapName = config.resourceMapName;
    this._resourceChangeCallback = config.onResourceChange;

    this._defaultResourceStrings = this._getDefaultResourceStrings();
    getI18nManager().registerI18n(
      this._defaultEN,
      getI18nManager().defaultLocale
    );

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
    this._defaultResourceStrings = this._getDefaultResourceStrings();
    if (this._customResourceStrings) {
      this._resourceStrings = Object.assign(
        {},
        this._defaultResourceStrings,
        this._customResourceStrings
      );
    }
    this._resourceChangeCallback?.call(this._host, event);
    this._host.requestUpdate();
  }

  //#endregion

  //#region Internal API

  /**
   * Gets the current, locale-specific resource strings for the component.
   * The logic maps component keys (from defaultEN) to core library keys
   * and retrieves the localized string from the i18n manager.
   *
   * Result is truncated, containing only relevant locale strings.
   */
  private _getDefaultResourceStrings(): T {
    const coreResourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );

    // Get all related resources to the component, based on the default resources.
    const normalizedResourceStrings: T = {} as T;
    const defaultComponentKeys = Object.keys(this._defaultEN) as (keyof T)[];
    for (const key of defaultComponentKeys) {
      let resolvedValue: T[keyof T] = this._defaultEN[key];
      if (key in coreResourceStrings) {
        // For a mix of old and core resources.
        // Only for internal default resources. Users shouldn't mix them.
        resolvedValue = coreResourceStrings[
          key as keyof IResourceStrings
        ] as T[keyof T];
      }

      normalizedResourceStrings[key] = resolvedValue;
    }

    return this.getMixedResourceStrings(normalizedResourceStrings);
  }

  private getMixedResourceStrings(value: T): T {
    if (this._resourceMapName) {
      return Object.assign(
        {},
        convertToCoreResource(value, this._resourceMapName),
        convertToIgcResource(value, this._resourceMapName)
      ) as T;
    }
    return value;
  }

  //#endregion
}

/**
 * Formats a date for display based on the specified format and locale.
 */
type DateTimeStyle = 'short' | 'long' | 'medium' | 'full';

const DATE_TIME_STYLES = new Set<string>(['short', 'long', 'medium', 'full']);

function extractStyle(format: string, suffix: string): DateTimeStyle {
  return format.toLowerCase().split(suffix)[0] as DateTimeStyle;
}

/** Returns the default date-time input format for a given locale */
export function getDefaultDateTimeFormat(locale: string): string {
  return getDateFormatter().getLocaleDateTimeFormat(locale, true);
}

/** Returns the date-time format string with the appropriate suffix if it's a predefined style */
export function getDateTimeFormat(
  format?: string,
  suffix: 'Date' | 'Time' = 'Date'
): string | undefined {
  return format && DATE_TIME_STYLES.has(format) ? `${format}${suffix}` : format;
}

/**
 * Formats a date for display using the specified format.
 */
export function formatDisplayDate(
  value: Date,
  locale: string,
  displayFormat?: string
): string {
  if (!displayFormat) {
    return getDateFormatter().formatDateTime(value, locale, {});
  }

  // Full date+time styles (short, long, medium, full)
  if (DATE_TIME_STYLES.has(displayFormat)) {
    const style = displayFormat as DateTimeStyle;
    return getDateFormatter().formatDateTime(value, locale, {
      dateStyle: style,
      timeStyle: style,
    });
  }

  // Date-only styles (shortDate, longDate, etc.)
  if (displayFormat.endsWith('Date')) {
    return getDateFormatter().formatDateTime(value, locale, {
      dateStyle: extractStyle(displayFormat, 'date'),
    });
  }

  // Time-only styles (shortTime, longTime, etc.)
  if (displayFormat.endsWith('Time')) {
    return getDateFormatter().formatDateTime(value, locale, {
      timeStyle: extractStyle(displayFormat, 'time'),
    });
  }

  // Custom format string
  return getDateFormatter().formatDateCustomFormat(value, displayFormat, {
    locale,
  });
}

/** Factory function to create and attach the I18nController to a host. */
export function addI18nController<T extends object>(
  host: I18nControllerHost,
  config: I18nControllerConfig<T>
): I18nController<T> {
  return new I18nController<T>(host, config);
}

export type { I18nController };
