import { internalIcons } from './internal-icons-lib.js';

export type IconCollection = { [name: string]: ParsedIcon };

type IconCallback = (name: string, collection: string) => void;

interface ParsedIcon {
  svg: string;
  title?: string;
}
enum ActionType {
  SyncState,
  UpdateState
}

interface BroadcastIconsChangeMessage {
  actionType: ActionType,
  collections:  Map<string, IconCollection>
}

export class IconsRegistry {
  private _parser: DOMParser;

  private collections = new Map<string, IconCollection>();
  private listeners = new Set<IconCallback>();
  private iconBroadcastChannel: BroadcastChannel;

  constructor() {
    this._parser = new DOMParser();
    this.collections.set('internal', internalIcons);
    // open broadcast channel for sync with angular icon service.
    this.iconBroadcastChannel = new BroadcastChannel("ignite-ui-icon-channel");
    this.iconBroadcastChannel.onmessage = (event) => {
      const message = event.data as BroadcastIconsChangeMessage;
      console.log(event);
      if (message.actionType === ActionType.SyncState) {
        // send state
        const userSetCollection: Map<string, IconCollection> = this.getUserSetCollection();
        const message: BroadcastIconsChangeMessage = {
          actionType: ActionType.SyncState,
          collections: userSetCollection
        };
        this.iconBroadcastChannel.postMessage(message);
      }
    };

  }

  public subscribe(callback: IconCallback) {
    this.listeners.add(callback);
  }

  public unsubscribe(callback: IconCallback) {
    this.listeners.delete(callback);
  }

  private parseSVG(svgString: string): ParsedIcon {
    const parsed = this._parser.parseFromString(svgString, 'image/svg+xml');
    const svg = parsed.querySelector('svg');

    if (parsed.querySelector('parsererror') || !svg) {
      throw new Error('SVG element not found or malformed SVG string.');
    }

    svg.setAttribute('fit', '');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    return {
      svg: svg.outerHTML,
      title: svg.querySelector('title')?.textContent ?? '',
    };
  }

  public register(name: string, iconText: string, collection = 'default') {
    const namespace = this.getOrCreateCollection(collection);
    namespace[name] = this.parseSVG(iconText);

    for (const listener of this.listeners) {
      listener(name, collection);
    }
    const userSetCollection: Map<string, IconCollection> = new Map<string, IconCollection>();
    if (!userSetCollection.has(collection)) {
        userSetCollection.set(collection, {});
    }
    const internalValue = internalIcons[name];
    if (internalValue?.svg !== iconText) {
      const currCollection = userSetCollection.get(collection);
      if (currCollection){
          currCollection[name] = namespace[name];
      }
    }
    const message: BroadcastIconsChangeMessage = {
      actionType: ActionType.SyncState,
      collections: userSetCollection
    };
    this.iconBroadcastChannel.postMessage(message);
  }

  public get(name: string, collection = 'default') {
    return this.collections.has(collection)
      ? this.collections.get(collection)![name]
      : undefined;
  }

  private getOrCreateCollection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, {});
    }

    return this.collections.get(name) as IconCollection;
  }

  private getUserSetCollection() {
    const userSetIcons: Map<string, IconCollection> = new Map<string, IconCollection>();
    const collectionKeys = this.collections.keys();
    for (const collectionKey of collectionKeys) {
      const collection = this.collections.get(collectionKey);
      for (const iconKey in collection) {
        const val = collection[iconKey];
        const internalValue = internalIcons[iconKey];
        if (val !== internalValue) {
          if (!userSetIcons.has(collectionKey)) {
            userSetIcons.set(collectionKey, {});
          }
          var userSetIconCollection = userSetIcons.get(collectionKey);
          if (userSetIconCollection) {
            userSetIconCollection[iconKey] = val;
          }
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
