import type { ReactiveController } from 'lit';
import type { Ref } from 'lit/directives/ref.js';

import {
  type KeyBindingOptions,
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  escapeKey,
  homeKey,
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

  protected get firstItem(): number {
    return this.state.dataState.findIndex((rec) => !rec.header);
  }

  protected get lastItem(): number {
    return this.state.dataState.length - 1;
  }

  protected async hide(): Promise<boolean> {
    // @ts-expect-error: protected access
    return await this.combo._hide(true);
  }

  protected async show(): Promise<boolean> {
    // @ts-expect-error: protected access
    return await this.combo._show(true);
  }

  public toggleSelect(index: number): void {
    // @ts-expect-error protected access
    this.combo.toggleSelect(index);
  }

  protected select(index: number): void {
    // @ts-expect-error: protected access
    this.combo.selectByIndex(index);
  }

  private onSpace = (): void => {
    if (this._active === -1) {
      return;
    }

    const item = this.state.dataState[this._active];
    if (!item.header) {
      this.toggleSelect(this._active);
    }
  };

  private onEnter = async (): Promise<void> => {
    if (this._active === -1) {
      return;
    }

    const item = this.state.dataState[this._active];

    if (!item.header && this.combo.singleSelect) {
      this.select(this.active);
    }

    if (await this.hide()) {
      this.input.select();
      this.combo.focus();
    }
  };

  private onTab = async (): Promise<void> => {
    if (this.combo.open) {
      await this.hide();
    }
  };

  private onEscape = async (): Promise<void> => {
    if (await this.hide()) {
      this.input.focus();
    }
  };

  private onMainInputArrowDown = async (): Promise<void> => {
    if (!this.combo.open && !(await this.show())) {
      return;
    }

    if (this.combo.singleSelect) {
      this.onSearchArrowDown();
    }
  };

  private onSearchArrowDown = (): void => {
    this.list.focus();
    this.onArrowDown();
  };

  private onHome = (): void => {
    this.active = this.firstItem;
    this.scrollToActive();
  };

  private onEnd = (): void => {
    this.active = this.lastItem;
    this.scrollToActive();
  };

  private onArrowUp = (): void => {
    this.getNextItem(-1);
    this.scrollToActive();
  };

  private onArrowDown = (): void => {
    this.getNextItem(1);
    this.scrollToActive();
  };

  private scrollToActive(behavior?: ScrollBehavior): void {
    this.list.element(this.active)?.scrollIntoView({
      block: 'center',
      behavior: behavior ?? 'auto',
    });

    this.list.requestUpdate();
  }

  private getNearestItem(start: number, delta: -1 | 1): number {
    let index = start;
    const items = this.state.dataState;

    while (items[index + delta]?.header) {
      index += delta;
    }

    index += delta;

    return index >= 0 && index < items.length ? index : -1;
  }

  private getNextItem(delta: -1 | 1): void {
    const next = this.getNearestItem(this._active, delta);
    if (next === -1) {
      if (this.active === this.firstItem) {
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
      preventDefault: true,
      triggers: ['keydownRepeat'],
    } as KeyBindingOptions;

    const skip = (): boolean => this.combo.disabled;

    // Combo
    addKeybindings(this.combo, { skip, bindingDefaults })
      .set(tabKey, this.onTab, { preventDefault: false })
      .set([shiftKey, tabKey], this.onTab, { preventDefault: false })
      .set(escapeKey, this.onEscape);

    // Main input
    addKeybindings(this.combo, {
      skip,
      ref: this._config.input,
      bindingDefaults,
    })
      .set(arrowUp, async () => await this.hide())
      .set([altKey, arrowDown], this.onMainInputArrowDown)
      .set(arrowDown, this.onMainInputArrowDown)
      .set(enterKey, this.onEnter);

    // Search input
    addKeybindings(this.combo, {
      skip,
      ref: this._config.search,
      bindingDefaults,
    })
      .set(arrowUp, this.onEscape)
      .set(arrowDown, this.onSearchArrowDown);

    // List
    addKeybindings(this.combo, {
      skip,
      ref: this._config.list,
      bindingDefaults,
    })
      .set(arrowUp, this.onArrowUp)
      .set(arrowDown, this.onArrowDown)
      .set(homeKey, this.onHome)
      .set(endKey, this.onEnd)
      .set(spaceBar, this.onSpace)
      .set(enterKey, this.onEnter);
  }

  public hostDisconnected(): void {
    this._active = -1;
  }
}
