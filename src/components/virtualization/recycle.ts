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
import { getRoot } from '#internals/utils/dom.js';

/**
 * The weight of a kept part when the reconciliation selects the parts that do
 * not move. A recycled part weighs 1. A moved element needs a new style and
 * layout, but a recycled element needs a new layout for its new item anyway.
 * So on a scroll, the kept parts move only when they are fewer than half the
 * recycled parts.
 */
const KEPT_WEIGHT = 2;

/**
 * Marks the entries of the increasing subsequence of `values` with the largest
 * total weight. The values are distinct integers in `[0, size)`, or negative
 * for the entries to skip. O(n log size).
 */
function heaviestIncreasingSubsequence(
  values: Int32Array,
  weights: Int32Array,
  size: number
): Uint8Array {
  // A Fenwick tree over the values. Each node holds the weight of the heaviest
  // subsequence that ends at a value in its range, and the entry of its last
  // value.
  const heaviest = new Int32Array(size + 1);
  const endsAt = new Int32Array(size + 1);
  const previous = new Int32Array(values.length);
  const marked = new Uint8Array(values.length);
  let best = 0;
  let last = -1;

  for (let i = 0; i < values.length; i++) {
    if (values[i] < 0) {
      continue;
    }

    let total = 0;
    let before = -1;
    for (let node = values[i]; node > 0; node -= node & -node) {
      if (heaviest[node] > total) {
        total = heaviest[node];
        before = endsAt[node];
      }
    }

    total += weights[i];
    previous[i] = before;
    for (let node = values[i] + 1; node <= size; node += node & -node) {
      if (total > heaviest[node]) {
        heaviest[node] = total;
        endsAt[node] = i;
      }
    }
    if (total > best) {
      best = total;
      last = i;
    }
  }

  for (let i = last; i >= 0; i = previous[i]) {
    marked[i] = 1;
  }
  return marked;
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

/** Returns the position of the part in `parts` that holds the focus, or -1. */
function focusedPosition(
  containerPart: ChildPart,
  parts: readonly ChildPart[]
): number {
  const container = containerPart.parentNode;
  let node: Node | null = getRoot(container).activeElement;

  while (node && node.parentNode !== container) {
    node = node.parentNode;
  }
  if (!node) {
    return -1;
  }

  return parts.findIndex((part) => {
    let n = part.startNode!.nextSibling;
    while (n && n !== part.endNode && n !== node) {
      n = n.nextSibling;
    }
    return n === node;
  });
}

class RecycleDirective extends Directive {
  /** The key of each committed item part, in DOM order. */
  private _keys: unknown[] = [];

  /** Item parts that no key needed, detached and kept for reuse. */
  private readonly _pool: ChildPart[] = [];

  /**
   * The disconnected parent of the pooled parts, in the document of the
   * container. A part that moves to another document is adopted: its custom
   * elements get `adoptedCallback`, and its images load again. `insertPart`
   * notifies the async directives in a part when it moves the part between
   * parents with a different connected state, so a pooled part is
   * disconnected, and a reused one is connected again.
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
   * 4. The reused parts in the heaviest subsequence that keeps its old order
   *    do not move, see `KEPT_WEIGHT`. A kept part that holds the focus
   *    weighs more than all the other parts together, so it does not move and
   *    keeps the focus. Each other part moves in front of its successor,
   *    unless it is already there.
   */
  private _reconcile(
    containerPart: ChildPart,
    oldParts: ChildPart[],
    keys: unknown[],
    values: unknown[]
  ): ChildPart[] {
    const count = keys.length;
    const parts: (ChildPart | undefined)[] = new Array(count);
    // The old DOM position (-1 for a pooled or new part) and the weight of the
    // part at each new position.
    const from = new Int32Array(count).fill(-1);
    const weights = new Int32Array(count);
    const claimed = new Uint8Array(oldParts.length);
    const oldPositions = new Map<unknown, number>();
    const focused = focusedPosition(containerPart, oldParts);

    for (let i = this._keys.length - 1; i >= 0; i--) {
      oldPositions.set(this._keys[i], i);
    }

    for (let i = 0; i < count; i++) {
      const position = oldPositions.get(keys[i]);

      if (position !== undefined && !claimed[position]) {
        claimed[position] = 1;
        from[i] = position;
        weights[i] = position === focused ? KEPT_WEIGHT * count : KEPT_WEIGHT;
      }
    }

    let spare = 0;
    for (let i = 0; i < count; i++) {
      if (from[i] < 0) {
        while (claimed[spare]) spare++;
        if (spare < oldParts.length) {
          claimed[spare] = 1;
          from[i] = spare;
          weights[i] = 1;
        }
      }
      parts[i] = from[i] < 0 ? this._pool.pop() : oldParts[from[i]];
    }

    oldParts.forEach((part, position) => {
      if (!claimed[position]) this._release(part);
    });

    const stable = heaviestIncreasingSubsequence(
      from,
      weights,
      oldParts.length
    );

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
    const doc = part.parentNode.ownerDocument!;

    // A new root on the first release, and after the container moves to
    // another document. The parts in an old root move to the new document
    // only when they are reused.
    if (this._poolRoot?.parentNode.ownerDocument !== doc) {
      this._poolRoot = render(nothing, doc.createDocumentFragment(), {
        isConnected: false,
      });
    }

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
