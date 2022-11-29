import { ReactiveController, ReactiveControllerHost } from 'lit';
import IgcComboListComponent from '../combo-list.js';
import IgcComboComponent from '../combo.js';
import { ComboRecord } from '../types.js';

type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;

const START_INDEX: Readonly<number> = -1;

enum DIRECTION {
  Up = -1,
  Down = 1,
}

export class NavigationController<T extends object>
  implements ReactiveController
{
  protected handlers = new Map(
    Object.entries({
      ArrowDown: this.arrowDown,
      ArrowUp: this.arrowUp,
      ' ': this.space,
      Enter: this.enter,
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
    if (this.active !== -1) {
      this.host.toggleSelect(this.active);
    }
  }

  protected enter() {
    this.space();
    this.host.open = false;
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

  public navigate(event: KeyboardEvent, container: IgcComboListComponent) {
    if (this.handlers.has(event.key)) {
      event.preventDefault();
      this.handlers.get(event.key)!.call(this, container);
    }
  }
}
