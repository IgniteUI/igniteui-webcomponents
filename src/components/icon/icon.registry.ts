import type { Theme } from '#theming/types.js';
import { ICON_REFERENCES } from './icon-references.js';
import { IconsStateBroadcast } from './icon-state.broadcast.js';
import { internalIcons } from './internal-icons-lib.js';
import { SvgIconParser } from './registry/parser.js';
import type {
  IconCallback,
  IconMeta,
  IconReferencePair,
  IconsCollection,
  RegisterIconOptions,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

/**
 * Normalizes the third argument of `registerIcon` / `registerIconFromText`,
 * which is either a collection name or a {@link RegisterIconOptions} object.
 */
function resolveIconOptions(
  collectionOrOptions?: string | RegisterIconOptions
): Required<RegisterIconOptions> {
  if (typeof collectionOrOptions === 'string') {
    return { collection: collectionOrOptions, stripMeta: false };
  }

  return {
    collection: collectionOrOptions?.collection ?? 'default',
    stripMeta: collectionOrOptions?.stripMeta ?? false,
  };
}

/** Returns the named collection, creating it when absent. */
function collectionOf<V>(
  collections: IconsCollection<V>,
  name: string
): Map<string, V> {
  let collection = collections.get(name);

  if (!collection) {
    collection = new Map();
    collections.set(name, collection);
  }

  return collection;
}

/**
 * Global singleton registry for managing SVG icons and their references.
 *
 * @remarks
 * The registry stores SVG icons in named collections, resolves aliases against
 * the active theme, notifies subscribers once per microtask however many icons
 * changed, and publishes user-set state to other browsing contexts (see
 * {@link IconsStateBroadcast}).
 *
 * @internal Not exposed directly - use the exported functions.
 */
class IconsRegistry {
  private readonly _listeners = new Set<IconCallback>();
  private readonly _references: IconsCollection<IconMeta> = new Map();
  private readonly _collections: IconsCollection<SvgIcon> = new Map([
    ['internal', internalIcons],
  ]);
  private readonly _svgIconParser = new SvgIconParser();
  private readonly _broadcast = new IconsStateBroadcast(
    this._collections,
    this._references
  );
  private _notificationScheduled = false;

  /**
   * Parses and stores an SVG icon, then publishes and notifies.
   *
   * @param stripMeta - See {@link RegisterIconOptions.stripMeta}.
   * @throws If the SVG text is malformed.
   */
  public register(
    name: string,
    iconText: string,
    collection = 'default',
    stripMeta = false
  ): void {
    const svgIcon = this._svgIconParser.parse(iconText, stripMeta);
    collectionOf(this._collections, collection).set(name, svgIcon);

    this._broadcast.send({
      actionType: ActionType.RegisterIcon,
      collections: new Map([[collection, new Map([[name, svgIcon]])]]),
    });

    this._notify();
  }

  /**
   * Subscribes a callback to registry changes. It is invoked once per
   * microtask, however many icons changed, so subscribers re-resolve their
   * own state.
   */
  public subscribe(callback: IconCallback): void {
    this._listeners.add(callback);
  }

  /** Unsubscribes a previously subscribed callback. */
  public unsubscribe(callback: IconCallback): void {
    this._listeners.delete(callback);
  }

  /**
   * Aliases an icon name to another icon.
   *
   * @remarks
   * `overwrite` stores the reference and notifies subscribers; `external`
   * marks it as user-set, which takes precedence over the built-in theme
   * aliases and is published to other browsing contexts.
   */
  public setIconRef(options: IconReferencePair): void {
    const { alias, target, overwrite } = options;

    if (overwrite) {
      collectionOf(this._references, alias.collection).set(alias.name, {
        name: target.name,
        collection: target.collection,
        external: target.external,
      });
      this._notify();
    }

    if (target.external) {
      const ref = { name: target.name, collection: target.collection };

      this._broadcast.send({
        actionType: ActionType.UpdateIconReference,
        references: new Map([[alias.collection, new Map([[alias.name, ref]])]]),
      });
    }
  }

  /**
   * Resolves a name that may be an alias to the icon it points at, for the
   * given theme. The result never carries the internal `external` flag.
   */
  public getIconRef(name: string, collection: string, theme?: Theme): IconMeta {
    // Check for any user-set reference first (external or internal)
    const storedRef = this._references.get(collection)?.get(name);
    if (storedRef) {
      return {
        name: storedRef.name,
        collection: storedRef.collection,
      };
    }

    // Resolve theme-based alias for the default collection
    if (collection === 'default' && theme) {
      const targets = ICON_REFERENCES.get(name);
      const target = targets?.get(theme) ?? targets?.get('default');

      if (target) {
        return target;
      }
    }

    return { name, collection };
  }

  /** Retrieves an icon. Resolve aliases with `getIconRef` first. */
  public get(name: string, collection = 'default'): SvgIcon | undefined {
    return this._collections.get(collection)?.get(name);
  }

  /**
   * Notifies subscribers, coalescing a burst of changes in the same microtask
   * into a single notification.
   */
  private _notify(): void {
    if (this._notificationScheduled) {
      return;
    }

    this._notificationScheduled = true;

    queueMicrotask(() => {
      this._notificationScheduled = false;

      for (const listener of this._listeners) {
        listener();
      }
    });
  }
}

const registry = Symbol.for('igc.icons-registry.instance');

type IgcIconRegistry = typeof globalThis & {
  [registry]?: IconsRegistry;
};

/**
 * Gets the icon registry, creating it on first use. The well-known symbol on
 * `globalThis` keeps it a single instance even across multiple bundles.
 */
export function getIconRegistry(): IconsRegistry {
  const global = globalThis as IgcIconRegistry;
  global[registry] ??= new IconsRegistry();
  return global[registry];
}

/**
 * Registers an icon by fetching it from a URL.
 *
 * @param name - The unique name for the icon
 * @param url - The URL to fetch the SVG icon from
 * @param collection - The collection to register the icon in (default: `'default'`)
 *
 * @returns A promise that resolves when the icon is registered
 *
 * @throws If the HTTP request fails or returns a non-OK status
 */
export async function registerIcon(
  name: string,
  url: string,
  collection?: string
): Promise<void>;

/**
 * Registers an icon by fetching it from a URL.
 *
 * @param name - The unique name for the icon
 * @param url - The URL to fetch the SVG icon from
 * @param options - Registration options: target collection and/or `stripMeta`
 *
 * @returns A promise that resolves when the icon is registered
 *
 * @throws If the HTTP request fails or returns a non-OK status
 *
 * @remarks
 * This overload accepts a {@link RegisterIconOptions} object so you can control
 * the target collection **and** opt into SVG meta stripping in one call:
 *
 * ```typescript
 * // Strip <title>/<desc> to prevent browser-native tooltips on hover
 * await registerIcon('home', '/icons/home.svg', { stripMeta: true });
 *
 * // Or with a custom collection:
 * await registerIcon('home', '/icons/home.svg', {
 *   collection: 'my-lib',
 *   stripMeta: true,
 * });
 * ```
 */
export async function registerIcon(
  name: string,
  url: string,
  options?: RegisterIconOptions
): Promise<void>;

export async function registerIcon(
  name: string,
  url: string,
  collectionOrOptions?: string | RegisterIconOptions
): Promise<void> {
  const { collection, stripMeta } = resolveIconOptions(collectionOrOptions);
  const response = await fetch(url);

  if (response.ok) {
    const value = await response.text();
    getIconRegistry().register(name, value, collection, stripMeta);
  } else {
    throw new Error(`Icon request failed. Status: ${response.status}.`);
  }
}

/**
 * Registers an icon from SVG text content.
 *
 * @param name - The unique name for the icon
 * @param iconText - The SVG markup as a string
 * @param collection - The collection to register the icon in (default: `'default'`)
 *
 * @throws If the SVG text is malformed or doesn't contain an SVG element
 */
export function registerIconFromText(
  name: string,
  iconText: string,
  collection?: string
): void;

/**
 * Registers an icon from SVG text content.
 *
 * @param name - The unique name for the icon
 * @param iconText - The SVG markup as a string
 * @param options - Registration options: target collection and/or `stripMeta`
 *
 * @throws If the SVG text is malformed or doesn't contain an SVG element
 *
 * @remarks
 * This overload accepts a {@link RegisterIconOptions} object so you can control
 * the target collection **and** opt into SVG meta stripping in one call:
 *
 * ```typescript
 * const iconSvg = '<svg viewBox="0 0 24 24"><title>Home</title><path d="..."/></svg>';
 *
 * // Strip <title>/<desc> to prevent browser-native tooltips on hover
 * registerIconFromText('home', iconSvg, { stripMeta: true });
 *
 * // Or with a custom collection:
 * registerIconFromText('home', iconSvg, { collection: 'my-lib', stripMeta: true });
 * ```
 */
export function registerIconFromText(
  name: string,
  iconText: string,
  options?: RegisterIconOptions
): void;

export function registerIconFromText(
  name: string,
  iconText: string,
  collectionOrOptions?: string | RegisterIconOptions
): void {
  const { collection, stripMeta } = resolveIconOptions(collectionOrOptions);
  getIconRegistry().register(name, iconText, collection, stripMeta);
}

/**
 * Sets an icon reference/alias that points to another icon.
 *
 * @param name - The alias name
 * @param collection - The collection for the alias
 * @param icon - The target icon metadata (name and collection)
 *
 * @remarks
 * Icon references allow you to create aliases that point to other icons.
 * This is useful for:
 * - Creating semantic names (e.g., 'close' → 'x')
 * - Overriding default icon mappings
 * - Providing fallbacks for missing icons
 *
 * User-set references are marked as external and have higher priority than
 * theme-based aliases. They are also published to other browsing contexts.
 *
 * @example
 * ```typescript
 * // Register target icon
 * registerIconFromText('x-mark', '<svg>...</svg>');
 *
 * // Create an alias
 * setIconRef('close', 'default', {
 *   name: 'x-mark',
 *   collection: 'default'
 * });
 *
 * // Both work the same way:
 * // <igc-icon name="close"></igc-icon>
 * // <igc-icon name="x-mark"></igc-icon>
 * ```
 */
export function setIconRef(name: string, collection: string, icon: IconMeta) {
  getIconRegistry().setIconRef({
    alias: { name, collection },
    target: {
      name: icon.name,
      collection: icon.collection,
      external: true,
    },
    overwrite: true,
  });
}
