import type { Theme } from '../../theming/types.js';
import { iconReferences } from './icon-references.js';
import { internalIcons } from './internal-icons-lib.js';

export type IconCollection = { [name: string]: ParsedIcon };
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

interface ParsedIcon {
  svg: string;
  title?: string;
}

export class IconsRegistry {
  private _parser: DOMParser;

  private collections = new Map<string, IconCollection>();
  private references = new Map<string, RefCollection>();
  private listeners = new Set<IconCallback>();
  private theme!: Theme;

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
