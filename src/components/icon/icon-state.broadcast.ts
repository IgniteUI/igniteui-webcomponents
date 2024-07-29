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
  constructor(
    collections: Collection<string, Map<string, SvgIcon>>,
    refsCollection: Collection<string, Map<string, IconMeta>>
  ) {
    this.parser = new SvgIconParser();
    this.iconBroadcastChannel = new BroadcastChannel('ignite-ui-icon-channel');
    this.iconBroadcastChannel.onmessage = (event) => {
      const message = event.data as BroadcastIconsChangeMessage;
      if (message.actionType === ActionType.SyncState) {
        // send state
        const userSetCollection: Map<
          string,
          Map<string, SvgIcon>
        > = this.getUserSetCollection(collections);
        const refs: Map<string, Map<string, IconMeta>> = this.getMapCollection(
          refsCollection
        );
        const message: BroadcastIconsChangeMessage = {
          actionType: ActionType.SyncState,
          collections: userSetCollection,
          references: refs,
        };
        this.iconBroadcastChannel.postMessage(message);
      }
    };
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

  private getUserSetCollection(
    collections: Collection<string, Map<string, SvgIcon>>
  ) {
    const userSetIcons: Map<string, Map<string, SvgIcon>> = new Map();
    const collectionKeys = collections.keys();
    for (const collectionKey of collectionKeys) {
      const collection = collections.get(collectionKey);
      for (const iconKey in collection) {
        const val = collection.get(iconKey)?.svg;
        const internalValue = internalIcons.get(iconKey)?.svg;
        if (val && val !== internalValue) {
          let icons = userSetIcons.get(collectionKey);
          if (!icons) {
            userSetIcons.set(collectionKey, new Map<string, SvgIcon>());
            icons = userSetIcons.get(collectionKey);
          }
          if (icons) {
            icons.set(iconKey, this.parser.parse(val));
          }
        }
      }
    }
    return userSetIcons;
  }

  private getMapCollection(
    collection: Collection<string, Map<string, any>>
  ): Map<string, Map<string, any>> {
    const refs: Map<string, Map<string, any>> = new Map();
    const refKeys = collection.keys();
    for (const collectionKey of refKeys) {
      refs.set(collectionKey, collection.get(collectionKey) || new Map());
    }
    return refs;
  }
}
