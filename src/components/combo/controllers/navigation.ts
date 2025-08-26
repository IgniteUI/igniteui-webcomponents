import type { ReactiveController } from 'lit';

import type IgcComboListComponent from '../combo-list.js';
import type { ComboHost, ComboRecord } from '../types.js';
import type { DataController } from './data.js';

const START_INDEX: Readonly<number> = -1;

enum DIRECTION {
  Up = -1,
  Down = 1,
}

export class NavigationController<T extends object>
  implements ReactiveController
{
  protected hostHandlers = new Map(
    Object.entries({
      Escape: this.escape,
    })
  );

  protected mainInputHandlers = new Map(
    Object.entries({
      Escape: this.escape,
      ArrowUp: this.hide,
      ArrowDown: this.mainInputArrowDown,
      Tab: this.tab,
      Enter: this.enter,
    })
  );

  protected searchInputHandlers = new Map(
    Object.entries({
      Escape: this.escape,
      ArrowUp: this.escape,
      ArrowDown: this.inputArrowDown,
      Tab: this.inputArrowDown,
    })
  );

  protected listHandlers = new Map(
    Object.entries({
      ArrowDown: this.arrowDown,
      ArrowUp: this.arrowUp,
      ' ': this.space,
      Enter: this.enter,
      Escape: this.escape,
      Tab: this.tab,
      Home: this.home,
      End: this.end,
    })
  );

  protected _active = START_INDEX;

  public get input() {
    // @ts-expect-error protected access
    return this.host.singleSelect ? this.host._input : this.host._searchInput;
  }

  public get dataState() {
    return this.state.dataState;
  }

  public show() {
    // @ts-expect-error protected access
    this.host._show(true);
  }

  public hide() {
    // @ts-expect-error protected access
    this.host._hide(true);
  }

  public toggleSelect(index: number) {
    // @ts-expect-error protected access
    this.host.toggleSelect(index);
  }

  public select(index: number) {
    // @ts-expect-error protected access
    this.host.selectByIndex(index);
  }

  protected get currentItem() {
    const item = this.active;
    return item === START_INDEX ? START_INDEX : item;
  }

  protected get firstItem() {
    return this.dataState.findIndex((i: ComboRecord<T>) => i.header !== true);
  }

  protected get lastItem() {
    return this.dataState.length - 1;
  }

  protected scrollToActive(
    container: IgcComboListComponent,
    behavior: ScrollBehavior = 'auto'
  ) {
    container.element(this.active)?.scrollIntoView({
      block: 'center',
      behavior,
    });

    container.requestUpdate();
  }

  public get active() {
    return this._active;
  }

  public set active(node: number) {
    this._active = node;
    this.host.requestUpdate();
  }

  constructor(
    protected host: ComboHost<T>,
    protected state: DataController<T>
  ) {
    this.host.addController(this);
  }

  protected home(container: IgcComboListComponent) {
    this.active = this.firstItem;
    this.scrollToActive(container, 'smooth');
  }

  protected end(container: IgcComboListComponent) {
    this.active = this.lastItem;
    this.scrollToActive(container, 'smooth');
  }

  protected space() {
    if (this.active === START_INDEX) {
      return;
    }

    const item = this.dataState[this.active];

    if (!item.header) {
      this.toggleSelect(this.active);
    }
  }

  protected escape() {
    this.hide();
    this.host.focus();
  }

  protected enter() {
    if (this.active === START_INDEX) {
      return;
    }

    const item = this.dataState[this.active];

    if (!item.header && this.host.singleSelect) {
      this.select(this.active);
    }

    this.hide();
    requestAnimationFrame(() => this.input.select());
    this.host.focus();
  }

  protected inputArrowDown(container: IgcComboListComponent) {
    container.focus();
    this.arrowDown(container);
  }

  protected async mainInputArrowDown(container: IgcComboListComponent) {
    this.show();
    await container.updateComplete;

    if (this.host.singleSelect) {
      container.focus();
      this.arrowDown(container);
    }
  }

  protected tab() {
    this.hide();
    this.host.blur();
  }

  protected arrowDown(container: IgcComboListComponent) {
    this.getNextItem(DIRECTION.Down);
    this.scrollToActive(container);
  }

  protected arrowUp(container: IgcComboListComponent) {
    this.getNextItem(DIRECTION.Up);
    this.scrollToActive(container);
  }

  protected getNextItem(direction: DIRECTION) {
    const next = this.getNearestItem(this.currentItem, direction);

    if (next === -1) {
      if (this.active === this.firstItem) {
        this.input.focus();
        this.active = START_INDEX;
      }
      return;
    }

    this.active = next;
  }

  protected getNearestItem(startIndex: number, direction: number) {
    let index = startIndex;
    const items = this.dataState;

    while (items[index + direction]?.header) {
      index += direction;
    }

    index += direction;

    if (index >= 0 && index < items.length) {
      return index;
    }
    return -1;
  }

  public hostConnected() {}

  public hostDisconnected() {
    this.active = START_INDEX;
  }

  public navigateTo(item: T, container: IgcComboListComponent) {
    this.active = this.dataState.indexOf(item as ComboRecord<T>);
    this.scrollToActive(container, 'smooth');
  }

  public navigateHost(event: KeyboardEvent) {
    if (this.hostHandlers.has(event.key)) {
      event.preventDefault();
      this.hostHandlers.get(event.key)!.call(this);
    }
  }

  public navigateMainInput(
    event: KeyboardEvent,
    container: IgcComboListComponent
  ) {
    event.stopPropagation();

    if (this.mainInputHandlers.has(event.key)) {
      event.preventDefault();
      this.mainInputHandlers.get(event.key)!.call(this, container);
    }
  }

  public navigateSearchInput(
    event: KeyboardEvent,
    container: IgcComboListComponent
  ) {
    event.stopPropagation();

    if (this.searchInputHandlers.has(event.key)) {
      event.preventDefault();
      this.searchInputHandlers.get(event.key)!.call(this, container);
    }
  }

  public navigateList(event: KeyboardEvent, container: IgcComboListComponent) {
    event.stopPropagation();

    if (this.listHandlers.has(event.key)) {
      event.preventDefault();
      this.listHandlers.get(event.key)!.call(this, container);
    }
  }
}
