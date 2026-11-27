import type { ReactiveElement } from 'lit';
import { roleOf } from '#internals/controllers/internals.js';
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
  isInShadowTreeOf,
  isLTR,
  isRadioGroupStop,
  isTabStopWithout,
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

/**
 * How a row treats an element by its role: a single control that keeps every
 * arrow key, or a composite control that keeps only the keys it handles.
 */
const ROLE_KINDS = new Map<string, 'arrows' | 'composite'>([
  ['combobox', 'arrows'],
  ['radio', 'arrows'],
  ['searchbox', 'arrows'],
  ['slider', 'arrows'],
  ['spinbutton', 'arrows'],
  ['textbox', 'arrows'],
  ['grid', 'composite'],
  ['listbox', 'composite'],
  ['menu', 'composite'],
  ['menubar', 'composite'],
  ['radiogroup', 'composite'],
  ['tablist', 'composite'],
  ['toolbar', 'composite'],
  ['tree', 'composite'],
  ['treegrid', 'composite'],
]);

/** Whether `element` is a composite control, such as a radio group, tabs or a navigable list. */
function isComposite(element: Element): boolean {
  return ROLE_KINDS.get(roleOf(element)) === 'composite';
}

function usesArrows(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return !ARROWLESS_INPUTS.has(element.type);
  }

  return (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    (element as HTMLElement).isContentEditable ||
    ROLE_KINDS.get(roleOf(element)) === 'arrows'
  );
}

/**
 * Whether an element on the event path below `row`, also in a shadow root,
 * uses the arrow keys. A composite control does not count.
 */
function takesArrows(event: Event, row: Element): boolean {
  const path = event.composedPath();

  return path
    .slice(0, path.indexOf(row))
    .some((target) => target instanceof Element && usesArrows(target));
}

/**
 * The elements inside `host` that Tab reaches, whatever the `tabindex` of
 * `host` itself, such as the `-1` of the list.
 */
function focusablesInside(
  host: Element
): IteratorObject<HTMLElement, undefined> {
  return Iterator.from((host.shadowRoot ?? host).children).flatMap(
    getFocusableElements
  );
}

/** Whether the shadow tree of `host`, not its slotted content, has a focusable element. */
function hasShadowControl(host: HTMLElement): boolean {
  return focusablesInside(host).some((element) =>
    isInShadowTreeOf(element, host)
  );
}

/**
 * Where the keyboard enters a composite control: the composite itself when it
 * is a tab stop without the claim of `owner`, such as an empty navigable list,
 * else the first element inside it that Tab reaches.
 */
function entryOf(
  composite: HTMLElement,
  owner: object
): HTMLElement | undefined {
  return isTabStopWithout(composite, owner)
    ? composite
    : focusablesInside(composite).next().value;
}

function isPendingHost(element: Element): element is ReactiveElement {
  return !!(element as Partial<ReactiveElement>).isUpdatePending;
}

/** Whether `element` is a control as one element, so the search does not enter it. */
function isHostControl(element: HTMLElement): boolean {
  return (
    isComposite(element) || (!!element.shadowRoot && hasShadowControl(element))
  );
}

/**
 * Whether `element`, which is no control, can turn into one with no mutation:
 * a shadow host can render a control, and a custom element can be defined.
 */
function mayTurnIntoControl(element: HTMLElement): boolean {
  return (
    !!element.shadowRoot ||
    (element.localName.includes('-') && !element.matches(':defined'))
  );
}

type ControlSearchResult = {
  controls: HTMLElement[];
  /** The Lit hosts, the item among them, that may show controls after their pending update. */
  pending: ReactiveElement[];
  /** The elements that {@link mayTurnIntoControl}. */
  candidates: HTMLElement[];
};

/**
 * Returns the controls of a list item in the order of its layout: elements
 * focusable by type, composite controls, and hosts with a focusable element in
 * their shadow tree. A `tabindex` on a host also covers its shadow tree and its
 * slotted content, so the search does not enter a host.
 *
 * @param isKnown - Whether an element is a control found before, which its own
 * `tabindex="-1"` may hide now.
 */
function findControls(
  item: Element,
  isKnown: (element: HTMLElement) => boolean
): ControlSearchResult {
  const controls: HTMLElement[] = [];
  const pending: ReactiveElement[] = [];
  const candidates: HTMLElement[] = [];

  const visit = (element: Element): void => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const known = isKnown(element);

    if ((known && element.shadowRoot) || isHostControl(element)) {
      controls.push(element);
      return;
    }

    if (known || element.matches(FOCUSABLE_SELECTOR)) {
      controls.push(element);
    } else if (isPendingHost(element)) {
      // A first render, or a re-render after a `disabled` change.
      pending.push(element);
    } else if (mayTurnIntoControl(element)) {
      candidates.push(element);
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

  return { controls, pending, candidates };
}

type ListGridOptions = {
  /** Whether the list runs the grid mode. */
  active: () => boolean;
  /** The rows of the list, in order. */
  rows: () => readonly IgcListItemComponent[];
  /** The own row that is `node` or holds it. */
  rowOf: (node: Element) => IgcListItemComponent | undefined;
};

/** The attributes that can make an element in a row a control or stop it being one. */
export const CONTROL_ATTRIBUTES = [
  'contenteditable',
  'disabled',
  'hidden',
  'href',
  'role',
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

  /** The controls that are composites now. A role change can turn them into content. */
  private readonly _composites = new WeakSet<HTMLElement>();

  /** The elements of each row that may turn into controls with no mutation. */
  private readonly _candidates = new WeakMap<
    IgcListItemComponent,
    HTMLElement[]
  >();

  /** Controls found before stay controls, so that their own `-1` does not hide them; composites do not. */
  private readonly _isKnown = (element: HTMLElement): boolean =>
    this._controls.has(element) && !this._composites.has(element);

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

  /**
   * The element that takes the focus for `control`, as Tab does: a composite
   * is entered at its own tab stop, and a native radio group at its checked
   * radio. None for a composite with no enabled item.
   */
  private _focusTarget(control: HTMLElement): HTMLElement | undefined {
    if (isComposite(control)) {
      return entryOf(control, this._host);
    }

    return isRadioGroupStop(control) ? control : undefined;
  }

  /** Moves between a row and its controls, around the ends. */
  private _moveInRow(event: KeyboardEvent, delta: 1 | -1): void {
    const target = event.target as Element;
    const row = this._options.rowOf(target)!;

    if (target !== row && takesArrows(event, row)) {
      return;
    }

    const controls = findControls(row, this._isKnown).controls.filter(
      canTakeFocus
    );
    // 0 is the row, also for a focused element outside the controls.
    const index = controls.findIndex((control) => control.contains(target)) + 1;
    const step = isLTR(this._host) ? delta : -delta;
    let next = index;
    let stop: HTMLElement | undefined;

    do {
      next = wrap(0, controls.length, next + step);
      stop = next === 0 ? row : this._focusTarget(controls[next - 1]);
    } while (!stop);

    if (next !== index) {
      event.preventDefault();
      stop.focus();
    }
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
      !takesArrows(event, row)
    );
  }

  /**
   * Syncs `row`, which takes the focus, when one of its candidates turned into
   * a control with no mutation. Tab reaches only the controls of the tab stop
   * row: the `tabindex="-1"` of the other rows also covers their content.
   */
  public syncCandidates(row: IgcListItemComponent): void {
    const changed = (element: HTMLElement) =>
      isHostControl(element) || isPendingHost(element);

    if (this._options.active() && this._candidates.get(row)?.some(changed)) {
      this.sync([row]);
    }
  }

  /**
   * Moves the focus to `row` when its focused `control` can no longer take it,
   * such as a control that became disabled or hidden.
   */
  public recoverFocus(row: IgcListItemComponent, control: HTMLElement): void {
    if (this._options.active() && control !== row && !canTakeFocus(control)) {
      row.focus();
    }
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
    const { active, rowOf } = this._options;
    const inGrid = active() && this._host.isConnected;

    if (!inGrid && this._controls.size === 0) {
      return;
    }

    const scope = new Set(rows);
    const found = new Set<HTMLElement>();
    const pending: ReactiveElement[] = [];

    for (const row of inGrid ? rows : []) {
      if (rowOf(row) === row) {
        const search = findControls(row, this._isKnown);
        search.controls.forEach((control) => found.add(control));
        pending.push(...search.pending);
        this._candidates.set(row, search.candidates);
      }
    }

    for (const control of this._controls) {
      const row = rowOf(control);

      if (!found.has(control) && (!inGrid || !row || scope.has(row))) {
        releaseTabIndex(control, this._host);
        this._controls.delete(control);
        this._composites.delete(control);
      }
    }

    for (const control of found) {
      if (!this._controls.has(control)) {
        claimTabIndex(control, '-1', this._host);
        this._controls.add(control);
      }

      if (isComposite(control)) {
        this._composites.add(control);
      } else {
        this._composites.delete(control);
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
