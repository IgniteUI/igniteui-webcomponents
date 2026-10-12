import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { registerComponent } from '#internals/definitions/register.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { isDefined } from '#internals/utils/types.js';

/* blazorSuppress */
/**
 *
 * @element igc-focus-trap
 *
 * @slot - The content of the focus trap component
 */
export default class IgcFocusTrapComponent extends LitElement {
  public static readonly tagName = 'igc-focus-trap';
  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcFocusTrapComponent);
  }

  @state()
  protected _focused = false;

  /**
   * Whether to manage focus state for the slotted children.
   * @attr disabled
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether focus is currently inside the trap component.
   */
  public get focused() {
    return this._focused;
  }

  /** An array of focusable elements including elements in Shadow roots */
  public get focusableElements() {
    return Array.from(getFocusableElements<HTMLElement>(this));
  }

  constructor() {
    super();

    addSafeEventListener(this, 'focusin', () => {
      this._focused = true;
    });
    addSafeEventListener(this, 'focusout', () => {
      this._focused = false;
    });
  }

  public focusFirstElement() {
    this.focusableElements.at(0)?.focus();
  }

  public focusLastElement() {
    this.focusableElements.at(-1)?.focus();
  }

  protected override render() {
    const tabStop = !this.focused || this.disabled ? -1 : 0;

    return html`
      <div
        id="start"
        tabindex=${tabStop}
        @focus=${this.disabled ? nothing : this.focusLastElement}
      ></div>
      <slot></slot>
      <div
        id="end"
        tabindex=${tabStop}
        @focus=${this.disabled ? nothing : this.focusFirstElement}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-focus-trap': IgcFocusTrapComponent;
  }
}

const defaultSelectors = [
  '[tabindex]',
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
];

function isHiddenOrDisabled(node: HTMLElement) {
  return (
    node.hasAttribute('hidden') ||
    node.hasAttribute('inert') ||
    node.hasAttribute('disabled') ||
    (node.hasAttribute('aria-hidden') &&
      node.getAttribute('aria-hidden') !== 'false')
  );
}

function isContentEditable(node: HTMLElement) {
  return (
    node.hasAttribute('contenteditable') &&
    node.getAttribute('contenteditable') !== 'false'
  );
}

function isFocusable(node: HTMLElement) {
  if (isHiddenOrDisabled(node)) {
    return false;
  }

  if (isContentEditable(node)) {
    return true;
  }

  if (node.tabIndex === -1) {
    return false;
  }

  return defaultSelectors.some((selector) => node.matches(selector));
}

/** Tree walker filter. Rejects a hidden, disabled or cached node and its subtree. */
function shouldSkipElements(node: Node, cache?: WeakSet<HTMLElement>) {
  const element = node as HTMLElement;

  return isHiddenOrDisabled(element) || cache?.has(element)
    ? NodeFilter.FILTER_REJECT
    : NodeFilter.FILTER_ACCEPT;
}

/** Returns the slotted elements and the parent element containing the slot */
function getSlottedElements(node: HTMLElement) {
  const slot = node as HTMLSlotElement;
  const elements = slot.assignedElements() as HTMLElement[];
  return { elements, parent: elements.at(0)?.parentElement };
}

function* getFocusableElements<T extends HTMLElement>(
  root: HTMLElement | ShadowRoot,
  cache = new WeakSet<HTMLElement>()
): Generator<T> {
  if (!isDefined(globalThis.document)) {
    return;
  }

  let node: T;

  const visitor = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    (node) => shouldSkipElements(node, cache)
  );

  while ((node = visitor.nextNode() as T)) {
    if (cache.has(node)) {
      continue;
    }

    if (node.shadowRoot) {
      yield* getFocusableElements(node.shadowRoot, cache);
      continue;
    }

    if (node.tagName === 'SLOT') {
      const { elements, parent } = getSlottedElements(node);

      // The slotted elements share a parent, so walk it once.
      if (parent) {
        yield* getFocusableElements(parent, cache);
      }

      for (const element of elements) {
        cache.add(element);
      }
      continue;
    }

    if (isFocusable(node)) {
      yield node;
    }
  }
}
