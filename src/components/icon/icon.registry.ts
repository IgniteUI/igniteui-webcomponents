/** READ BEFORE YOU MODIFY THIS FILE
 *
 * Before you add/modify an icon reference, please think about the sematics of the icon you are adding/modifying.
 *
 * Icon aliases have sematic meaning depending on the context in which they are used.
 * For instance, if your component handles toggling between expanded and collapsed states,
 * you may want to use the already existing `expand` and `collapse` aliases that point to
 * the `expand_more` and `expand_less` icons in the material font set.
 *
 * It may so happen, however, that the design of your component requires you to use the `chevron_right` for the
 * expand icon and the `expand_more` for the collapse icon. In this case the `tree_expand` and `tree_collapse` aliases
 * would be appropriate.
 * This distinction is important when choosing which icon to use for your component as it will have an impact
 * when a user decides to rewire the `expand`/`collapse` icons to some other icons.
 *
 * Likewise, modifying existing references should be handled with caution as many component in the framework already
 * share icons that have equivellent semantic meaning. For example, the `Paginator`, `Grid Filtering Row`,
 * and `Tabs` components in Ignite UI for Angular all use the `prev` and `next` icons as for navigating between pages
 * or lists of items. Changing the underlying target for those icons should be done in a way that suits all components.
 *
 * Keep in mind that icon aliases and their underlying names are shared between Ignite UI component frameworks
 * and changing an alias name here should be reflected in the other frameworks as well.
 *
 * To get aquainted with which component uses what icon, please make sure to read the
 * [docs](https://infragistics.com/products/ignite-ui-angular/Angular/components/icon-service#internal-usage).
 */
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
