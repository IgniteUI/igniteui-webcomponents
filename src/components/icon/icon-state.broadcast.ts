import { isServer } from 'lit';

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
 * Publishes icon registry state to other browsing contexts of the same origin
 * using the BroadcastChannel API.
 *
 * @remarks
 * The traffic is one-way by design: this side broadcasts its own registrations
 * and reference updates, and answers a peer's `SyncState` request with the
 * user-set part of the registry. It never applies inbound state and never
 * requests a sync itself - the Ignite UI for Angular icon service is the peer
 * that consumes these messages.
 *
 * The channel is created on page show and disposed on page hide, so a page
 * restored from the bfcache gets a working one. Under SSR the instance is inert.
 */
export class IconsStateBroadcast {
  private static readonly _origin = 'igniteui-webcomponents';

  private readonly _iconsCollection: IconsCollection<SvgIcon>;
  private readonly _iconReferences: IconsCollection<IconMeta>;

  private _channel: BroadcastChannel | null = null;

  constructor(
    iconsCollection: IconsCollection<SvgIcon>,
    iconReferences: IconsCollection<IconMeta>
  ) {
    this._iconsCollection = iconsCollection;
    this._iconReferences = iconReferences;

    if (isServer) {
      return;
    }

    globalThis.addEventListener('pageshow', this);
    globalThis.addEventListener('pagehide', this);

    this._create();
  }

  /** Posts a message to the other browsing contexts of this origin. */
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
      collections: this._userIcons(),
      references: this._userReferences(),
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

  /** The user-set references, skipping collections that have none. */
  private _userReferences(): IconsCollection<IconMeta> {
    const result: IconsCollection<IconMeta> = new Map();

    for (const [name, references] of this._iconReferences) {
      const external = new Map(
        [...references].filter(([, ref]) => ref.external)
      );

      if (external.size > 0) {
        result.set(name, external);
      }
    }

    return result;
  }

  /** Every registered collection except the built-in `internal` one. */
  private _userIcons(): IconsCollection<SvgIcon> {
    const result: IconsCollection<SvgIcon> = new Map();

    for (const [name, icons] of this._iconsCollection) {
      if (name !== 'internal') {
        result.set(name, new Map(icons));
      }
    }

    return result;
  }
}
