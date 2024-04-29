import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { iterNodes } from '../util.js';
import type { UnpackCustomEvent } from './event-emitter.js';

interface IgcBaseComboBoxEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

export abstract class IgcBaseComboBoxLikeComponent extends LitElement {
  public declare emitEvent: <
    K extends keyof IgcBaseComboBoxEventMap,
    D extends UnpackCustomEvent<IgcBaseComboBoxEventMap[K]>,
  >(
    event: K,
    eventInitDict?: CustomEventInit<D>
  ) => boolean;

  /**
   * Whether the component dropdown should be kept open on selection.
   * @attr keep-open-on-select
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open-on-select' })
  public keepOpenOnSelect = false;

  /**
   * Whether the component dropdown should be kept open on clicking outside of it.
   * @attr keep-open-on-outside-click
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'keep-open-on-outside-click',
  })
  public keepOpenOnOutsideClick = false;

  /**
   * Sets the open state of the component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  protected emitClosing() {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected emitClosed() {
    return this.emitEvent('igcClosed');
  }

  protected emitOpening() {
    return this.emitEvent('igcOpening', { cancelable: true });
  }

  protected emitOpened() {
    return this.emitEvent('igcOpened');
  }

  protected handleAnchorClick() {
    this.open ? this._hide(true) : this._show(true);
  }

  protected async _hide(emitEvent = false) {
    if (!this.open || (emitEvent && !this.emitClosing())) {
      return false;
    }

    this.open = false;

    if (emitEvent) {
      await this.updateComplete;
      return this.emitClosed();
    }

    return false;
  }

  protected async _show(emitEvent = false) {
    if (this.open || (emitEvent && !this.emitOpening())) {
      return false;
    }

    this.open = true;

    if (emitEvent) {
      await this.updateComplete;
      return this.emitOpened();
    }

    return false;
  }

  /** Shows the component. */
  public show() {
    this._show();
  }

  /** Hides the component. */
  public hide() {
    this._hide();
  }

  /** Toggles the open state of the component. */
  public toggle() {
    this.open ? this.hide() : this.show();
  }
}

export function getItems<T extends HTMLElement>(root: Node, tagName: string) {
  return iterNodes<T>(root, 'SHOW_ELEMENT', (item) => item.matches(tagName));
}

export function getActiveItems<T extends HTMLElement & { disabled: boolean }>(
  root: Node,
  tagName: string
) {
  return iterNodes<T>(
    root,
    'SHOW_ELEMENT',
    (item) => item.matches(tagName) && !item.disabled
  );
}

export function getNextActiveItem<
  T extends HTMLElement & { disabled: boolean },
>(items: T[], from: T) {
  const current = items.indexOf(from);

  for (let i = current + 1; i < items.length; i++) {
    if (!items[i].disabled) {
      return items[i];
    }
  }

  return items[current];
}

export function getPreviousActiveItem<
  T extends HTMLElement & { disabled: boolean },
>(items: T[], from: T) {
  const current = items.indexOf(from);

  for (let i = current - 1; i >= 0; i--) {
    if (!items[i].disabled) {
      return items[i];
    }
  }

  return items[current];
}

export function setInitialSelectionState<
  T extends HTMLElement & { selected: boolean },
>(items: T[]) {
  const lastSelected = items.filter((item) => item.selected).at(-1) ?? null;

  for (const item of items) {
    if (item !== lastSelected) {
      item.selected = false;
    }
  }

  return lastSelected;
}
