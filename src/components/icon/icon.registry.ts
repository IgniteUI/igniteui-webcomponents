import type { Theme } from '../../theming/types.js';
import { iconReferences } from './icon-references.js';
import { internalIcons } from './internal-icons-lib.js';
import { DefaultMap } from './registry/default-map.js';
import { SvgIconParser } from './registry/parser.js';
import type {
  Collection,
  IconCallback,
  IconMeta,
  IconReferencePair,
  SvgIcon,
} from './registry/types.js';

enum ActionType {
  SyncState = 0,
  RegisterIcon = 1,
  UpdateIconReference = 2,
}

interface BroadcastIconsChangeMessage {
  actionType: ActionType;
  collections?: Collection<string, Map<string, SvgIcon>>;
  references?: Collection<string, Map<string, IconMeta>>;
}
export class IconsRegistry {
  private parser: SvgIconParser;
  private collections: Collection<string, Map<string, SvgIcon>>;
  private references: Collection<string, Map<string, IconMeta>>;
  private listeners: Set<IconCallback>;
  private theme!: Theme;
  private iconBroadcastChannel: BroadcastChannel;

  constructor() {
    this.parser = new SvgIconParser();
    this.listeners = new Set();
    this.collections = new DefaultMap(() => new Map());
    this.references = new DefaultMap(() => new Map());

    this.collections.set('internal', internalIcons);
    this.iconBroadcastChannel = new BroadcastChannel('ignite-ui-icon-channel');
    this.iconBroadcastChannel.onmessage = (event) => {
      const message = event.data as BroadcastIconsChangeMessage;
      if (message.actionType === ActionType.SyncState) {
        // send state
        const userSetCollection: Collection<
          string,
          Map<string, SvgIcon>
        > = this.getUserSetCollection();
        const message: BroadcastIconsChangeMessage = {
          actionType: ActionType.SyncState,
          collections: userSetCollection,
          //TODO
          // references:
        };
        this.iconBroadcastChannel.postMessage(message);
      }
    };
  }

  public register(name: string, iconText: string, collection = 'default') {
    this.collections
      .getOrCreate(collection)
      .set(name, this.parser.parse(iconText));

    this.notifyAll(name, collection);
    const userSetCollection: Collection<
      string,
      Map<string, SvgIcon>
    > = new DefaultMap(() => new Map());
    userSetCollection
      .getOrCreate(collection)
      .set(name, this.parser.parse(iconText));
    const message: BroadcastIconsChangeMessage = {
      actionType: ActionType.SyncState,
      collections: userSetCollection,
    };
    this.iconBroadcastChannel.postMessage(message);
  }

  public subscribe(callback: IconCallback) {
    this.listeners.add(callback);
  }

  public unsubscribe(callback: IconCallback) {
    this.listeners.delete(callback);
  }

  public setRefsByTheme(theme: Theme) {
    if (this.theme !== theme) {
      this.theme = theme;

      for (const { alias, target } of iconReferences) {
        const external = this.references
          .get(alias.collection)
          ?.get(alias.name)?.external;

        this.setIconRef({
          alias,
          target: target.get(this.theme) ?? target.get('default')!,
          overwrite: !external,
        });
      }
    }
  }

  public setIconRef(options: IconReferencePair) {
    const { alias, target, overwrite } = options;
    const reference = this.references.getOrCreate(alias.collection);

    if (overwrite) {
      reference.set(alias.name, { ...target });
    }

    this.notifyAll(alias.name, alias.collection);
  }

  public getIconRef(name: string, collection: string): IconMeta {
    const icon = this.references.get(collection)?.get(name);

    return {
      name: icon?.name ?? name,
      collection: icon?.collection ?? collection,
    };
  }

  public get(name: string, collection = 'default') {
    return this.collections.get(collection)?.get(name);
  }

  private notifyAll(name: string, collection: string) {
    for (const listener of this.listeners) {
      listener(name, collection);
    }
  }

  private getUserSetCollection() {
    const userSetIcons: Collection<
      string,
      Map<string, SvgIcon>
    > = new DefaultMap(() => new Map());
    const collectionKeys = this.collections.keys();
    for (const collectionKey of collectionKeys) {
      const collection = this.collections.get(collectionKey);
      for (const iconKey in collection) {
        const val = collection.get(iconKey)?.svg;
        const internalValue = internalIcons.get(iconKey)?.svg;
        if (val && val !== internalValue) {
          userSetIcons
            .getOrCreate(collectionKey)
            .set(iconKey, this.parser.parse(val));
        }
      }
    }
    return userSetIcons;
  }
}

const registry = Symbol.for('igc.icons-registry.instance');

type IgcIconRegistry = typeof globalThis & {
  [registry]?: IconsRegistry;
};

export function getIconRegistry() {
  const _global = globalThis as IgcIconRegistry;
  if (!_global[registry]) {
    _global[registry] = new IconsRegistry();
  }
  return _global[registry];
}

export async function registerIcon(
  name: string,
  url: string,
  collection = 'default'
) {
  const response = await fetch(url);

  if (response.ok) {
    const value = await response.text();
    getIconRegistry().register(name, value, collection);
  } else {
    throw new Error(`Icon request failed. Status: ${response.status}.`);
  }
}

export function registerIconFromText(
  name: string,
  iconText: string,
  collection = 'default'
) {
  getIconRegistry().register(name, iconText, collection);
}

export function setIconRef(name: string, collection: string, icon: IconMeta) {
  getIconRegistry().setIconRef({
    alias: { name, collection },
    target: { ...icon, external: true },
    overwrite: true,
  });
}
