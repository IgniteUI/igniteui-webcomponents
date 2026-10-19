import {
  getCurrentI18n,
  getI18nManager,
  type IResourceStrings,
} from 'igniteui-i18n-core';
import type { ReactiveController, ReactiveElement } from 'lit';
import { getOrInsertComputed } from '../utils/objects.js';
import { mixResourceStrings, type ResourceMap } from './converters.js';
import { resolveLocale } from './locale.js';

/** Configuration object for the `I18nController`. */
export type I18nControllerConfig<T extends object> = {
  /**
   * Default English resource strings, always from `igniteui-i18n-core`. They
   * fill the keys that the core strings of a locale lack.
   */
  defaultEN: T;
  /**
   * @deprecated since 7.2.0. The map of the component, if it uses mixed
   * resource strings. To be removed with the deprecated resources.
   */
  resourceMap?: ResourceMap;
};

/**
 * The resolved default strings, keyed by the config of a component, then by
 * the core resource object of the locale. The instances of a component share
 * one config, so they share the strings.
 *
 * @remarks
 * The manager replaces the core resource object when its strings change, so
 * its identity expires the entry. An event cannot, because `registerI18n` for
 * a non-current locale fires none.
 */
const defaultStringsCache = new WeakMap<object, WeakMap<object, object>>();

/** Shallow compare of two flat string sets. */
function sameStrings(a: object, b: object): boolean {
  if (a === b) {
    return true;
  }

  const keys = Object.keys(a) as (keyof typeof a)[];
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key] === b[key])
  );
}

/**
 * Tracks the locale of a Lit web component. A change of the resolved locale,
 * also a global one, updates the host as a change of its `locale` property.
 */
class LocaleController implements ReactiveController {
  /**
   * The connected controllers. One manager listener serves all of them,
   * because a native listener add or remove scans the full listener list.
   */
  private static readonly _connected = new Set<LocaleController>();

  private static _refreshConnected(): void {
    for (const controller of LocaleController._connected) {
      controller._refresh();
    }
  }

  protected readonly _host: ReactiveElement;
  private _locale?: string;
  /** The locale of the last refresh, see {@link resolveLocale}. */
  private _resolvedLocale?: string;

  /** Sets a custom locale, which overrides the global one. */
  public set locale(value: string | undefined) {
    if (this._locale !== value) {
      this._locale = value;
      this._refresh();
    }
  }

  /** The custom locale, or the global one. */
  public get locale(): string {
    return this._locale ?? getCurrentI18n();
  }

  constructor(host: ReactiveElement) {
    this._host = host;
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    // The manager ignores a repeated add of the same listener.
    getI18nManager().addEventListener(
      'onResourceChange',
      LocaleController._refreshConnected
    );
    LocaleController._connected.add(this);
    // Global changes are missed while disconnected.
    this._refresh();
  }

  /** @internal */
  public hostDisconnected(): void {
    LocaleController._connected.delete(this);
  }

  protected _refresh(): void {
    const old = this._resolvedLocale;
    // The global locale is always a valid tag.
    this._resolvedLocale = this._locale
      ? resolveLocale(this._locale)
      : getCurrentI18n();

    // The first resolve is the initial state, not a change.
    if (old !== undefined && old !== this._resolvedLocale) {
      this._host.requestUpdate('locale', old);
    }
  }
}

/**
 * Manages the resource strings of a Lit web component. A change of the
 * strings, also through the locale, updates the host as a change of its
 * `resourceStrings` property.
 */
class I18nController<T extends object> extends LocaleController {
  private readonly _config: I18nControllerConfig<T>;
  /** The shared default strings of the locale, see {@link defaultStringsCache}. */
  private _defaults?: T;
  private _custom?: T;
  /** The custom strings over the defaults, a copy per instance. */
  private _resolved?: T;

  /** Sets the custom resource strings of the component. */
  public set resourceStrings(value: T | undefined) {
    if (this._custom !== value) {
      this._custom = value;
      this._invalidate();
    }
  }

  /** Gets the resolved resource strings of the component. */
  public get resourceStrings(): T {
    return (this._resolved ??= Object.assign(
      {},
      (this._defaults ??= this._getDefaults()),
      this._custom && mixResourceStrings(this._custom, this._config.resourceMap)
    ));
  }

  constructor(host: ReactiveElement, config: I18nControllerConfig<T>) {
    super(host);
    this._config = config;
  }

  protected override _refresh(): void {
    super._refresh();

    // Nothing to refresh yet: the first read resolves the strings, so a late
    // `registerI18n` for this locale, which fires no event, still applies.
    if (!this._defaults) {
      return;
    }

    // A core event refreshes all components, also when only the strings of
    // other components change.
    const old = this._defaults;
    this._defaults = this._getDefaults();

    if (!sameStrings(this._defaults, old)) {
      this._invalidate();
    }
  }

  private _invalidate(): void {
    const old = this._resolved;
    this._resolved = undefined;
    this._host.requestUpdate('resourceStrings', old);
  }

  /** Maps the `defaultEN` keys to the core strings of the locale. */
  private _getDefaults(): T {
    const { defaultEN, resourceMap } = this._config;
    const coreResourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );
    const perResources = getOrInsertComputed(
      defaultStringsCache,
      this._config,
      () => new WeakMap()
    );

    return getOrInsertComputed(perResources, coreResourceStrings, () => {
      const normalized = {} as T;

      for (const key of Object.keys(defaultEN) as (keyof T)[]) {
        normalized[key] =
          key in coreResourceStrings
            ? (coreResourceStrings[key as keyof IResourceStrings] as T[keyof T])
            : defaultEN[key];
      }

      return mixResourceStrings(normalized, resourceMap);
    }) as T;
  }
}

/** Creates a `LocaleController`, and adds it to the host. */
export function addLocaleController(host: ReactiveElement): LocaleController {
  return new LocaleController(host);
}

/** Creates an `I18nController`, and adds it to the host. */
export function addI18nController<T extends object>(
  host: ReactiveElement,
  config: I18nControllerConfig<T>
): I18nController<T> {
  return new I18nController<T>(host, config);
}

export type { I18nController, LocaleController };
