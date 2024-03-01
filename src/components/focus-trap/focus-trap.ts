import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { registerComponent } from '../common/definitions/register.js';

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
    registerComponent(this);
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
   * Whether focus in currently inside the trap component.
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

    this.addEventListener('focusin', () => (this._focused = true));
    this.addEventListener('focusout', () => (this._focused = false));
  }

  protected focusFirstElement() {
    this.focusableElements.at(0)?.focus();
  }

  protected focusLastElement() {
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

/** Returns whether the element is hidden. */
function isHidden(node: HTMLElement) {
  return (
    node.hasAttribute('hidden') ||
    node.hasAttribute('inert') ||
    (node.hasAttribute('aria-hidden') &&
      node.getAttribute('aria-hidden') !== 'false')
  );
}

/** Returns whether the element is disabled. */
function isDisabled(node: HTMLElement) {
  return node.hasAttribute('disabled') || node.hasAttribute('inert');
}

/**
 * Returns whether the element can be focused.
 */
function isFocusable(node: HTMLElement) {
  if (node.tabIndex === -1 || isHidden(node) || isDisabled(node)) {
    return false;
  }

  return defaultSelectors.some((selector) => node.matches(selector));
}

/**
 * Filter function for the tree walker instance skipping over nodes and their children
 * if the `node` is hidden/disabled or it was already visited and resides in `cache`.
 */
function shouldSkipElements(node: Node, cache?: WeakSet<HTMLElement>) {
  const element = node as HTMLElement;

  return isHidden(element) || isDisabled(element) || cache?.has(element)
    ? NodeFilter.FILTER_REJECT
    : NodeFilter.FILTER_ACCEPT;
}

/** Returns the slotted elements and the parent element containing the slot */
function getSlottedElements(node: HTMLElement) {
  const slot = node as HTMLSlotElement;
  const elements = slot.assignedElements() as HTMLElement[];
  return { elements, parent: elements.at(0)?.parentElement };
}

/**
 * Traverses and yields all focusable elements starting at `root`.
 */
function* getFocusableElements<T extends HTMLElement>(
  root: HTMLElement | ShadowRoot,
  cache?: WeakSet<HTMLElement>
): Generator<T> {
  let node: T;
  cache = cache ?? new WeakSet<HTMLElement>();

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

      if (elements.length > 0) {
        for (const element of elements) {
          yield* getFocusableElements(parent!, cache);
          cache.add(element);
        }
      }
      continue;
    }

    if (isFocusable(node)) {
      yield node;
    }
  }
}
