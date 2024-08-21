import { createIconDefaultMap } from './registry/default-map.js';
import type {
  BroadcastIconsChangeMessage,
  IconMeta,
  IconsCollection,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

export class IconsStateBroadcast {
  private iconBroadcastChannel: BroadcastChannel;
  private collections: IconsCollection<SvgIcon>;
  private refsCollection: IconsCollection<IconMeta>;

  constructor(
    collections: IconsCollection<SvgIcon>,
    refsCollection: IconsCollection<IconMeta>
  ) {
    this.collections = collections;
    this.refsCollection = refsCollection;
    this.iconBroadcastChannel = new BroadcastChannel('ignite-ui-icon-channel');
    this.iconBroadcastChannel.addEventListener('message', this);
  }

  public send(data: BroadcastIconsChangeMessage) {
    this.iconBroadcastChannel.postMessage(data);
  }

  public handleEvent({ data }: MessageEvent<BroadcastIconsChangeMessage>) {
    if (data.actionType !== ActionType.SyncState) {
      return;
    }

    this.send({
      actionType: ActionType.SyncState,
      collections: this.getUserSetCollection(this.collections).toMap(),
      references: this.getRefsSetCollection(this.refsCollection).toMap(),
    });
  }

  private getRefsSetCollection(collections: IconsCollection<IconMeta>) {
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
