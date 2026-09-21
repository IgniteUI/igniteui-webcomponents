import type { ReactiveControllerHost } from 'lit';
import { firstOf, isEmpty, lastOf } from '../utils/arrays.js';
import { isLTR } from '../utils/dom.js';
import { wrap } from '../utils/math.js';
import { isFunction } from '../utils/types.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  type KeyBindingControllerOptions,
  type KeyBindingOptions,
} from './key-bindings.js';

type RovingFocusHost = ReactiveControllerHost & HTMLElement;

/**
 * Whether an arrow axis navigates. A predicate keeps the keys bound and
 * gates only the navigation, for a host that changes orientation at runtime.
 */
type RovingFocusAxis = boolean | (() => boolean);

type RovingFocusControllerOptions<T extends Element> = {
  /** The keyboard-navigable items, in order, without the inert ones. */
  items: () => T[];
  /** The item that navigation moves from, as the host resolves it. */
  current: () => T | null | undefined;
  /** Moves the focus to `item`. The host owns any side effects. */
  focusItem: (item: T) => void;
  /** Runs with the current item on Enter and on Space. */
  activateItem?: (item: T) => void;
  /** Binding options for the activation keys. */
  activateOptions?: KeyBindingOptions;
  /** Whether ArrowLeft and ArrowRight navigate. Defaults to `true`. */
  horizontal?: RovingFocusAxis;
  /** Whether ArrowUp and ArrowDown navigate. Defaults to `false`. */
  vertical?: RovingFocusAxis;
  /** Whether Home and End jump to the first and last item. Default `true`. */
  homeEnd?: boolean;
  /**
   * How arrow navigation treats a nullish current item:
   * - `skip` - do nothing (default)
   * - `wrap` - navigate from outside the list, so "next" lands on the first
   *   item and "previous" on the last one
   */
  missingCurrent?: 'skip' | 'wrap';
  /** Options forwarded to the underlying key-bindings controller. */
  keybindings?: KeyBindingControllerOptions;
};

/**
 * Implements the roving keyboard navigation of the container components.
 *
 * @remarks
 * Moves wrap over a flat list, and the horizontal axis follows the writing
 * direction. A hierarchy, such as the tree, needs its own navigation.
 */
class RovingFocusController<T extends Element> {
  private readonly _host: RovingFocusHost;
  private readonly _options: RovingFocusControllerOptions<T>;

  constructor(host: RovingFocusHost, options: RovingFocusControllerOptions<T>) {
    this._host = host;
    this._options = options;

    const {
      horizontal = true,
      vertical = false,
      homeEnd = true,
      activateItem,
      activateOptions,
      keybindings,
    } = options;

    const bindings = addKeybindings(host, keybindings);

    if (horizontal) {
      bindings
        .set(arrowLeft, () => this._move(-1, horizontal, true))
        .set(arrowRight, () => this._move(1, horizontal, true));
    }

    if (vertical) {
      bindings
        .set(arrowUp, () => this._move(-1, vertical, false))
        .set(arrowDown, () => this._move(1, vertical, false));
    }

    if (homeEnd) {
      bindings
        .set(homeKey, () => this._focus(firstOf(this._options.items())))
        .set(endKey, () => this._focus(lastOf(this._options.items())));
    }

    if (activateItem) {
      bindings.setActivateHandler(() => this._activate(), activateOptions);
    }
  }

  private _focus(item?: T): void {
    if (item) {
      this._options.focusItem.call(this._host, item);
    }
  }

  private _move(delta: -1 | 1, axis: RovingFocusAxis, rtlAware: boolean): void {
    if (isFunction(axis) && !axis.call(this._host)) {
      return;
    }

    const items = this._options.items();
    const current = this._options.current();

    if (
      isEmpty(items) ||
      (!current && this._options.missingCurrent !== 'wrap')
    ) {
      return;
    }

    // An item outside the set gives -1, so the move wraps in from an edge.
    const index = current ? items.indexOf(current) : -1;
    const direction = rtlAware && !isLTR(this._host) ? -delta : delta;
    const next = wrap(0, items.length - 1, index + direction);

    this._focus(items[next]);
  }

  private _activate(): void {
    const current = this._options.current();

    if (current && this._options.items().includes(current)) {
      this._options.activateItem!.call(this._host, current);
    }
  }
}

/** Creates a {@link RovingFocusController} for the given host. */
export function addRovingFocusController<T extends Element>(
  host: RovingFocusHost,
  options: RovingFocusControllerOptions<T>
): RovingFocusController<T> {
  return new RovingFocusController(host, options);
}

export type { RovingFocusController, RovingFocusControllerOptions };
