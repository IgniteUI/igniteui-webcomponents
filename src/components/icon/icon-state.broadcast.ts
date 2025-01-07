import { createIconDefaultMap } from './registry/default-map.js';
import type {
  BroadcastIconsChangeMessage,
  IconMeta,
  IconsCollection,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

export class IconsStateBroadcast {
  private channel!: BroadcastChannel | null;
  private collections: IconsCollection<SvgIcon>;
  private refsCollection: IconsCollection<IconMeta>;

  constructor(
    collections: IconsCollection<SvgIcon>,
    refsCollection: IconsCollection<IconMeta>
  ) {
    this.collections = collections;
    this.refsCollection = refsCollection;
    this.create();

    globalThis.addEventListener('pageshow', () => this.create());
    globalThis.addEventListener('pagehide', () => this.dispose());
  }

  public send(data: BroadcastIconsChangeMessage) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
  }

  public handleEvent({ data }: MessageEvent<BroadcastIconsChangeMessage>) {
    // no need to sync with other wc icon services, just with angular elements
    if (
      data.actionType !== ActionType.SyncState ||
      data.origin === 'igniteui-webcomponents'
    ) {
      return;
    }

    this.send({
      actionType: ActionType.SyncState,
      collections: this.getUserSetCollection(this.collections).toMap(),
      references: this.getUserRefsCollection(this.refsCollection).toMap(),
      origin: 'igniteui-webcomponents',
    });
  }

  private create() {
    if (!this.channel) {
      this.channel = new BroadcastChannel('ignite-ui-icon-channel');
      this.channel.addEventListener('message', this);
    }
  }

  /* c8 ignore next 7 */
  private dispose() {
    if (this.channel) {
      this.channel.removeEventListener('message', this);
      this.channel.close();
      this.channel = null;
    }
  }

  private getUserRefsCollection(collections: IconsCollection<IconMeta>) {
    const userSetIcons = createIconDefaultMap<string, IconMeta>();
    for (const [collectionKey, collection] of collections.entries()) {
      for (const [iconKey, icon] of collection.entries()) {
        if (icon.external) {
          userSetIcons.getOrCreate(collectionKey).set(iconKey, icon);
        }
      }
    }
    return userSetIcons;
  }

  private getUserSetCollection(collections: IconsCollection<SvgIcon>) {
    const userSetIcons = createIconDefaultMap<string, SvgIcon>();

    for (const [collectionKey, collection] of collections.entries()) {
      if (collectionKey === 'internal') {
        continue;
      }
      for (const [iconKey, icon] of collection.entries()) {
        userSetIcons.getOrCreate(collectionKey).set(iconKey, icon);
      }
    }
    return userSetIcons;
  }
}
