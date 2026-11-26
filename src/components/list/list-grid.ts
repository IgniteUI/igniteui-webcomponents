import type { ReactiveElement } from 'lit';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  escapeKey,
  f2Key,
  isKey,
  shiftKey,
  tabKey,
} from '#internals/controllers/key-bindings.js';
import type { MutationControllerParams } from '#internals/controllers/mutation-observer.js';
import { isEmpty } from '#internals/utils/arrays.js';
import {
  canTakeFocus,
  claimTabIndex,
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  isElement,
  isLTR,
  releaseTabIndex,
} from '#internals/utils/dom.js';
import { wrap } from '#internals/utils/math.js';
import IgcListItemComponent from './list-item.js';

/** The `<input>` types that take no arrow key. */
const ARROWLESS_INPUTS = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'reset',
  'submit',
]);

/** The roles of the widgets that move with the arrow keys. */
const ARROW_ROLES = new Set([
  'combobox',
  'grid',
  'listbox',
  'menu',
  'menubar',
  'radio',
  'radiogroup',
  'searchbox',
  'slider',
  'spinbutton',
  'tablist',
  'textbox',
  'toolbar',
  'tree',
  'treegrid',
]);

function usesArrows(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return !ARROWLESS_INPUTS.has(element.type);
  }

  return (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    (element as HTMLElement).isContentEditable ||
    // A library component sets its role through its internals.
    ARROW_ROLES.has(
      element.getAttribute('role') ??
        internalsOf(element)?.getARIA('role') ??
        ''
    )
  );
}

/**
 * Whether an element on the event path below `row`, also in a shadow root,
 * uses the arrow keys. A widget that counts as one control, such as a nested
 * list, leaves Left and Right to the row.
 */
function takesArrows(
  event: Event,
  row: Element,
  isWidget: (element: Element) => boolean
): boolean {
  const path = event.composedPath();

  return path
    .slice(0, path.indexOf(row))
    .some(
      (target) =>
        target instanceof Element && !isWidget(target) && usesArrows(target)
    );
}

/** Whether the shadow tree of `host`, not its slotted content, has a focusable element. */
function hasShadowControl(host: HTMLElement): boolean {
  return getFocusableElements(host).some((element) => !host.contains(element));
}

function isPendingHost(element: Element): element is ReactiveElement {
  return !!(element as Partial<ReactiveElement>).isUpdatePending;
}

type ControlSearch = {
  /** Controls found before, which their own `tabindex="-1"` may hide now. */
  known: ReadonlySet<Element>;
  /** Whether `element` is one control, such as a nested list, that the search does not enter. */
  isWidget: (element: Element) => boolean;
};

type ControlSearchResult = {
  controls: HTMLElement[];
  /** The Lit hosts, the item among them, that may show controls after their pending update. */
  pending: ReactiveElement[];
};

/**
 * Returns the controls of a list item in the order of its layout: elements
 * focusable by type, and hosts with a focusable element in their shadow tree.
 * A `tabindex` on a host also covers its shadow tree and its slotted content,
 * so the search does not enter a host.
 */
function findControls(
  item: Element,
  { known, isWidget }: ControlSearch
): ControlSearchResult {
  const controls: HTMLElement[] = [];
  const pending: ReactiveElement[] = [];

  const visit = (element: Element): void => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const isKnown = known.has(element);

    if (
      isWidget(element) ||
      (element.shadowRoot && (isKnown || hasShadowControl(element)))
    ) {
      controls.push(element);
      return;
    }

    if (isKnown || element.matches(FOCUSABLE_SELECTOR)) {
      controls.push(element);
    } else if (isPendingHost(element)) {
      // A first render, or a re-render after a `disabled` change.
      pending.push(element);
    }

    for (const child of element.children) {
      visit(child);
    }
  };

  // The slots of the item come in the order of its layout.
  const slots = item.shadowRoot?.querySelectorAll('slot') ?? [];

  if (slots.length === 0 && isPendingHost(item)) {
    pending.push(item);
  }

  for (const slot of slots) {
    for (const child of slot.assignedElements()) {
      visit(child);
    }
  }

  return { controls, pending };
}

type ListGridOptions = {
  /** Whether the list runs the grid mode. */
  active: () => boolean;
  /** The rows of the list, in order. */
  rows: () => readonly IgcListItemComponent[];
  /** The own row that is `node` or holds it. */
  rowOf: (node: Element) => IgcListItemComponent | undefined;
  /** Whether `element` is one control, such as a nested list, that the search does not enter. */
  isWidget: (element: Element) => boolean;
  /** Focuses a row or a control. A widget focuses its own tab stop. */
  focus: (control: HTMLElement) => void;
};

/** The attributes that can make an element in a row a control or stop it being one. */
export const CONTROL_ATTRIBUTES = [
  'contenteditable',
  'disabled',
  'hidden',
  'href',
  'tabindex',
];

/**
 * The grid mode of a list: takes the controls of the rows out of the tab
 * order, and moves between a row and its controls with Left and Right. Up and
 * Down from a control move to the next or previous row through the list.
 */
class ListGrid {
  private readonly _host: HTMLElement;
  private readonly _options: ListGridOptions;

  /** The controls of the rows, out of the tab order. */
  private readonly _controls = new Set<HTMLElement>();

  constructor(host: ReactiveElement & HTMLElement, options: ListGridOptions) {
    this._host = host;
    this._options = options;

    addKeybindings(host, {
      skip: (node, event) => !this._rowFor(node, event),
      // The handlers cancel only the keys that they use.
      bindingDefaults: { preventDefault: false, repeat: true },
    })
      .set(arrowLeft, (event) => this._moveInRow(event, -1))
      .set(arrowRight, (event) => this._moveInRow(event, 1))
      .set(escapeKey, (event) => this._returnToRow(event))
      .set(f2Key, (event) => this._returnToRow(event))
      .set([shiftKey, tabKey], (event) => this._leaveFromControl(event));
  }

  /** The own row of `node` when a grid key moves from it. A key that a control handled stays with it. */
  private _rowFor(
    node: Element,
    event: KeyboardEvent
  ): IgcListItemComponent | undefined {
    return this._options.active() && !event.defaultPrevented
      ? this._options.rowOf(node)
      : undefined;
  }

  private _search(row: IgcListItemComponent): ControlSearchResult {
    return findControls(row, {
      known: this._controls,
      isWidget: this._options.isWidget,
    });
  }

  /** Moves between a row and its controls, around the ends. */
  private _moveInRow(event: KeyboardEvent, delta: 1 | -1): void {
    const target = event.target as Element;
    const row = this._options.rowOf(target)!;

    if (target !== row && takesArrows(event, row, this._options.isWidget)) {
      return;
    }

    const controls = this._search(row).controls.filter(canTakeFocus);

    if (isEmpty(controls)) {
      return;
    }

    event.preventDefault();

    // 0 is the row, also for a focused element outside the controls.
    const stops = [row, ...controls];
    const index = controls.findIndex((control) => control.contains(target)) + 1;
    const step = isLTR(this._host) ? delta : -delta;
    const next = stops[wrap(0, stops.length - 1, index + step)];

    this._options.focus(next);
  }

  private _returnToRow(event: KeyboardEvent): void {
    const target = event.target as Element;
    const row = this._options.rowOf(target)!;

    if (target !== row) {
      event.preventDefault();
      row.focus();
    }
  }

  /**
   * Shift+Tab from a control would stop at its row, the tab stop. It starts
   * from the row instead, and the default action leaves the list.
   */
  private _leaveFromControl(event: KeyboardEvent): void {
    this._options.rowOf(event.target as Element)!.focus();
  }

  /** The rows that arrived, and the rows whose controls may have changed. */
  private _changedRows({
    added,
    removed,
    attributes,
  }: MutationControllerParams['changes']): IgcListItemComponent[] {
    const rows = new Set<IgcListItemComponent>();
    const add = (element: Element): void => {
      const row = this._options.rowOf(element);

      if (row) {
        rows.add(row);
      }
    };

    for (const { node, target } of removed) {
      if (isElement(node)) {
        add(target);
      }
    }

    for (const { node } of added) {
      if (isElement(node)) {
        add(node);
        node.querySelectorAll(IgcListItemComponent.tagName).forEach(add);
      }
    }

    for (const { node, attributeName } of attributes) {
      const element = node as Element;
      // The lists write the `tabindex` of their items and controls.
      const ownWrite =
        attributeName === 'tabindex' &&
        (element instanceof IgcListItemComponent ||
          this._controls.has(element as HTMLElement));

      if (CONTROL_ATTRIBUTES.includes(attributeName ?? '') && !ownWrite) {
        add(element);
      }
    }

    return [...rows];
  }

  /**
   * Whether Up or Down on a control of a row moves to the next or previous
   * row: the control neither uses nor handled the key.
   */
  public movesFromControl(node: Element, event: KeyboardEvent): boolean {
    const row = this._rowFor(node, event);

    return (
      !!row &&
      (isKey(event, arrowUp) || isKey(event, arrowDown)) &&
      !takesArrows(event, row, this._options.isWidget)
    );
  }

  /**
   * Syncs the rows that a mutation touched. With `rowsLeft`, it also releases
   * the controls of the rows that left the list.
   */
  public handleMutations(
    changes: MutationControllerParams['changes'],
    rowsLeft: boolean
  ): void {
    if (!this._options.active() && this._controls.size === 0) {
      return;
    }

    const rows = this._changedRows(changes);

    if (rowsLeft || !isEmpty(rows)) {
      this.sync(rows);
    }
  }

  /**
   * Takes the controls of `rows` out of the tab order, and gives the app its
   * `tabindex` back on the controls that left them.
   */
  public sync(
    rows: readonly IgcListItemComponent[] = this._options.rows()
  ): void {
    const { active, rowOf, isWidget } = this._options;
    const inGrid = active() && this._host.isConnected;

    if (!inGrid && this._controls.size === 0) {
      return;
    }

    const scope = new Set(rows);
    const searches = inGrid
      ? rows.filter((row) => rowOf(row) === row).map((row) => this._search(row))
      : [];
    const pending = searches.flatMap((search) => search.pending);
    const found = new Set(
      searches
        .flatMap((search) => search.controls)
        // A nested list keeps its own tab stop.
        .filter((control) => !isWidget(control))
    );

    for (const control of this._controls) {
      const row = rowOf(control);

      if (!found.has(control) && (!inGrid || !row || scope.has(row))) {
        releaseTabIndex(control);
        this._controls.delete(control);
      }
    }

    for (const control of found) {
      if (!this._controls.has(control)) {
        claimTabIndex(control, '-1');
        this._controls.add(control);
      }
    }

    // A host that renders later may turn into a control.
    if (!isEmpty(pending)) {
      Promise.allSettled(pending.map((host) => host.updateComplete)).then(() =>
        this.sync(rows)
      );
    }
  }
}

/** Creates the {@link ListGrid} of a list. */
export function createListGrid(
  host: ReactiveElement & HTMLElement,
  options: ListGridOptions
): ListGrid {
  return new ListGrid(host, options);
}

export type { ListGrid };
