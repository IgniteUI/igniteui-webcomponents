import { type ChildPart, noChange, nothing, type RootPart, render } from 'lit';
import {
  clearPart,
  getCommittedValue,
  insertPart,
  setChildPartValue,
  setCommittedValue,
} from 'lit/directive-helpers.js';
import { Directive, directive } from 'lit/directive.js';
import type { ItemTemplate, KeyFn } from 'lit/directives/repeat.js';

/**
 * Returns the positions in `values` of one longest strictly increasing
 * subsequence, in ascending order. O(n log n).
 */
function longestIncreasingSubsequence(values: readonly number[]): number[] {
  // `tails[k]` is the position of the smallest last value of an increasing
  // subsequence of length `k + 1`.
  const tails: number[] = [];
  const previous = new Int32Array(values.length);

  for (let i = 0; i < values.length; i++) {
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >>> 1;
      if (values[tails[middle]] < values[i]) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    previous[i] = low > 0 ? tails[low - 1] : -1;
    tails[low] = i;
  }

  const result: number[] = new Array(tails.length);
  let position = tails.at(-1) ?? -1;

  for (let k = tails.length - 1; k >= 0; k--) {
    result[k] = position;
    position = previous[position];
  }
  return result;
}

/**
 * Removes an item part, its content, and both markers. `removePart` leaves
 * the end marker in the DOM since lit-html 3.3.1 (lit/lit#5010).
 */
function removeItemPart(part: ChildPart): void {
  clearPart(part);
  (part.startNode as ChildNode).remove();
  (part.endNode as ChildNode).remove();
}

class RecycleDirective extends Directive {
  /** The key of each committed item part, in DOM order. */
  private _keys: unknown[] = [];

  /** Item parts that no key needed, detached and kept for reuse. */
  private readonly _pool: ChildPart[] = [];

  /**
   * The disconnected parent of the pooled parts. `insertPart` notifies the
   * async directives in a part when it moves the part between parents with a
   * different connected state, so a pooled part is disconnected, and a reused
   * one is connected again.
   */
  private _poolRoot?: RootPart;

  public render<T>(
    items: readonly T[],
    _keyFn: KeyFn<T>,
    template: ItemTemplate<T>
  ): unknown[] {
    return items.map(template);
  }

  public override update<T>(
    containerPart: ChildPart,
    [items, keyFn, template]: [readonly T[], KeyFn<T>, ItemTemplate<T>]
  ): unknown {
    const keys = items.map(keyFn);
    const values = items.map(template);
    const committed = getCommittedValue(containerPart);

    // First render, or the part held another value: Lit creates the parts.
    if (!Array.isArray(committed)) {
      this._keys = keys;
      return values;
    }

    setCommittedValue(
      containerPart,
      this._reconcile(containerPart, committed as ChildPart[], keys, values)
    );
    this._keys = keys;
    return noChange;
  }

  /**
   * Gives each key an item part, puts the parts in key order, and sets their
   * values.
   *
   * 1. A key that stays keeps its part.
   * 2. The other keys take the parts of the keys that left, in DOM order, so
   *    a full replacement moves no DOM. Then they take pooled parts. A part
   *    is created only when both run out.
   * 3. The parts that no key takes go to the pool, so a window that changes
   *    size by an item or two creates no DOM.
   * 4. The kept parts in the longest subsequence that keeps its old order do
   *    not move, so a kept item that holds the focus keeps it. Each other
   *    part moves in front of its successor, unless it is already there.
   */
  private _reconcile(
    containerPart: ChildPart,
    oldParts: ChildPart[],
    keys: unknown[],
    values: unknown[]
  ): ChildPart[] {
    const count = keys.length;
    const parts: (ChildPart | undefined)[] = new Array(count);
    const claimed = new Uint8Array(oldParts.length);
    const oldPositions = new Map<unknown, number>();

    for (let i = this._keys.length - 1; i >= 0; i--) {
      oldPositions.set(this._keys[i], i);
    }

    // The old DOM positions and the new positions of the kept parts.
    const keptFrom: number[] = [];
    const keptAt: number[] = [];

    for (let i = 0; i < count; i++) {
      const position = oldPositions.get(keys[i]);

      if (position !== undefined && !claimed[position]) {
        claimed[position] = 1;
        parts[i] = oldParts[position];
        keptFrom.push(position);
        keptAt.push(i);
      }
    }

    const spare = oldParts.filter((_, i) => !claimed[i]);
    let taken = 0;

    for (let i = 0; i < count; i++) {
      parts[i] ??= spare[taken++] ?? this._pool.pop();
    }
    for (const part of spare.slice(taken)) {
      this._release(part);
    }

    const stable = new Uint8Array(count);
    for (const k of longestIncreasingSubsequence(keptFrom)) {
      stable[keptAt[k]] = 1;
    }

    let next: ChildPart | undefined;
    for (let i = count - 1; i >= 0; i--) {
      let part = parts[i];

      if (!part) {
        part = parts[i] = insertPart(containerPart, next);
      } else if (!stable[i]) {
        insertPart(containerPart, next, part);
      }

      setChildPartValue(part, values[i]);
      next = part;
    }

    // Cap the pool at the window size, so a window that shrinks for good
    // frees its parts.
    while (this._pool.length > count) {
      removeItemPart(this._pool.pop()!);
    }

    return parts as ChildPart[];
  }

  private _release(part: ChildPart): void {
    this._poolRoot ??= render(nothing, document.createDocumentFragment(), {
      isConnected: false,
    });
    insertPart(this._poolRoot, undefined, part);
    this._pool.push(part);
  }
}

interface RecycleDirectiveFn {
  <T>(items: readonly T[], keyFn: KeyFn<T>, template: ItemTemplate<T>): unknown;
}

/**
 * Renders `items` as `repeat` does, but gives the DOM of a key that leaves to
 * a key that arrives. `repeat` destroys the part of each key that leaves and
 * creates one for each key that arrives, which in a scrolling window is DOM
 * churn on each scroll step. A reused part keeps any DOM state that the
 * template does not bind.
 */
export const recycle = directive(RecycleDirective) as RecycleDirectiveFn;
