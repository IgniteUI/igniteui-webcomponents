import type { ReactiveController } from 'lit';
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
import type { DataController } from './data.js';

type ComboNavigationConfig = {
  /** The primary input of the combo component. */
  input: Ref<IgcInputComponent>;
  /** The search input of the combo component. */
  search: Ref<IgcInputComponent>;
  /** The combo virtualized dropdown list. */
  list: Ref<IgcComboListComponent>;
};

export class ComboNavigationController<T extends object> {
  private _active = -1;
  private _config: ComboNavigationConfig;

  public get active(): number {
    return this._active;
  }

  public set active(value: number) {
    this._active = value;
    this.combo.requestUpdate();
  }

  public get input(): IgcInputComponent {
    return this._config.input.value!;
  }

  public get searchInput(): IgcInputComponent {
    return this._config.search.value!;
  }

  public get list(): IgcComboListComponent {
    return this._config.list.value!;
  }

  protected get _firstItem(): number {
    return this.state.dataState.findIndex((rec) => !rec.header);
  }

  protected get _lastItem(): number {
    return this.state.dataState.length - 1;
  }

  protected async _hide(): Promise<boolean> {
    // @ts-expect-error: protected access
    return await this.combo._hide(true);
  }

  protected async _show(): Promise<boolean> {
    // @ts-expect-error: protected access
    return await this.combo._show(true);
  }

  protected _toggleSelection(index: number): void {
    // @ts-expect-error protected access
    this.combo.toggleSelect(index);
  }

  protected _select(index: number): void {
    // @ts-expect-error: protected access
    this.combo.selectByIndex(index);
  }

  private _onSpace = (): void => {
    if (this._active === -1) {
      return;
    }

    const item = this.state.dataState[this._active];
    if (!item.header) {
      this._toggleSelection(this._active);
    }
  };

  private _onEnter = async (): Promise<void> => {
    if (this._active === -1) {
      return;
    }

    const item = this.state.dataState[this._active];

    if (!item.header && this.combo.singleSelect) {
      this._select(this.active);
    }

    if (await this._hide()) {
      this.input.select();
      this.combo.focus();
    }
  };

  private _onTab = async ({ shiftKey }: KeyboardEvent): Promise<void> => {
    if (this.combo.open) {
      if (shiftKey) {
        // Move focus to the main input of the combo
        // before the Shift+Tab behavior kicks in.
        this.combo.focus();
      }
      await this._hide();
    }
  };

  private _onEscape = async (): Promise<void> => {
    if (!this.combo.open) {
      this.combo.clearSelection();
    }

    if (await this._hide()) {
      this.input.focus();
    }
  };

  private _onMainInputArrowDown = async (): Promise<void> => {
    if (!this.combo.open && !(await this._show())) {
      return;
    }

    if (this.combo.singleSelect) {
      this._onSearchArrowDown();
    }
  };

  private _onSearchArrowDown = (): void => {
    this.list.focus();
    this._onArrowDown();
  };

  private _onHome = (): void => {
    this.active = this._firstItem;
    this._scrollToActive();
  };

  private _onEnd = (): void => {
    this.active = this._lastItem;
    this._scrollToActive();
  };

  private _onArrowUp = (): void => {
    this._getNextItem(-1);
    this._scrollToActive();
  };

  private _onArrowDown = (): void => {
    this._getNextItem(1);
    this._scrollToActive();
  };

  private _scrollToActive(behavior?: ScrollBehavior): void {
    this.list.element(this.active)?.scrollIntoView({
      block: 'center',
      behavior: behavior ?? 'auto',
    });

    this.list.requestUpdate();
  }

  private _getNearestItem(start: number, delta: -1 | 1): number {
    let index = start;
    const items = this.state.dataState;

    while (items[index + delta]?.header) {
      index += delta;
    }

    index += delta;

    return index >= 0 && index < items.length ? index : -1;
  }

  private _getNextItem(delta: -1 | 1): void {
    const next = this._getNearestItem(this._active, delta);
    if (next === -1) {
      if (this.active === this._firstItem) {
        (this.combo.singleSelect ? this.input : this.searchInput).focus();
        this.active = -1;
      }
      return;
    }

    this.active = next;
  }

  constructor(
    protected combo: ComboHost<T>,
    protected state: DataController<T>,
    config: ComboNavigationConfig
  ) {
    this.combo.addController(this as ReactiveController);
    this._config = config;

    const bindingDefaults = {
      triggers: ['keydownRepeat'],
    } as KeyBindingOptions;

    const skip = (): boolean => this.combo.disabled;

    // Combo
    addKeybindings(this.combo, { skip, bindingDefaults })
      .set(tabKey, this._onTab, { preventDefault: false })
      .set([shiftKey, tabKey], this._onTab, {
        preventDefault: false,
      })
      .set(escapeKey, this._onEscape);

    // Main input
    addKeybindings(this.combo, {
      skip,
      ref: this._config.input,
      bindingDefaults,
    })
      .set(arrowUp, async () => await this._hide())
      .set([altKey, arrowDown], this._onMainInputArrowDown)
      .set(arrowDown, this._onMainInputArrowDown)
      .set(enterKey, this._onEnter);

    // Search input
    addKeybindings(this.combo, {
      skip,
      ref: this._config.search,
      bindingDefaults,
    })
      .set(arrowUp, this._onEscape)
      .set(arrowDown, this._onSearchArrowDown);

    // List
    addKeybindings(this.combo, {
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
    this._active = -1;
  }
}
