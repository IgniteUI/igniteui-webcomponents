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
 * Whether an arrow axis navigates. A predicate keeps the keys bound - and
 * their default behavior suppressed - while gating the navigation itself,
 * for hosts that switch orientation at runtime.
 */
type RovingFocusAxis = boolean | (() => boolean);

type RovingFocusControllerOptions<T extends Element> = {
  /**
   * The keyboard-navigable items, in order, with non-interactive ones
   * already excluded.
   */
  items: () => T[];
  /**
   * The item navigation moves relative to - typically resolved from the
   * focused element. Arrow navigation and activation are no-ops while nullish.
   */
  current: () => T | null | undefined;
  /**
   * Moves focus to `item`. The host owns the focus delegation and any side
   * effects riding along with it (scrolling, selection-follows-focus).
   */
  focusItem: (item: T) => void;
  /**
   * Invoked with the current item on Enter/Space, when the item is part of
   * {@link RovingFocusControllerOptions.items}. Omit to skip the activation
   * binding altogether.
   */
  activateItem?: (item: T) => void;
  /** Binding options for the activation keys. */
  activateOptions?: KeyBindingOptions;
  /**
   * Whether ArrowLeft/ArrowRight navigate, following the writing direction.
   * Defaults to `true`.
   */
  horizontal?: RovingFocusAxis;
  /** Whether ArrowUp/ArrowDown navigate. Defaults to `false`. */
  vertical?: RovingFocusAxis;
  /** Whether Home/End jump to the first/last item. Defaults to `true`. */
  homeEnd?: boolean;
  /**
   * How arrow navigation treats a nullish current item:
   * - `skip` - do nothing (default)
   * - `wrap` - navigate from just outside the list, so "next" lands on the
   *   first item and "previous" on the last one
   */
  missingCurrent?: 'skip' | 'wrap';
  /** Options forwarded to the underlying key-bindings controller. */
  keybindings?: KeyBindingControllerOptions;
};

/**
 * Implements the roving keyboard navigation shared by the container
 * components: Home/End jumps and wrapping ArrowKey moves over a flat list of
 * enabled items, relative to the currently focused one, with the horizontal
 * axis following the writing direction.
 *
 * The host supplies the item list, the current-item resolution and the focus
 * delegation; hierarchical structures (the tree) need their own navigation.
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

    // A current item outside the set resolves to -1 as well, wrapping the
    // navigation in from the closest list edge.
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

/** Creates and adds a {@link RovingFocusController} to the given host. */
export function addRovingFocusController<T extends Element>(
  host: RovingFocusHost,
  options: RovingFocusControllerOptions<T>
): RovingFocusController<T> {
  return new RovingFocusController(host, options);
}

export type { RovingFocusController, RovingFocusControllerOptions };
