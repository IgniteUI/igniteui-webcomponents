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
} from '../../common/controllers/key-bindings.js';
import type IgcInputComponent from '../../input/input.js';
import type IgcComboListComponent from '../combo-list.js';
import type { ComboHost } from '../types.js';
import type { DataState } from './data.js';

type ComboNavigationConfig = {
  /** The primary input of the combo component. */
  input: Ref<IgcInputComponent>;
  /** The search input of the combo component. */
  search: Ref<IgcInputComponent>;
  /** The combo virtualized dropdown list. */
  list: Ref<IgcComboListComponent>;
  interactions: {
    show: () => Promise<boolean>;
    hide: () => Promise<boolean>;
    toggleSelection: (index: number) => void;
    select: (index: number) => void;
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

  private get _searchInput(): IgcInputComponent | undefined {
    return this._config.search.value;
  }

  private get _list(): IgcComboListComponent | undefined {
    return this._config.list.value;
  }

  private get _firstItem(): number {
    return this._state.dataState.findIndex((rec) => !rec.header);
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

    // Combo
    addKeybindings(this._host, { skip, bindingDefaults })
      .set(tabKey, this._onTab, { preventDefault: false })
      .set([shiftKey, tabKey], this._onTab, {
        preventDefault: false,
      })
      .set(escapeKey, this._onEscape);

    // Main input
    addKeybindings(this._host, {
      skip,
      ref: this._config.input,
      bindingDefaults,
    })
      .set(arrowUp, this._config.interactions.hide)
      .set([altKey, arrowDown], this._onMainInputArrowDown)
      .set(arrowDown, this._onMainInputArrowDown)
      .set(enterKey, this._onEnter);

    // Search input
    addKeybindings(this._host, {
      skip,
      ref: this._config.search,
      bindingDefaults,
    })
      .set(arrowUp, this._onEscape)
      .set(arrowDown, this._onSearchArrowDown);

    // List
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
    if (this.active > -1) {
      if (this._host.singleSelect) {
        this._config.interactions.select(this.active);
      }
      if (await this._config.interactions.hide()) {
        this._input?.select();
        this._host.focus();
      }
    }
  };

  private _onTab = async ({ shiftKey }: KeyboardEvent): Promise<void> => {
    if (this._host.open) {
      if (shiftKey) {
        // Move focus to the main input of the combo
        // before the Shift+Tab behavior kicks in.
        this._host.focus();
      }
      await this._config.interactions.hide();
    }
  };

  private _onEscape = async (): Promise<void> => {
    if (!this._host.open) {
      this._config.interactions.clearSelection();
    }

    if (await this._config.interactions.hide()) {
      this._input?.focus();
    }
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
    const previous = this.active;
    this.active = this._firstItem;
    this._scrollToActive();
    this._host.requestUpdate('_activeIndex', previous);
  };

  private _onEnd = (): void => {
    const previous = this.active;
    this.active = this._lastItem;
    this._scrollToActive();
    this._host.requestUpdate('_activeIndex', previous);
  };

  private _onArrowUp = (): void => {
    this._getNextItem(-1);
    this._scrollToActive();
  };

  private _onArrowDown = (): void => {
    this._getNextItem(1);
    this._scrollToActive();
  };

  //#endregion

  //#region Internal helper methods

  private _scrollToActive(behavior?: ScrollBehavior): void {
    this._list?.element(this.active)?.scrollIntoView({
      block: 'center',
      behavior: behavior ?? 'auto',
    });

    this._list?.requestUpdate();
  }

  private _getNearestItem(start: number, delta: -1 | 1): number {
    const items = this._state.dataState;
    const length = items.length;

    for (let i = start + delta; i >= 0 && i < length; i += delta) {
      if (!items[i].header) {
        return i;
      }
    }

    return -1;
  }

  private _getNextItem(delta: -1 | 1): void {
    const next = this._getNearestItem(this.active, delta);

    if (next === -1 && this.active === this._firstItem) {
      this._searchInput?.checkVisibility() // Non single-select or disable-filtering combo configuration
        ? this._searchInput?.focus() // Delegate to search input handlers
        : this._onEscape(); // Close dropdown and move focus back to main input
      return;
    }

    if (next !== -1) {
      const previous = this.active;
      this.active = next;
      this._host.requestUpdate('_activeIndex', previous);
    }
  }

  //#endregion
}
