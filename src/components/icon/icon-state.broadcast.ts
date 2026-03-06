import type {
  BroadcastIconsChangeMessage,
  IconMeta,
  IconsCollection,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

type IconBroadcastEvent =
  | MessageEvent<BroadcastIconsChangeMessage>
  | PageTransitionEvent;

/**
 * Manages cross-context synchronization of icon state using the BroadcastChannel API.
 *
 * @remarks
 * This class enables icon registry state to be shared between different browsing contexts
 * (e.g., iframes, tabs) within the same origin. It specifically handles synchronization
 * with Angular elements that may be running in separate contexts.
 *
 * The broadcast channel is automatically created on page show and disposed on page hide
 * to properly handle bfcache (back/forward cache) scenarios.
 */
export class IconsStateBroadcast {
  private static readonly _origin = 'igniteui-webcomponents';

  private readonly _iconsCollection: IconsCollection<SvgIcon>;
  private readonly _iconReferences: IconsCollection<IconMeta>;

  private _channel: BroadcastChannel | null = null;

  /**
   * Creates an instance of IconsStateBroadcast.
   *
   * @param iconsCollection - The collection of registered SVG icons.
   * @param iconReferences - The collection of icon references/aliases.
   */
  constructor(
    iconsCollection: IconsCollection<SvgIcon>,
    iconReferences: IconsCollection<IconMeta>
  ) {
    this._iconsCollection = iconsCollection;
    this._iconReferences = iconReferences;

    globalThis.addEventListener('pageshow', this);
    globalThis.addEventListener('pagehide', this);

    this._create();
  }

  /**
   * Sends a message to other browsing contexts via the broadcast channel.
   */
  public send(data: BroadcastIconsChangeMessage): void {
    this._channel?.postMessage(data);
  }

  /** @internal */
  public handleEvent(event: IconBroadcastEvent): void {
    switch (event.type) {
      case 'message':
        this._syncState(event as MessageEvent<BroadcastIconsChangeMessage>);
        break;
      case 'pageshow':
        this._create();
        break;
      case 'pagehide':
        this._dispose();
        break;
    }
  }

  private _syncState({
    data: { actionType, origin },
  }: MessageEvent<BroadcastIconsChangeMessage>): void {
    // no need to sync with other wc icon services, just with angular elements
    if (
      actionType !== ActionType.SyncState ||
      origin === IconsStateBroadcast._origin
    ) {
      return;
    }

    this.send({
      actionType: ActionType.SyncState,
      collections: this._getUserSetCollection(this._iconsCollection),
      references: this._getUserRefsCollection(this._iconReferences),
      origin: IconsStateBroadcast._origin,
    });
  }

  private _create(): void {
    if (!this._channel) {
      this._channel = new BroadcastChannel('ignite-ui-icon-channel');
      this._channel.addEventListener('message', this);
    }
  }

  private _dispose(): void {
    this._channel?.removeEventListener('message', this);
    this._channel?.close();
    this._channel = null;
  }

  private _getUserRefsCollection(
    collections: IconsCollection<IconMeta>
  ): Map<string, Map<string, IconMeta>> {
    const userSetIcons = new Map<string, Map<string, IconMeta>>();

    for (const [collectionKey, collection] of collections.entries()) {
      for (const [iconKey, icon] of collection.entries()) {
        if (icon.external) {
          if (!userSetIcons.has(collectionKey)) {
            userSetIcons.set(collectionKey, new Map());
          }
          userSetIcons.get(collectionKey)!.set(iconKey, icon);
        }
      }
    }

    return userSetIcons;
  }

  private _getUserSetCollection(
    collections: IconsCollection<SvgIcon>
  ): Map<string, Map<string, SvgIcon>> {
    const userSetIcons = new Map<string, Map<string, SvgIcon>>();

    for (const [collectionKey, collection] of collections.entries()) {
      if (collectionKey === 'internal') {
        continue;
      }
      for (const [iconKey, icon] of collection.entries()) {
        if (!userSetIcons.has(collectionKey)) {
          userSetIcons.set(collectionKey, new Map());
        }
        userSetIcons.get(collectionKey)!.set(iconKey, icon);
      }
    }

    return userSetIcons;
  }
}
