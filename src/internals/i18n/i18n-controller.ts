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
   * Default English resource strings, always from `igniteui-i18n-core`. One
   * shared object per component, because the controller registers and caches
   * by its identity.
   */
  defaultEN: T;
  /**
   * @deprecated since 7.2.0. The map of the component, if it uses mixed
   * resource strings. To be removed with the deprecated resources.
   */
  resourceMap?: ResourceMap;
};

/**
 * The default strings each component resolves, keyed by `defaultEN` and by
 * the core resource object of the locale.
 *
 * @remarks
 * Every instance resolves the same strings through the same key walk and
 * converters, so they share one result. The manager replaces the core
 * resource object when its strings change, so its identity expires the entry.
 * An event cannot, because `registerI18n` for a non-current locale fires none.
 */
const defaultStringsCache = new WeakMap<object, WeakMap<object, object>>();

/** The `defaultEN` objects already registered with the i18n manager. */
const registeredDefaults = new WeakSet<object>();

/** Whether two string sets hold the same strings. */
function sameStrings(a: object, b?: object): boolean {
  if (a === b) {
    return true;
  }

  const keys = Object.keys(a) as (keyof typeof a)[];
  return (
    !!b &&
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key] === b[key])
  );
}

/**
 * Tracks the locale of a Lit web component. A change of the resolved locale,
 * also a global one, updates the host as a change of its `locale` property.
 */
class LocaleController implements ReactiveController {
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
    getI18nManager().addEventListener('onResourceChange', this);
    // Global changes are missed while disconnected.
    this._refresh();
  }

  /** @internal */
  public hostDisconnected(): void {
    getI18nManager().removeEventListener('onResourceChange', this);
  }

  /** @internal */
  public handleEvent(): void {
    this._refresh();
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
  private readonly _defaultEN: T;
  private readonly _resourceMap?: ResourceMap;
  /** The shared default strings of the locale, see {@link defaultStringsCache}. */
  private _defaults?: T;
  /** The custom strings, as given. */
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
      this._custom && mixResourceStrings(this._custom, this._resourceMap)
    ));
  }

  constructor(host: ReactiveElement, config: I18nControllerConfig<T>) {
    super(host);
    this._defaultEN = config.defaultEN;
    this._resourceMap = config.resourceMap;

    if (!registeredDefaults.has(this._defaultEN)) {
      registeredDefaults.add(this._defaultEN);
      const manager = getI18nManager();
      manager.registerI18n(this._defaultEN, manager.defaultLocale);
    }
  }

  protected override _refresh(): void {
    super._refresh();

    // Nothing to refresh yet: the first read resolves the strings, so a late
    // `registerI18n` for this locale, which fires no event, still applies.
    if (!this._defaults) {
      return;
    }

    // Equal strings in a new object, e.g. after another component registers
    // its defaults, need no update.
    const defaults = this._getDefaults();
    const changed = !sameStrings(defaults, this._defaults);
    this._defaults = defaults;

    if (changed) {
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
    const coreResourceStrings = getI18nManager().getCurrentResourceStrings(
      this.locale
    );
    const perResources = getOrInsertComputed(
      defaultStringsCache,
      this._defaultEN,
      () => new WeakMap()
    );

    return getOrInsertComputed(perResources, coreResourceStrings, () => {
      const normalized = {} as T;

      // Internal defaults only. A user must not mix old and core resources.
      for (const key of Object.keys(this._defaultEN) as (keyof T)[]) {
        normalized[key] =
          key in coreResourceStrings
            ? (coreResourceStrings[key as keyof IResourceStrings] as T[keyof T])
            : this._defaultEN[key];
      }

      return mixResourceStrings(normalized, this._resourceMap);
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
