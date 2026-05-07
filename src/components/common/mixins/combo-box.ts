import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { RootClickController } from '../controllers/root-click.js';
import { iterNodes, last } from '../util.js';
import type { UnpackCustomEvent } from './event-emitter.js';

interface IgcBaseComboBoxEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/* blazorIndirectRender */
export abstract class IgcBaseComboBoxComponent extends LitElement {
  declare public emitEvent: <
    K extends keyof IgcBaseComboBoxEventMap,
    D extends UnpackCustomEvent<IgcBaseComboBoxEventMap[K]>,
  >(
    event: K,
    eventInitDict?: CustomEventInit<D>
  ) => boolean;

  protected abstract _rootClickController: RootClickController;

  /**
   * Sets the open state of the component.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  protected _emitClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected _emitClosed(): boolean {
    return this.emitEvent('igcClosed');
  }

  protected _emitOpening(): boolean {
    return this.emitEvent('igcOpening', { cancelable: true });
  }

  protected _emitOpened(): boolean {
    return this.emitEvent('igcOpened');
  }

  protected _handleAnchorClick(): void {
    this.open ? this._hide(true) : this._show(true);
  }

  protected async _hide(emitEvent = false): Promise<boolean> {
    if (!this.open || (emitEvent && !this._emitClosing())) {
      return false;
    }

    this.open = false;

    if (emitEvent) {
      await this.updateComplete;
      this._emitClosed();
    }

    return true;
  }

  protected async _show(emitEvent = false): Promise<boolean> {
    if (this.open || (emitEvent && !this._emitOpening())) {
      return false;
    }

    this.open = true;

    if (emitEvent) {
      await this.updateComplete;
      this._emitOpened();
    }

    return true;
  }

  /** Shows the component. */
  public async show(): Promise<boolean> {
    return this._show();
  }

  /** Hides the component. */
  public async hide(): Promise<boolean> {
    return this._hide();
  }

  /** Toggles the open state of the component. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}

/* blazorIndirectRender */
export abstract class IgcComboBoxBaseLikeComponent extends IgcBaseComboBoxComponent {
  /**
   * Whether the component dropdown should be kept open on selection.
   * @attr keep-open-on-select
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open-on-select' })
  public keepOpenOnSelect = false;

  /**
   * Whether the component dropdown should be kept open on clicking outside of it.
   * @attr keep-open-on-outside-click
   * @default false
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'keep-open-on-outside-click',
  })
  public keepOpenOnOutsideClick = false;
}

export function getItems<T extends HTMLElement>(
  root: Node,
  tagName: string
): Generator<T> {
  return iterNodes<T>(root, {
    show: 'SHOW_ELEMENT',
    filter: (item) => item.matches(tagName),
  });
}

export function getActiveItems<T extends HTMLElement & { disabled: boolean }>(
  root: Node,
  tagName: string
): Generator<T> {
  return iterNodes<T>(root, {
    show: 'SHOW_ELEMENT',
    filter: (item) => item.matches(tagName) && !item.disabled,
  });
}

export function getNextActiveItem<
  T extends HTMLElement & { disabled: boolean },
>(items: T[], from: T): T {
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
>(items: T[], from: T): T {
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
>(items: T[]): T | null {
  const lastSelected = last(items.filter((item) => item.selected));

  for (const item of items) {
    item.selected = item === lastSelected;
  }

  return lastSelected ?? null;
}
