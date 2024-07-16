import { internalIcons } from './internal-icons-lib.js';

export type IconCollection = { [name: string]: ParsedIcon };
export type IconMeta = { name: string; collection: string };
export type IconRefs = Map<string, IconMeta>;
export type IconRefOptions = {
  alias: IconMeta;
  target: IconMeta;
};

type IconCallback = (name: string, collection: string) => void;

interface ParsedIcon {
  svg: string;
  title?: string;
}

export class IconsRegistry {
  private _parser: DOMParser;

  private collections = new Map<string, IconCollection>();
  private references = new Map<string, IconRefs>();
  private listeners = new Set<IconCallback>();

  constructor() {
    this._parser = new DOMParser();
    this.collections.set('internal', internalIcons);
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
  }

  public setIconRef(options: IconRefOptions) {
    const { alias, target } = options;
    const reference = this.getOrCreateReference(alias.collection);
    reference.set(alias.name, { ...target });

    for (const listener of this.listeners) {
      listener(alias.name, alias.collection);
    }
  }

  public getIconRef(name: string, collection: string): IconMeta {
    const icon = this.references.get(collection)?.get(name);

    return {
      name: icon?.name ?? name,
      collection: icon?.collection ?? collection,
    };
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

  private getOrCreateReference(collection: string) {
    if (!this.references.has(collection)) {
      this.references.set(collection, new Map<string, IconMeta>());
    }

    return this.references.get(collection) as IconRefs;
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
    target: icon,
  });
}
