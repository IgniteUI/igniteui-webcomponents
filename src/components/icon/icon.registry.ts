import type { Theme } from '../../theming/types.js';
import { sameObject } from '../common/util.js';
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

export class IconsRegistry {
  private parser: SvgIconParser;
  private collections: Collection<string, Map<string, SvgIcon>>;
  private references: Collection<string, Map<string, IconMeta>>;
  private listeners: Set<IconCallback>;
  private theme!: Theme;

  constructor() {
    this.parser = new SvgIconParser();
    this.listeners = new Set();
    this.collections = new DefaultMap(() => new Map());
    this.references = new DefaultMap(() => new Map());

    this.collections.set('internal', internalIcons);
  }

  public register(name: string, iconText: string, collection = 'default') {
    this.collections
      .getOrCreate(collection)
      .set(name, this.parser.parse(iconText));

    this.notifyAll(name, collection);
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

        const _ref = this.references.get('default')?.get(alias.name) ?? {};
        const _target = target.get(this.theme) ?? target.get('default')!;

        this.setIconRef({
          alias,
          target: _target,
          overwrite: !external && !sameObject(_ref, _target),
        });
      }
    }
  }

  public setIconRef(options: IconReferencePair) {
    const { alias, target, overwrite } = options;
    const reference = this.references.getOrCreate(alias.collection);

    if (overwrite) {
      reference.set(alias.name, { ...target });
      this.notifyAll(alias.name, alias.collection);
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
    return this.collections.get(collection)?.get(name);
  }

  private notifyAll(name: string, collection: string) {
    for (const listener of this.listeners) {
      listener(name, collection);
    }
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
