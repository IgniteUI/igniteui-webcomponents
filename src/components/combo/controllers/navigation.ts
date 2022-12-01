import { ReactiveController } from 'lit';
import IgcComboListComponent from '../combo-list.js';
import { ComboRecord, ComboHost } from '../types.js';

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
      ArrowDown: this.hostArrowDown,
    })
  );

  protected searchInputHandlers = new Map(
    Object.entries({
      Escape: this.escape,
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
      Home: this.home,
      End: this.end,
    })
  );

  protected _active = START_INDEX;

  protected get currentItem() {
    const item = this.active;
    return item === START_INDEX ? START_INDEX : item;
  }

  protected get firstItem() {
    return this.host.dataState.findIndex(
      (i: ComboRecord<T>) => i.header !== true
    );
  }

  protected get lastItem() {
    return this.host.dataState.length - 1;
  }

  public get active() {
    return this._active;
  }

  public set active(node: number) {
    this._active = node;
    this.host.requestUpdate();
  }

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  protected home(container: IgcComboListComponent) {
    this.active = this.firstItem;
    container.scrollToIndex(this.active, 'center');
  }

  protected end(container: IgcComboListComponent) {
    this.active = this.lastItem;
    container.scrollToIndex(this.active, 'center');
  }

  protected space() {
    const item = this.host.dataState[this.active];

    if (!item.header) {
      this.host.toggleSelect(this.active);
    }
  }

  protected escape() {
    this.host.hide(true);
  }

  protected enter() {
    this.space();
    this.host.hide(true);
  }

  protected inputArrowDown(container: IgcComboListComponent) {
    container.focus();

    if (this.active === 0) {
      this.active = this.firstItem;
    }
  }

  protected hostArrowDown() {
    this.host.show(true);
  }

  protected arrowDown(container: IgcComboListComponent) {
    this.getNextItem(DIRECTION.Down);
    container.scrollToIndex(this.active, 'center');
  }

  protected arrowUp(container: IgcComboListComponent) {
    this.getNextItem(DIRECTION.Up);
    container.scrollToIndex(this.active, 'center');
  }

  protected getNextItem(direction: DIRECTION) {
    const next = this.getNearestItem(this.currentItem, direction);

    if (next === -1) return;
    this.active = next;
  }

  protected getNearestItem(startIndex: number, direction: number) {
    let index = startIndex;
    const items = this.host.dataState;

    if (items[index + direction]?.header) {
      this.getNearestItem((index += direction), direction);
    }

    index += direction;

    if (index >= 0 && index < items.length) {
      return index;
    } else {
      return -1;
    }
  }

  public hostConnected() {}

  public hostDisconnected() {
    this.active = START_INDEX;
  }

  public navigateTo(item: T, container: IgcComboListComponent) {
    this.active = this.host.dataState.findIndex((i) => i === item);
    container.scrollToIndex(this.active);
  }

  public navigateHost(event: KeyboardEvent) {
    if (this.hostHandlers.has(event.key)) {
      event.preventDefault();
      this.hostHandlers.get(event.key)!.call(this);
    }
  }

  public navigateInput(event: KeyboardEvent, container: IgcComboListComponent) {
    event.stopPropagation();

    if (this.searchInputHandlers.has(event.key)) {
      event.preventDefault();
      this.searchInputHandlers.get(event.key)!.call(this, container);
    }
  }

  public navigateList(event: KeyboardEvent, container: IgcComboListComponent) {
    if (this.listHandlers.has(event.key)) {
      event.preventDefault();
      this.listHandlers.get(event.key)!.call(this, container);
    }
  }
}
