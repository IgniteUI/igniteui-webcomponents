import { scrollIntoView } from '../utils/dom.js';
import { moveFlag } from '../utils/objects.js';
import { isString } from '../utils/types.js';
import { getItems } from './combo-box.js';
import type { IgcBaseOptionLikeComponent } from './option.js';

type ListSelectionHost = HTMLElement & { open: boolean };

type ListSelectionConfig = {
  itemTag: string;
  focusOnNavigate?: boolean;
  /** Runs when the selected item or the active item changes. */
  onChange?: () => void;
};

/**
 * Keeps the selected item and the active item of a list of options.
 *
 * @remarks
 * Keyboard navigation moves from the active item. A commit moves the active
 * item to the committed item, and navigation moves it without a selection.
 */
class ListSelection<T extends IgcBaseOptionLikeComponent> {
  private readonly _host: ListSelectionHost;
  private readonly _config: ListSelectionConfig;
  private _selected: T | null = null;
  private _active: T | null = null;

  constructor(host: ListSelectionHost, config: ListSelectionConfig) {
    this._host = host;
    this._config = config;
  }

  public get selected(): T | null {
    return this._selected;
  }

  public get active(): T | null {
    return this._active;
  }

  public get items(): T[] {
    return Array.from(getItems<T>(this._host, this._config.itemTag));
  }

  /** The items that are not disabled. */
  public get activeItems(): T[] {
    return Array.from(
      getItems<T>(this._host, this._config.itemTag, (item) => !item.disabled)
    );
  }

  /** The first enabled item after the active item, else the active item. */
  public next(): T | undefined {
    return this._step(1);
  }

  /** The first enabled item before the active item, else the active item. */
  public previous(): T | undefined {
    return this._step(-1);
  }

  /** Resolves an item by its `value`, or by its index in {@link items}. */
  public resolve(value: string | number): T | undefined {
    return isString(value)
      ? this.items.find((item) => item.value === value)
      : this.items[value];
  }

  public activate(item: T | null): void {
    if (this._setActive(item)) {
      this._config.onChange?.();
    }
  }

  /**
   * Selects `item` to follow a property, such as `value`, which a framework
   * can set again on each render. A new selection also becomes the active
   * item; the selected item again changes nothing. Returns whether the
   * selection changed.
   */
  public select(item: T | null): boolean {
    if (item === this._selected) {
      return false;
    }

    moveFlag(this._selected, item, 'selected');
    this._selected = item;
    this._setActive(item);
    this._config.onChange?.();
    return true;
  }

  /**
   * Selects `item` on a user action or a method call. It becomes the active
   * item, also when it is already selected. Returns whether the selection
   * changed.
   */
  public commit(item: T | null): boolean {
    const changed = this.select(item);
    this.activate(item);
    return changed;
  }

  /** Activates `item` and, while the list is open, brings it into view. */
  public navigate(item?: T | null): void {
    if (!item) {
      return;
    }

    this.activate(item);

    // Closed, the list is inert and off screen.
    if (this._host.open) {
      if (this._config.focusOnNavigate) {
        item.focus({ preventScroll: true });
      }
      scrollIntoView(item);
    }
  }

  /** Drops the references to items that are no longer in the list. */
  public prune(): void {
    const items = this.items;

    if (this._selected && !items.includes(this._selected)) {
      this.select(null);
    } else if (this._active && !items.includes(this._active)) {
      this.activate(this._selected);
    }
  }

  private _setActive(item: T | null): boolean {
    const changed = item !== this._active;

    moveFlag(this._active, item, 'active');
    this._active = item;

    return changed;
  }

  /**
   * A missing or detached active item starts the step at the edge. Without an
   * enabled item in that direction, the active item stays.
   */
  private _step(step: -1 | 1): T | undefined {
    const items = this.items;
    const index = this._active ? items.indexOf(this._active) : -1;
    const current = index < 0 ? (step === 1 ? -1 : items.length) : index;

    for (let i = current + step; i >= 0 && i < items.length; i += step) {
      if (!items[i].disabled) {
        return items[i];
      }
    }

    return items[current];
  }
}

/** Creates a {@link ListSelection} over the items of `host`. */
export function createListSelection<T extends IgcBaseOptionLikeComponent>(
  host: ListSelectionHost,
  config: ListSelectionConfig
): ListSelection<T> {
  return new ListSelection<T>(host, config);
}

export type { ListSelection };
