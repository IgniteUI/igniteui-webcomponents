import type { Ref } from 'lit/directives/ref.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
  type KeyBindingOptions,
  shiftKey,
  spaceBar,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { getFocusableElements } from '#internals/utils/dom.js';
import type IgcInputComponent from '../../input/input.js';
import type IgcVirtualScrollComponent from '../../virtualization/virtualization.js';
import type { ComboCloseTrigger, ComboHost } from '../types.js';
import type { DataState } from './data.js';

type ListSlot = 'header' | 'empty' | 'footer';

type ComboNavigationConfig = {
  input: Ref<IgcInputComponent>;
  search: Ref<IgcInputComponent>;
  list: Ref<IgcVirtualScrollComponent>;
  /** The elements assigned to a slot of the list, or its fallback content. */
  slotted: (slot: ListSlot) => Element[];
  interactions: {
    show: () => Promise<boolean>;
    hide: (trigger: ComboCloseTrigger) => Promise<boolean>;
    toggleSelection: (index: number) => void;
    select: (index: number) => void;
    /** Whether the confirm mode has a pending selection. */
    hasPending: () => boolean;
    /** Applies the pending selection, then closes the list. Returns whether the list closes. */
    apply: (trigger: ComboCloseTrigger) => Promise<boolean>;
    clearSelection: () => void;
  };
};

export class ComboNavigationController<T extends object> {
  //#region Internal state

  private readonly _host: ComboHost<T>;
  private readonly _state: DataState<T>;
  private readonly _config: ComboNavigationConfig;

  private get _input(): IgcInputComponent | undefined {
    return this._config.input.value;
  }

  /** The search input while it shows. */
  private get _searchInput(): IgcInputComponent | undefined {
    const search = this._config.search.value;
    return search?.checkVisibility() ? search : undefined;
  }

  private get _list(): IgcVirtualScrollComponent | undefined {
    return this._config.list.value;
  }

  private get _firstItem(): number {
    return this._state.firstOptionIndex;
  }

  private get _lastItem(): number {
    return this._state.dataState.length - 1;
  }

  //#endregion

  public active = -1;

  constructor(
    host: ComboHost<T>,
    state: DataState<T>,
    config: ComboNavigationConfig
  ) {
    this._host = host;
    this._state = state;
    this._config = config;
    this._host.addController(this);

    const bindingDefaults: KeyBindingOptions = { repeat: true };
    const skip = (): boolean => this._host.disabled;

    addKeybindings(this._host, { skip, bindingDefaults })
      .set(tabKey, this._onTab, { preventDefault: false })
      .set([shiftKey, tabKey], this._onTab, {
        preventDefault: false,
      })
      .set(escapeKey, this._onEscape);

    addKeybindings(this._host, {
      skip,
      ref: this._config.input,
      bindingDefaults,
    })
      .set(arrowUp, () => this._config.interactions.hide('arrow-up'))
      .set([altKey, arrowDown], this._onMainInputArrowDown)
      .set(arrowDown, this._onMainInputArrowDown)
      .set(enterKey, this._onEnter);

    addKeybindings(this._host, {
      skip,
      ref: this._config.search,
      bindingDefaults,
    })
      .set(arrowUp, () => this._closeToInput('arrow-up'))
      .set(arrowDown, this._onSearchArrowDown)
      .set(enterKey, this._onSearchEnter);

    addKeybindings(this._host, {
      skip,
      ref: this._config.list,
      bindingDefaults,
    })
      .set(arrowUp, this._onArrowUp)
      .set(arrowDown, this._onArrowDown)
      .set(homeKey, this._onHome)
      .set(endKey, this._onEnd)
      .set(spaceBar, this._onSpace)
      .set(enterKey, this._onEnter);
  }

  public hostDisconnected(): void {
    this.active = -1;
  }

  //#region Event handlers

  private _onSpace = (): void => {
    if (this.active > -1) {
      this._config.interactions.toggleSelection(this.active);
    }
  };

  private _onEnter = async (): Promise<void> => {
    // A placeholder has no item, so Enter on it does nothing.
    if (this._state.dataState[this.active]?.kind === 'placeholder') {
      return;
    }

    // In confirm mode, Enter applies the pending selection also without an active option.
    if (this.active < 0 && !this._config.interactions.hasPending()) {
      return;
    }

    if (this._host.singleSelect) {
      this._config.interactions.select(this.active);
    }
    if (await this._config.interactions.apply('enter')) {
      this._input?.select();
      this._host.focus();
    }
  };

  private _onSearchEnter = async (): Promise<void> => {
    if (this._config.interactions.hasPending()) {
      await this._onEnter();
    }
  };

  private _onTab = async (event: KeyboardEvent): Promise<void> => {
    // A slotted control that handles Tab prevents the default action.
    if (!this._host.open || event.defaultPrevented) {
      return;
    }

    const stops = this._tabStops();
    // The innermost stop on the path, for a stop inside another stop.
    const focused = event
      .composedPath()
      .find((node) => stops.includes(node as HTMLElement));
    const current = stops.indexOf(focused as HTMLElement);
    const next =
      current > -1 ? stops[current + (event.shiftKey ? -1 : 1)] : undefined;

    next?.focus();

    // A stop that does not take the focus leaves Tab to the browser.
    if (next?.matches(':focus')) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Focus the main input before the default Shift+Tab action.
      this._host.focus();
    }

    if (this._host.singleSelect && this.active > -1) {
      this._config.interactions.select(this.active);
    }

    await this._config.interactions.hide('tab');
  };

  private _onEscape = (): Promise<void> => {
    if (!this._host.open) {
      this._config.interactions.clearSelection();
    }

    return this._closeToInput('escape');
  };

  private _onMainInputArrowDown = async (): Promise<void> => {
    if (!this._host.open && !(await this._config.interactions.show())) {
      return;
    }

    if (this._host.singleSelect) {
      this._onSearchArrowDown();
    }
  };

  private _onSearchArrowDown = (): void => {
    this._list?.focus();
    this._onArrowDown();
  };

  private _onHome = (): void => {
    this._setActive(this._firstItem);
    this._scrollToActive();
  };

  private _onEnd = (): void => {
    this._setActive(this._lastItem);
    this._scrollToActive();
  };

  private _onArrowUp = (): void => {
    if (this.active === this._firstItem) {
      // Focus the search input when it shows. Otherwise, close the list.
      const search = this._searchInput;
      search ? search.focus() : this._closeToInput('arrow-up');
      return;
    }

    this._getNextItem(-1);
    this._scrollToActive();
  };

  private _onArrowDown = (): void => {
    this._getNextItem(1);
    this._scrollToActive();
  };

  //#endregion

  //#region Internal helper methods

  private async _closeToInput(trigger: ComboCloseTrigger): Promise<void> {
    if (await this._config.interactions.hide(trigger)) {
      this._input?.focus();
    }
  }

  /**
   * The Tab order of the open list: the filtering input, the header content,
   * the list, and the empty and footer content. Empty without focusable slot
   * content, so Tab closes the list.
   */
  private _tabStops(): HTMLElement[] {
    const focusable = (...slots: ListSlot[]) =>
      slots.flatMap((slot) =>
        Iterator.from(this._config.slotted(slot))
          .flatMap(getFocusableElements)
          .toArray()
      );
    const before = focusable('header');
    const after = focusable('empty', 'footer');

    if (isEmpty(before) && isEmpty(after)) {
      return [];
    }

    const input = this._searchInput ?? this._input;
    const list = this._list?.checkVisibility() ? [this._list] : [];

    return [input!, ...before, ...list, ...after];
  }

  /**
   * The only write path for the active index. The host mirrors it as
   * `_activeIndex`, so the update request carries the old value.
   */
  private _setActive(index: number): void {
    const previous = this.active;
    this.active = index;
    this._host.requestUpdate('_activeIndex', previous);
  }

  private _scrollToActive(): void {
    this._list?.scrollToIndex(this.active, { block: 'center' });
    this._list?.requestUpdate();
  }

  private _getNextItem(delta: -1 | 1): void {
    const items = this._state.dataState;

    for (let i = this.active + delta; i >= 0 && i < items.length; i += delta) {
      if (this._state.isOption(items[i])) {
        this._setActive(i);
        return;
      }
    }
  }

  //#endregion
}
