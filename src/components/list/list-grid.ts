import type { ReactiveElement } from 'lit';
import { internalsOf } from '#internals/controllers/internals.js';
import {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
} from '#internals/utils/dom.js';

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

/** The role of `element`. A library component sets its role through its internals. */
function roleOf(element: Element): string | null {
  return (
    element.getAttribute('role') ??
    internalsOf(element)?.getARIA('role') ??
    null
  );
}

function usesArrows(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return !ARROWLESS_INPUTS.has(element.type);
  }

  return (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    (element as HTMLElement).isContentEditable ||
    ARROW_ROLES.has(roleOf(element) ?? '')
  );
}

/**
 * Whether an element on the event path below `row`, also in a shadow root,
 * uses the arrow keys. A widget that counts as one control, such as a nested
 * list, leaves Left and Right to the row.
 */
export function takesArrows(
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

/** Whether `element` is a Lit host with an update pending, such as its first render. */
function isPendingHost(element: Element): element is ReactiveElement {
  return !!(element as Partial<ReactiveElement>).isUpdatePending;
}

type ControlSearch = {
  /** Controls found before, which their own `tabindex="-1"` may hide now. */
  known: ReadonlySet<Element>;
  /** Whether `element` is one control, such as a nested list, that the search does not enter. */
  isWidget: (element: Element) => boolean;
};

export type ControlSearchResult = {
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
export function findControls(
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
