import { internalIcons } from './internal-icons-lib.js';
import { SvgIconParser } from './registry/parser.js';
import type {
  BroadcastIconsChangeMessage,
  Collection,
  IconMeta,
  SvgIcon,
} from './registry/types.js';
import { ActionType } from './registry/types.js';

export class IconsStateBroadcast {
  private parser: SvgIconParser;
  private iconBroadcastChannel: BroadcastChannel;
  private collections: Collection<string, Map<string, SvgIcon>>;
  private refsCollection: Collection<string, Map<string, IconMeta>>;

  constructor(
    collections: Collection<string, Map<string, SvgIcon>>,
    refsCollection: Collection<string, Map<string, IconMeta>>
  ) {
    this.collections = collections;
    this.refsCollection = refsCollection;
    this.parser = new SvgIconParser();
    this.iconBroadcastChannel = new BroadcastChannel('ignite-ui-icon-channel');
    this.onBroadcastMessageReceived =
      this.onBroadcastMessageReceived.bind(this);
    this.iconBroadcastChannel.addEventListener(
      'message',
      this.onBroadcastMessageReceived
    );
  }

  public broadcastState(
    actionType: ActionType,
    collections?: Collection<string, Map<string, SvgIcon>>,
    refs?: Collection<string, Map<string, IconMeta>>
  ) {
    const message: BroadcastIconsChangeMessage = {
      actionType: actionType,
      references: refs ? this.getMapCollection(refs) : undefined,
      collections: collections ? this.getMapCollection(collections) : undefined,
    };
    this.iconBroadcastChannel.postMessage(message);
  }

  private onBroadcastMessageReceived(event: MessageEvent) {
    const message = event.data as BroadcastIconsChangeMessage;
    if (message.actionType === ActionType.SyncState) {
      // send state
      const userSetCollection: Map<
        string,
        Map<string, SvgIcon>
      > = this.getUserSetCollection(this.collections);
      const refs: Map<string, Map<string, IconMeta>> = this.getMapCollection(
        this.refsCollection
      );
      const message: BroadcastIconsChangeMessage = {
        actionType: ActionType.SyncState,
        collections: userSetCollection,
        references: refs,
      };
      this.iconBroadcastChannel.postMessage(message);
    }
  }

  private getUserSetCollection(
    collections: Collection<string, Map<string, SvgIcon>>
  ) {
    const userSetIcons: Map<string, Map<string, SvgIcon>> = new Map();
    collections.forEach((collection, collectionKey) => {
      collection.forEach((icon, iconKey) => {
        const val = icon.svg;
        const internalVal = internalIcons.get(iconKey)?.svg;

        if (val && (val !== internalVal || collectionKey !== 'internal')) {
          if (!userSetIcons.has(collectionKey)) {
            userSetIcons.set(collectionKey, new Map<string, SvgIcon>());
          }
          userSetIcons.get(collectionKey)!.set(iconKey, this.parser.parse(val));
        }
      });
    });
    return userSetIcons;
  }

  private getMapCollection(
    collections: Collection<string, Map<string, any>>
  ): Map<string, Map<string, any>> {
    const mapCollections: Map<string, Map<string, any>> = new Map();
    collections.forEach((_collection, collectionKey) => {
      mapCollections.set(
        collectionKey,
        collections.get(collectionKey) || new Map()
      );
    });
    return mapCollections;
  }
}
