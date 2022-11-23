import { ReactiveController, ReactiveControllerHost } from 'lit';
import IgcComboComponent from '../combo';

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
    return this.host.dataState.findIndex((i: any) => i.header !== true);
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

  protected home() {
    this.active = this.firstItem;
    this.host.scrollToIndex(this.active);
  }

  protected async end() {
    this.active = this.lastItem;
    this.host.scrollToIndex(this.active);
  }

  protected arrowDown() {
    this.getNextItem(DIRECTION.Down);
  }

  protected arrowUp() {
    this.getNextItem(DIRECTION.Up);
  }

  protected getNextItem(direction: DIRECTION) {
    const next = this.getNearestItem(this.currentItem, direction);

    if (next === -1) return;

    this.active = next;
    this.host.scrollToIndex(this.active);
  }

  protected getNearestItem(startIndex: number, direction: number) {
    let index = startIndex;
    const items = this.host.dataState;

    if ((items[index + direction] as any)?.header) {
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

  public navigate(event: KeyboardEvent) {
    if (this.handlers.has(event.key)) {
      event.preventDefault();
      this.handlers.get(event.key)!.call(this);
    }
  }
}
