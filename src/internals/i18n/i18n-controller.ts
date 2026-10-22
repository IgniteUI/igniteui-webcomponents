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
 * The connected controllers. One manager listener serves all of them, because
 * a native listener add or remove scans the full listener list. Not a static
 * field, so bundlers can drop the class where only `getHostLocale` is used.
 */
const connected = new Set<LocaleController>();

/** A parent in the locale tree: a controller, or an element with `lang`. */
type LocaleSource = {
  _validLocale?: string;
  _children?: Set<LocaleController>;
};

/** A `lang` source, with the `lang` of its last read. */
type LangSource = LocaleSource & { _lang?: string | null };

const langSources = new WeakMap<Element, LangSource>();
const observedRoots = new WeakSet<Node>();
let langObserver: MutationObserver | undefined;

/** Whether `node` has `lang`. Not the root element: its `lang` is global. */
function hasLang(node: Node): boolean {
  return (
    !!(node as Element).hasAttribute?.('lang') &&
    node.parentNode !== node.ownerDocument
  );
}

/**
 * The nearest host or `lang` element from `start` up, across shadow roots.
 * Passes each root that it leaves to `onRoot`. Only a shadow root goes on to
 * a `host`: a parentless anchor has a string `host`, a form a named control.
 */
function findSource(
  start: Node | null,
  onRoot?: (root: Node) => void
): Node | undefined {
  let node = start;

  while (node && !controllers.has(node) && !hasLang(node)) {
    const parent = node.parentNode;

    if (!parent) {
      onRoot?.(node);
    }

    node = parent ?? (node.nodeType === 11 ? (node as ShadowRoot).host : null);
  }

  return node ?? undefined;
}

/**
 * Tracks the locale of a Lit web component. A change of the resolved locale,
 * also a global one, updates the host as a change of its `locale` property.
 *
 * @remarks
 * Without its own locale, a host takes its own `lang`, else the locale of the
 * nearest ancestor host or `lang` in the DOM tree (not through slots). Each
 * source keeps its children, so a change updates only the hosts below it.
 * Not Lit context: each new child provider makes its ancestor provider send
 * all its subscriptions again.
 */
class LocaleController implements ReactiveController {
  private static _refreshConnected(): void {
    for (const controller of connected) {
      controller._refresh();
    }
  }

  /** Watches `lang` in `root`, also in the shadow root of a host. */
  private static _observeLang(root: Node): void {
    if (!root.isConnected || observedRoots.has(root)) {
      return;
    }

    observedRoots.add(root);
    langObserver ??= new MutationObserver(LocaleController._langChanged);
    langObserver.observe(root, {
      attributeFilter: ['lang'],
      attributeOldValue: true,
      subtree: true,
    });
  }

  /**
   * Reads `lang` on each call, because no observer sees a change while
   * detached. A new value updates the hosts at once, before the observer.
   */
  private static _langSource(element: Element): LangSource {
    const source = getOrInsertComputed(
      langSources,
      element,
      (): LangSource => ({})
    );
    const lang = element.getAttribute('lang');

    LocaleController._observeLang(element.getRootNode());

    if (source._lang !== lang) {
      source._lang = lang;
      // An empty `lang` means an unknown language.
      source._validLocale =
        lang && resolveLocale(lang) === lang ? lang : undefined;
      LocaleController._updateChildren(source);
    }

    return source;
  }

  private static _langChanged(records: MutationRecord[]): void {
    for (const { target, oldValue } of records) {
      const element = target as Element;

      if (hasLang(element)) {
        const source = LocaleController._langSource(element);

        // A new `lang` sits between its hosts and their old source.
        if (oldValue === null) {
          const own = controllers.get(element);

          if (own && connected.has(own)) {
            own._setParent(source);
          } else {
            LocaleController._adopt(source, element);
          }

          LocaleController._updateChildren(source);
        }
        continue;
      }

      const source = langSources.get(element);

      if (source) {
        langSources.delete(element);

        for (const child of source._children ?? []) {
          child._link();
          if (child._locale == null) {
            child._update();
          }
        }
      }
    }
  }

  private static _updateChildren(source: LocaleSource): void {
    for (const child of source._children ?? []) {
      if (child._locale == null) {
        child._update();
      }
    }
  }

  /**
   * Moves the nearest connected controllers below `node`, also in open
   * shadow roots, under `parent`. Stops at each `lang`.
   */
  private static _adopt(parent: LocaleSource, node: ParentNode): void {
    for (const element of node.children) {
      if (hasLang(element)) {
        continue;
      }

      const controller = controllers.get(element);

      if (controller && connected.has(controller)) {
        controller._setParent(parent);
      } else {
        LocaleController._adopt(parent, element);
      }
    }

    const shadow = (node as Element).shadowRoot;

    if (shadow) {
      LocaleController._adopt(parent, shadow);
    }
  }

  protected readonly _host: ReactiveElement;
  private _locale?: string;
  /** The locale of the last refresh, see {@link resolveLocale}. */
  private _resolvedLocale?: string;
  private _parent?: LocaleSource;
  /** Not private, see {@link LocaleSource}. */
  public _children?: Set<LocaleController>;
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

  /** The own locale, else the own `lang` or the inherited locale. */
  private get _customLocale(): string | undefined {
    return this._locale ?? this._parent?._validLocale ?? this._detachedLocale;
  }

  /** The custom locale if it is a valid tag. Only a valid tag passes down. */
  public get _validLocale(): string | undefined {
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
    connected.add(this);

    this._link();
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
    // A `lang` change in the task of the disconnect has no record yet.
    if (langObserver) {
      LocaleController._langChanged(langObserver.takeRecords());
    }

    connected.delete(this);
    this._detachedLocale = this._parent?._validLocale;
    this._setParent(undefined);
  }

  /** Links to the own `lang`, else to the nearest source above. */
  private _link(): void {
    const host = this._host;

    if (hasLang(host)) {
      this._setParent(LocaleController._langSource(host));
      return;
    }

    const node = findSource(host.parentNode, LocaleController._observeLang);

    this._setParent(
      node &&
        (controllers.get(node) ?? LocaleController._langSource(node as Element))
    );
  }

  private _setParent(parent: LocaleSource | undefined): void {
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
    if (!connected.has(this)) {
      return;
    }

    if (this._adoptPending) {
      this._adoptPending = false;
      LocaleController._adopt(this, this._host);
    }

    LocaleController._updateChildren(this);
  }

  protected _refresh(): void {
    const old = this._resolvedLocale;
    const custom = this._customLocale;
    // Only the own locale can be invalid: a source passes on valid tags only.
    this._resolvedLocale = this._locale
      ? resolveLocale(this._locale)
      : custom || getCurrentI18n();

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

/** The locale of a host, also of a host without a locale controller. */
export function getHostLocale(host: Node): string {
  const node = findSource(host);
  const locale =
    node &&
    (controllers.get(node)?.locale ?? (node as Element).getAttribute('lang'));

  return resolveLocale(locale || getCurrentI18n());
}

/** Creates an `I18nController`, and adds it to the host. */
export function addI18nController<T extends object>(
  host: ReactiveElement,
  config: I18nControllerConfig<T>
): I18nController<T> {
  return new I18nController<T>(host, config);
}

export type { I18nController, LocaleController };
