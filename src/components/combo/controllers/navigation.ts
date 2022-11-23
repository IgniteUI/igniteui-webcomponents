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

  protected get currentNode() {
    const node = this.active;
    return node === START_INDEX ? 0 : node;
  }

  protected get firstItemIndex() {
    const items = this.host.dataState.filter((i) => (i as any).header !== true);
    return this.host.dataState.indexOf(items[0]);
  }

  protected get lastItemIndex() {
    return this.host.dataState.length - 1;
  }

  public get active() {
    return this._active;
  }

  public set active(node: any) {
    this._active = node;
    this.host.requestUpdate();
  }

  constructor(protected host: ComboHost<T>) {
    this.host.addController(this);
  }

  protected home() {
    this.active = this.firstItemIndex;
    this.host.scrollToIndex(this.active);
  }

  protected end() {
    this.active = this.lastItemIndex;
    this.host.scrollToIndex(this.active);
  }

  protected arrowDown() {
    this.navigateTo(DIRECTION.Down);
  }

  protected arrowUp() {
    this.navigateTo(DIRECTION.Up);
  }

  protected navigateTo(direction: DIRECTION) {
    const index = this.getNearestItem(this.currentNode, direction);

    if (index === -1) {
      return;
    }

    this.active = index;
    this.host.scrollToIndex(index);
  }

  protected getNearestItem(startIndex: number, direction: number) {
    let index = startIndex;
    const items = this.host.dataState;

    while (
      items[index + direction] &&
      (items[index + direction] as any).header
    ) {
      index += direction;
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
