import type { Theme } from '../../theming/types.js';
import { iconReferences } from './icon-references.js';
import { internalIcons } from './internal-icons-lib.js';
import { DefaultMap } from './registry/default-map.js';
import { type SvgIcon, SvgIconParser } from './registry/parser.js';

export type IconCollection = Record<string, SvgIcon>;
export type IconMeta = { name: string; collection: string; external?: boolean };
export type RefCollection = Map<string, IconMeta>;
export type Themes = Theme | 'default';
export type IconReferences = Set<{
  alias: IconMeta;
  target: Map<Themes, IconMeta>;
}>;
export type IconRefPair = {
  alias: IconMeta;
  target: IconMeta;
  overwrite: boolean;
};

type IconCallback = (name: string, collection: string) => void;

export class IconsRegistry {
  private parser: SvgIconParser;

  private collections = new DefaultMap<string, IconCollection>(() => ({}));
  private references = new Map<string, RefCollection>();
  private listeners = new Set<IconCallback>();
  private theme!: Theme;

  constructor() {
    this.parser = new SvgIconParser();
    this.collections.set('internal', internalIcons);
  }

  public register(name: string, iconText: string, collection = 'default') {
    const _collection = this.collections.getOrCreate(collection);
    _collection[name] = this.parser.parse(iconText);

    for (const listener of this.listeners) {
      listener(name, collection);
    }
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

  public setIconRef(options: IconRefPair) {
    const { alias, target, overwrite } = options;
    const reference = this.getOrCreateReference(alias.collection);

    if (overwrite) {
      reference.set(alias.name, { ...target });
    }

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
    return this.collections.get(collection)?.[name];
  }

  private getOrCreateReference(collection: string) {
    if (!this.references.has(collection)) {
      this.references.set(collection, new Map<string, IconMeta>());
    }

    return this.references.get(collection) as RefCollection;
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
