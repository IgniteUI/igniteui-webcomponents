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

/** The controller of each host. */
const controllers = new WeakMap<Node, LocaleController>();

/**
 * Tracks the locale of a Lit web component. A change of the resolved locale,
 * also a global one, updates the host as a change of its `locale` property.
 *
 * @remarks
 * A host without its own locale inherits the locale of the nearest ancestor
 * host in the DOM tree (not through slots), across shadow roots. Each
 * controller keeps its children, so a change updates only the hosts below it.
 * Not Lit context: each new child provider makes its ancestor provider send
 * all its subscriptions again.
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
  private _parent?: LocaleController;
  private _children?: Set<LocaleController>;
  /** The inherited locale at the disconnect, for an update while detached. */
  private _detachedLocale?: string;
  /**
   * An upgraded host connects after its descendants, so they skip it. The
   * first change that it passes on moves them under it.
   */
  private _adoptPending: boolean;

  /** Sets the own locale, which overrides the inherited and global ones. */
  public set locale(value: string | undefined) {
    const old = this._customLocale;
    this._locale = value;

    if (this._customLocale !== old || this._adoptPending) {
      this._update();
    }
  }

  /** The own, the inherited, or the global locale. */
  public get locale(): string {
    return this._customLocale ?? getCurrentI18n();
  }

  /** The own or the inherited locale. */
  private get _customLocale(): string | undefined {
    return this._locale ?? this._parent?._validLocale ?? this._detachedLocale;
  }

  /** The custom locale if it is a valid tag. Only a valid tag passes down. */
  private get _validLocale(): string | undefined {
    const custom = this._customLocale;
    return custom === this._resolvedLocale ? custom : undefined;
  }

  constructor(host: ReactiveElement) {
    this._host = host;
    this._adoptPending = host.isConnected;
    controllers.set(host, this);
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

    let parent: LocaleController | undefined;
    let node = this._host.parentNode;

    while (node && !(parent = controllers.get(node))) {
      node = node.parentNode ?? (node as ShadowRoot).host;
    }

    this._setParent(parent);
    this._detachedLocale = undefined;

    // Global changes are missed while disconnected.
    if (this._adoptPending && this._locale != null) {
      this._update();
    } else {
      this._refresh();
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    LocaleController._connected.delete(this);
    this._detachedLocale = this._parent?._validLocale;
    this._setParent(undefined);
  }

  private _setParent(parent: LocaleController | undefined): void {
    this._parent?._children?.delete(this);
    this._parent = parent;

    if (parent) {
      (parent._children ??= new Set()).add(this);
    }
  }

  /** Refreshes the host, and then the children that inherit its locale. */
  private _update(): void {
    this._refresh();

    // An upgrade sets the attributes before it connects the host.
    if (!LocaleController._connected.has(this)) {
      return;
    }

    if (this._adoptPending) {
      this._adoptPending = false;
      this._adopt(this._host);
    }

    for (const child of this._children ?? []) {
      if (child._locale == null) {
        child._update();
      }
    }
  }

  /**
   * Moves the nearest connected controllers below `node`, also in open
   * shadow roots, under this one. Closed shadow roots are out of reach.
   */
  private _adopt(node: ParentNode): void {
    for (const element of node.children) {
      const controller = controllers.get(element);

      if (controller && LocaleController._connected.has(controller)) {
        controller._setParent(this);
      } else {
        this._adopt(element);
      }
    }

    const shadow = (node as Element).shadowRoot;

    if (shadow) {
      this._adopt(shadow);
    }
  }

  protected _refresh(): void {
    const old = this._resolvedLocale;
    const custom = this._customLocale;
    // The global locale is always a valid tag.
    this._resolvedLocale = custom ? resolveLocale(custom) : getCurrentI18n();

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
