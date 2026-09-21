import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { RootClickController } from '../controllers/root-click.js';
import {
  addToggleController,
  type ToggleEventMap,
} from '../controllers/toggle.js';

import { iterNodes } from '../utils/dom.js';
import type { UnpackCustomEvent } from './event-emitter.js';

/* blazorIndirectRender */
/* omitModule */
export abstract class IgcBaseComboBoxComponent extends LitElement {
  /* blazorSuppress */
  declare public emitEvent: <
    K extends keyof ToggleEventMap,
    D extends UnpackCustomEvent<ToggleEventMap[K]>,
  >(
    event: K,
    eventInitDict?: CustomEventInit<D>
  ) => boolean;

  protected abstract _rootClickController: RootClickController;
  private readonly _toggleController = addToggleController(this);

  /**
   * Sets the open state of the component.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  protected _handleAnchorClick(): void {
    this.open ? this._hide(true) : this._show(true);
  }

  protected _hide(emitEvent = false): Promise<boolean> {
    return this._toggleController.hide(emitEvent);
  }

  protected _show(emitEvent = false): Promise<boolean> {
    return this._toggleController.show(emitEvent);
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
/* omitModule */
export abstract class IgcComboBoxBaseLikeComponent extends IgcBaseComboBoxComponent {
  /**
   * Keeps the dropdown of the component open after the user selects an item.
   * @attr keep-open-on-select
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open-on-select' })
  public keepOpenOnSelect = false;

  /**
   * Keeps the dropdown of the component open when the user clicks outside of
   * it.
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

/** Returns the elements of `root` matching `tagName` and `predicate`. */
export function getItems<T extends HTMLElement>(
  root: Node,
  tagName: string,
  predicate?: (item: T) => boolean
): Generator<T> {
  return iterNodes<T>(root, {
    show: 'SHOW_ELEMENT',
    filter: (item) =>
      item.matches(tagName) && (predicate ? predicate(item) : true),
  });
}

export function getActiveItems<T extends HTMLElement & { disabled: boolean }>(
  root: Node,
  tagName: string
): Generator<T> {
  return getItems<T>(root, tagName, (item) => !item.disabled);
}

/**
 * Returns the closest non-disabled item to `from` in the given direction. A
 * missing or detached `from` starts at the edge; falls back to `from`, or
 * `undefined` when there is nothing to navigate to.
 */
function getActiveItemFrom<T extends HTMLElement & { disabled: boolean }>(
  items: T[],
  from: T | null | undefined,
  step: -1 | 1
): T | undefined {
  const index = from ? items.indexOf(from) : -1;
  const current = index < 0 ? (step === 1 ? -1 : items.length) : index;

  for (let i = current + step; i >= 0 && i < items.length; i += step) {
    if (!items[i].disabled) {
      return items[i];
    }
  }

  return items[current];
}

/** Returns the first non-disabled item after `from`, else `from` itself. */
export function getNextActiveItem<
  T extends HTMLElement & { disabled: boolean },
>(items: T[], from?: T | null): T | undefined {
  return getActiveItemFrom(items, from, 1);
}

/** Returns the first non-disabled item before `from`, else `from` itself. */
export function getPreviousActiveItem<
  T extends HTMLElement & { disabled: boolean },
>(items: T[], from?: T | null): T | undefined {
  return getActiveItemFrom(items, from, -1);
}

export function setInitialSelectionState<
  T extends HTMLElement & { selected: boolean },
>(items: T[]): T | null {
  const lastSelected = items.findLast((item) => item.selected) ?? null;

  for (const item of items) {
    item.selected = item === lastSelected;
  }

  return lastSelected;
}
