import type { ReactiveController } from 'lit';
import {
  getItems,
  type IgcComboBoxBaseLikeComponent,
} from '../bases/combo-box.js';
import type { IgcBaseOptionLikeComponent } from '../bases/option.js';
import type { WriteOrigin } from '../mixins/forms/types.js';
import { firstOf, isEmpty, lastOf } from '../utils/arrays.js';
import {
  closestComposed,
  getFocusableElements,
  scrollIntoView,
} from '../utils/dom.js';
import { focusTabStop, getElementFromPath } from '../utils/events.js';
import { moveFlag } from '../utils/objects.js';
import { isString } from '../utils/types.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  type KeyBindingController,
  shiftKey,
  tabKey,
} from './key-bindings.js';
import { createMutationController } from './mutation-observer.js';

//#region Policy

/** A user action on the list. */
export type ListboxIntent =
  /** An arrow key, Home, End or type-ahead, toward an item. */
  | 'move'
  /** A click on an item. */
  | 'pick'
  | 'enter'
  /** A Tab or a Shift+Tab that leaves the popup. */
  | 'tab'
  | 'escape';

export interface ListboxState {
  open: boolean;
  keepOpenOnSelect: boolean;
  /** Whether the keys select and open while the list is closed. */
  closedKeys: boolean;
  /**
   * Whether the intent has an item: the target of a move, the clicked item,
   * or the active item for Enter and Tab.
   */
  hasItem: boolean;
}

export interface ListboxOutcome {
  /** The item becomes active. The selection does not change. */
  activate?: true;
  /** The user selects the item. */
  commit?: true;
  open?: true;
  close?: true;
  /** The anchor takes the focus back once the list has closed. */
  refocus?: true;
}

/**
 * The popup rules of a single selection list: what an intent does in a state.
 * Enter and Tab close the list also without an active item. Tab closes it
 * whatever `keepOpenOnSelect` says.
 */
export function decideListboxIntent(
  intent: ListboxIntent,
  { open, keepOpenOnSelect, closedKeys, hasItem }: ListboxState
): ListboxOutcome {
  const commitAndClose: ListboxOutcome =
    open && !keepOpenOnSelect
      ? { commit: true, close: true }
      : { commit: true };

  switch (intent) {
    case 'move':
      if (!hasItem) return {};
      if (open) return { activate: true };
      return closedKeys ? { commit: true } : {};
    case 'pick':
      return hasItem ? commitAndClose : {};
    case 'enter':
      if (!open) return closedKeys ? { open: true } : {};
      return hasItem ? commitAndClose : { close: true };
    case 'tab':
      if (!open) return {};
      return hasItem ? { commit: true, close: true } : { close: true };
    case 'escape':
      return open ? { close: true, refocus: true } : {};
  }
}

//#endregion

type ListboxPopupHost<T> = IgcComboBoxBaseLikeComponent & {
  emitEvent(name: 'igcChange', init?: CustomEventInit<T>): boolean;
};

/** Who selects an item: only `user` emits `igcChange`. */
type CommitOrigin = Extract<WriteOrigin, 'user' | 'code'>;

/** The parts of the popup rules that differ per host. */
interface ListboxPopupConfig<T> {
  itemTag: string;
  /** The popup. Its content that is not an item keeps its own keys. */
  popup: () => Element | null | undefined;
  /** The element that has the focus while the list is open. */
  anchor: () => HTMLElement | undefined;
  /**
   * Whether the items take the DOM focus during navigation. The anchor then
   * takes it back after a user selection while open and after Escape, and
   * keeps it on a Tab out of the list.
   */
  focusItems?: boolean;
  /** Whether the keys work while the list is closed: a move selects and Enter opens. */
  closedKeys?: boolean;
  /** Whether the host ignores keys and item clicks. */
  disabled?: () => boolean;
  /** Opens the list for Enter, with `closedKeys`. */
  show?: () => void;
  /** Closes the list on a user action. Resolves to whether it closed. */
  hide: () => Promise<boolean>;
  /** Runs when a selection changes the selected item, before `igcChange`. */
  onCommit?: (item: T, origin: CommitOrigin) => void;
  /** Runs when the selected or the active item changes. */
  onChange?: () => void;
  /** The item that matches the value of the host. An item change and the first render select it. */
  resolveValue?: () => T | undefined;
  /** Runs before the first render selects the last item that has `selected`. */
  onInitialSelected?: (item: T) => void;
}

/**
 * The popup rules of a single selection list: the keys, the item clicks, the
 * selected and the active item, and the item changes.
 *
 * @remarks
 * Keyboard navigation moves from the active item. A selection moves the active
 * item to the selected item; navigation moves it without a selection.
 */
class ListboxPopup<
  T extends IgcBaseOptionLikeComponent,
> implements ReactiveController {
  private readonly _host: ListboxPopupHost<T>;
  private readonly _config: ListboxPopupConfig<T>;
  private _selected: T | null = null;
  private _active: T | null = null;
  private _initialized = false;

  /** The key bindings of the anchor. A host adds its own keys to it. */
  public readonly keys: KeyBindingController;

  constructor(host: ListboxPopupHost<T>, config: ListboxPopupConfig<T>) {
    this._host = host;
    this._config = config;

    host.addController(this);

    this.keys = addKeybindings(host, {
      skip: (_, event) => this._skipAnchorKey(event),
      bindingDefaults: { preventDefault: true, repeat: true },
    })
      .set(arrowDown, () => this.moveTo(this._step(1)))
      .set(arrowRight, () => this.moveTo(this._step(1)))
      .set(arrowUp, () => this.moveTo(this._step(-1)))
      .set(arrowLeft, () => this.moveTo(this._step(-1)))
      .set(homeKey, () => this.moveTo(firstOf(this.activeItems)))
      .set(endKey, () => this.moveTo(lastOf(this.activeItems)))
      .set(enterKey, () => this._applyIntent('enter', this._active))
      .set(tabKey, this._handleTab, { preventDefault: false })
      .set([shiftKey, tabKey], this._handleTab, { preventDefault: false })
      .set(escapeKey, this.close, { when: () => host.open });

    // Tab and Escape from the content, unless the content handled them. The
    // controller above can observe an external anchor, and then it ignores the
    // keys of the host.
    addKeybindings(host, {
      skip: (_, event) =>
        !host.open ||
        event.defaultPrevented ||
        this._isDisabled() ||
        !this.isContentEvent(event),
      bindingDefaults: { repeat: true },
    })
      .set(tabKey, this._handleTab, { preventDefault: false })
      .set([shiftKey, tabKey], this._handleTab, { preventDefault: false })
      .set(escapeKey, this.close);

    createMutationController(host, {
      callback: ({ changes: { added, removed } }) => {
        if (host.hasUpdated && !(isEmpty(added) && isEmpty(removed))) {
          this._syncItems();
        }
      },
      filter: [config.itemTag],
      config: { childList: true, subtree: true },
    });
  }

  public get items(): T[] {
    return getItems<T>(this._host, this._config.itemTag);
  }

  /** The items that are not disabled. */
  public get activeItems(): T[] {
    return this.items.filter((item) => !item.disabled);
  }

  public get selected(): T | null {
    return this._selected;
  }

  public get active(): T | null {
    return this._active;
  }

  /** @internal */
  public hostUpdated(): void {
    if (!this._initialized) {
      this._initialized = true;
      this._host.updateComplete.then(() => this._selectInitialItem());
    }
  }

  /** Resolves an item by its `value`, or by its index in {@link items}. */
  public resolve(value: string | number): T | undefined {
    return isString(value)
      ? this.items.find((item) => item.value === value)
      : this.items[value];
  }

  /**
   * Whether `event` comes from popup content that is not an item, such as a
   * control in the header or the footer. That content keeps its own keys.
   */
  public isContentEvent(event: Event): boolean {
    const { popup, itemTag } = this._config;
    const element = popup();

    // An item is on the path before the popup that holds it.
    return (
      !!element &&
      getElementFromPath(
        (each) => each === element || each.localName === itemTag,
        event
      ) === element
    );
  }

  /**
   * Sets the selected item without an event, to follow a property such as
   * `value`, which a framework can set again on each render. A new selection
   * also becomes the active item; the selected item again changes nothing.
   * Returns whether the selection changed.
   */
  public setSelected(item: T | null): boolean {
    if (item === this._selected) {
      return false;
    }

    moveFlag(this._selected, item, 'selected');
    this._selected = item;
    this._setActive(item);
    this._config.onChange?.();
    return true;
  }

  /** Selects an item from code: no event, and the list stays as it is. */
  public select(value: string | number): T | null {
    const item = this.resolve(value);

    if (item) {
      this._commit(item, 'code');
    }

    return item ?? null;
  }

  public clear(): void {
    this._selectAndActivate(null);
  }

  /** Activates `item` and, while the list is open, brings it into view. */
  public navigate(item?: T | null): void {
    if (!item) {
      return;
    }

    this._activate(item);

    // Closed, the list is inert and off screen.
    if (this._host.open) {
      if (this._config.focusItems) {
        item.focus({ preventScroll: true });
      }
      scrollIntoView(item);
    }
  }

  /** Navigates to the item with `value`, or at that index. */
  public navigateTo(value: string | number): T | null {
    const item = this.resolve(value);
    this.navigate(item);
    return item ?? null;
  }

  /** The user moves to `item`. */
  public moveTo(item?: T): void {
    this._applyIntent('move', item);
  }

  /** The user closes the list. */
  public readonly close = (): void => {
    this._applyIntent('escape');
  };

  /** The user clicks in the list. */
  public readonly handleClick = (event: Event): void => {
    if (this._isDisabled()) {
      return;
    }

    const item = getElementFromPath<T>(this._config.itemTag, event);
    this._applyIntent('pick', item && !item.disabled ? item : undefined);
  };

  private readonly _handleTab = (event: KeyboardEvent): void => {
    if (!this._host.open || !this._tabLeavesPopup(event)) {
      return;
    }

    if (this._config.focusItems) {
      event.preventDefault();
    }

    this._applyIntent('tab', this._active);
  };

  /**
   * Moves a Tab through the anchor and the focusable popup content, and
   * returns whether the Tab leaves the popup. Without content other than
   * items, only a plain Tab leaves.
   */
  private _tabLeavesPopup(event: KeyboardEvent): boolean {
    const { anchor, popup, itemTag } = this._config;
    const element = popup();
    const first = anchor();

    // A control in an item gets the keys of the item, so it is not a stop.
    const content = element
      ? Iterator.from(getFocusableElements(element))
          .filter(
            (each) =>
              each.localName === itemTag || !closestComposed(each, itemTag)
          )
          .toArray()
      : [];
    const stops =
      first && content.some((each) => each.localName !== itemTag)
        ? [first, ...content]
        : [];

    if (focusTabStop(event, stops)) {
      event.preventDefault();
      return false;
    }

    return !(event.shiftKey && isEmpty(stops));
  }

  private _applyIntent(intent: ListboxIntent, item?: T | null): void {
    const outcome = decideListboxIntent(intent, {
      open: this._host.open,
      keepOpenOnSelect: this._host.keepOpenOnSelect,
      closedKeys: !!this._config.closedKeys,
      hasItem: !!item,
    });

    if (outcome.activate) {
      this.navigate(item);
    }
    if (outcome.commit && item) {
      this._commit(item, 'user');
    }
    if (outcome.open) {
      this._config.show?.();
    }
    if (outcome.close) {
      const closed = this._config.hide();

      if (outcome.refocus) {
        closed.then((done) => done && this._focusAnchor());
      }
    }
  }

  private _commit(item: T, origin: CommitOrigin): void {
    const refocus = origin === 'user' && this._host.open;

    if (this._selectAndActivate(item)) {
      this._config.onCommit?.(item, origin);

      if (origin === 'user') {
        this._host.emitEvent('igcChange', { detail: item });
      }
    }

    if (refocus) {
      this._focusAnchor();
    }
  }

  /** Selects and activates `item`. Returns whether the selection changed. */
  private _selectAndActivate(item: T | null): boolean {
    const changed = this.setSelected(item);
    this._activate(item);
    return changed;
  }

  private _focusAnchor(): void {
    if (this._config.focusItems) {
      this._config.anchor()?.focus();
    }
  }

  private _selectInitialItem(): void {
    const items = this.items;
    // The last item with `selected` wins, and it is the only active item.
    const selected = items.findLast((item) => item.selected);

    for (const item of items) {
      item.selected = item === selected;
      item.active = item === selected;
    }

    if (selected) {
      this._config.onInitialSelected?.(selected);
    }

    const item = selected ?? this._config.resolveValue?.();

    if (item) {
      this._commit(item, 'code');
    }
  }

  /** Selects again after an item change, such as a late framework render. */
  private _syncItems(): void {
    const match = this._config.resolveValue?.();
    const matched = !!match && this.setSelected(match);

    // An unmatched value stays; only the stale element references go.
    if (this._prune() || matched) {
      this._host.requestUpdate();
    }
  }

  /** Drops stale item references. Returns whether it changed something. */
  private _prune(): boolean {
    const items = this.items;

    if (this._selected && !items.includes(this._selected)) {
      return this.setSelected(null);
    }
    if (this._active && !items.includes(this._active)) {
      return this._activate(this._selected);
    }
    return false;
  }

  private _activate(item: T | null): boolean {
    const changed = this._setActive(item);

    if (changed) {
      this._config.onChange?.();
    }

    return changed;
  }

  private _setActive(item: T | null): boolean {
    const changed = item !== this._active;

    moveFlag(this._active, item, 'active');
    this._active = item;

    return changed;
  }

  /**
   * The first enabled item after (1) or before (-1) the active item. A missing
   * or detached active item starts at the edge. Without an enabled item in
   * that direction, the active item stays.
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

  private _isDisabled(): boolean {
    return !!this._config.disabled?.();
  }

  /** Content keeps its keys, and a closed list has none without `closedKeys`. */
  private _skipAnchorKey(event: KeyboardEvent): boolean {
    return (
      this._isDisabled() ||
      (!this._host.open && !this._config.closedKeys) ||
      this.isContentEvent(event)
    );
  }
}

/** Creates a {@link ListboxPopup} for `host`, and adds it to the host. */
export function addListboxPopup<T extends IgcBaseOptionLikeComponent>(
  host: ListboxPopupHost<T>,
  config: ListboxPopupConfig<T>
): ListboxPopup<T> {
  return new ListboxPopup<T>(host, config);
}

export type { ListboxPopup, ListboxPopupConfig };
