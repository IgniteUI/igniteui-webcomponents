import type { Theme } from '../../theming/types.js';
import { ICON_REFERENCES } from './icon-references.js';
import { IconsStateBroadcast } from './icon-state.broadcast.js';
import { internalIcons } from './internal-icons-lib.js';
import { createIconDefaultMap } from './registry/default-map.js';
import { SvgIconParser } from './registry/parser.js';
import type {
  IconCallback,
  IconMeta,
  IconReferencePair,
  RegisterIconOptions,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

/**
 * Resolves the stripMeta argument of `registerIcon` / `registerIconFromText`.
 *
 * Accepts either the plain-string collection name **or** the
 * {@link RegisterIconOptions} object, and always returns a fully-resolved
 * options record so call-sites do not need to branch.
 *
 * @internal
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

/**
 * Global singleton registry for managing SVG icons and their references.
 *
 * @remarks
 * The IconsRegistry class handles:
 * - Registration and storage of SVG icons in collections
 * - Icon reference/alias management with theme-based resolution
 * - Notification of icon changes to subscribed components
 * - Cross-context synchronization via BroadcastChannel
 * - Batched notifications for performance optimization
 *
 * This is a singleton managed via Symbol.for to ensure a single instance
 * across the entire application, even with multiple bundle instances.
 *
 * @internal This class is not directly exposed. Use the exported functions instead.
 */
class IconsRegistry {
  /** Set of callbacks subscribed to icon change notifications */
  private readonly _listeners = new Set<IconCallback>();

  /** Set of pending icon:collection keys awaiting notification */
  private readonly _pendingNotifications = new Set<string>();

  /** Map of icon references/aliases by collection and name */
  private readonly _references = createIconDefaultMap<string, IconMeta>();

  /** Map of registered SVG icons by collection and name */
  private readonly _collections = createIconDefaultMap<string, SvgIcon>().set(
    'internal',
    internalIcons
  );

  /** Parser for converting SVG text to icon metadata */
  private readonly _svgIconParser = new SvgIconParser();

  /** Broadcast channel manager for cross-context synchronization */
  private readonly _broadcast = new IconsStateBroadcast(
    this._collections,
    this._references
  );

  /** Flag indicating if a notification microtask is scheduled */
  private _notificationScheduled = false;

  /**
   * Registers an SVG icon in the registry.
   *
   * @param name - The unique name for the icon within its collection
   * @param iconText - The SVG markup as a string
   * @param collection - The collection to register the icon in (default: 'default')
   * @param stripMeta - When `true`, strips `<title>` and `<desc>` elements from
   *   the SVG before storing it (see {@link RegisterIconOptions.stripMeta}).
   *
   * @remarks
   * This method:
   * 1. Parses the SVG text into icon metadata
   * 2. Stores the icon in the specified collection
   * 3. Broadcasts the registration to other contexts
   * 4. Notifies subscribed components (batched)
   *
   * @throws Will throw if the SVG text is malformed
   */
  public register(
    name: string,
    iconText: string,
    collection = 'default',
    stripMeta = false
  ): void {
    const svgIcon = this._svgIconParser.parse(iconText, stripMeta);
    this._collections.getOrCreate(collection).set(name, svgIcon);

    const icons = createIconDefaultMap<string, SvgIcon>();
    icons.getOrCreate(collection).set(name, svgIcon);

    this._broadcast.send({
      actionType: ActionType.RegisterIcon,
      collections: icons.toPlainMap(),
    });

    this._notifyAll(name, collection);
  }

  /**
   * Subscribes a callback to icon change notifications.
   *
   * @param callback - Function to call when icons are registered or updated
   *
   * @remarks
   * The callback receives the icon name and collection when changes occur.
   * Notifications are batched using microtasks for performance.
   */
  public subscribe(callback: IconCallback): void {
    this._listeners.add(callback);
  }

  /**
   * Unsubscribes a callback from icon change notifications.
   *
   * @param callback - The previously subscribed callback to remove
   */
  public unsubscribe(callback: IconCallback): void {
    this._listeners.delete(callback);
  }

  /**
   * Sets an icon reference/alias.
   *
   * @param options - Configuration for the icon reference
   *
   * @remarks
   * Icon references allow icons to be aliased with different names.
   * They can be:
   * - User-set (external: true) - higher priority, synced across contexts
   * - System-set (external: false) - used internally, not synced
   *
   * When overwrite is true, the reference is stored and subscribers are notified.
   * When external is true, the reference is broadcast to other contexts.
   */
  public setIconRef(options: IconReferencePair): void {
    const { alias, target, overwrite } = options;
    const reference = this._references.getOrCreate(alias.collection);

    if (overwrite) {
      reference.set(alias.name, {
        name: target.name,
        collection: target.collection,
        external: target.external,
      });
      this._notifyAll(alias.name, alias.collection);
    }
    if (target.external) {
      const refs = createIconDefaultMap<string, IconMeta>();
      refs.getOrCreate(alias.collection).set(alias.name, {
        name: target.name,
        collection: target.collection,
      });

      this._broadcast.send({
        actionType: ActionType.UpdateIconReference,
        references: refs.toPlainMap(),
      });
    }
  }

  /**
   * Gets the icon reference, resolving aliases based on the provided theme.
   *
   * @param name - The icon name or alias
   * @param collection - The collection name
   * @param theme - The theme to use for resolving aliases
   * @returns The resolved icon metadata (without the internal 'external' flag)
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

    // Resolve theme-based alias for default collection
    if (collection === 'default' && theme) {
      const alias = ICON_REFERENCES.find(
        (ref) => ref.alias.name === name && ref.alias.collection === 'default'
      );

      if (alias) {
        const target = alias.target.get(theme) ?? alias.target.get('default');
        if (target) {
          return target;
        }
      }
    }

    // Return as-is if no reference found
    return { name, collection };
  }

  /**
   * Retrieves an icon from the registry.
   *
   * @param name - The icon name
   * @param collection - The collection name (default: 'default')
   * @returns The SVG icon metadata, or undefined if not found
   *
   * @remarks
   * Use `getIconRef` first to resolve aliases before calling this method.
   */
  public get(name: string, collection = 'default'): SvgIcon | undefined {
    return this._collections.get(collection)?.get(name);
  }

  /**
   * Schedules a batched notification for icon changes.
   *
   * @param name - The icon name that changed
   * @param collection - The collection name
   *
   * @remarks
   * Notifications are batched in a microtask queue to avoid excessive
   * listener calls when multiple icons are registered synchronously.
   * Duplicate icon:collection pairs are automatically deduplicated.
   *
   * @internal
   */
  private _notifyAll(name: string, collection: string): void {
    const key = `${collection}:${name}`;
    this._pendingNotifications.add(key);

    if (!this._notificationScheduled) {
      this._notificationScheduled = true;
      queueMicrotask(() => {
        this._flushNotifications();
      });
    }
  }

  /**
   * Flushes pending notifications to all subscribed listeners.
   *
   * @remarks
   * This method is called as a microtask after icons are registered.
   * It processes all pending icon:collection pairs and notifies listeners.
   *
   * @internal
   */
  private _flushNotifications(): void {
    const notifications = Array.from(this._pendingNotifications);
    this._pendingNotifications.clear();
    this._notificationScheduled = false;

    for (const key of notifications) {
      const [collection, ...nameParts] = key.split(':');
      const name = nameParts.join(':');

      for (const listener of this._listeners) {
        listener(name, collection);
      }
    }
  }
}

/** Global symbol key for the singleton registry instance */
const registry = Symbol.for('igc.icons-registry.instance');

/** Type augmentation for globalThis to include the registry */
type IgcIconRegistry = typeof globalThis & {
  [registry]?: IconsRegistry;
};

/**
 * Gets the global icon registry singleton instance.
 *
 * @returns The IconsRegistry singleton
 *
 * @remarks
 * This function ensures only one instance of the registry exists globally,
 * even across multiple bundle instances. The registry is stored on globalThis
 * using a well-known Symbol.
 *
 * @example
 * ```typescript
 * const registry = getIconRegistry();
 * registry.subscribe((name, collection) => {
 *   console.log(`Icon ${name} changed in ${collection}`);
 * });
 * ```
 */
export function getIconRegistry() {
  const _global = globalThis as IgcIconRegistry;
  if (!_global[registry]) {
    _global[registry] = new IconsRegistry();
  }
  return _global[registry];
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
 * theme-based aliases. They are also synchronized across browsing contexts.
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
