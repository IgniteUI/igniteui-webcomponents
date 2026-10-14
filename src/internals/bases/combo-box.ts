import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import type { PopoverScrollStrategy } from '../../components/types.js';
import {
  addRootClickController,
  type RootClickController,
} from '../controllers/root-click.js';
import {
  addToggleController,
  type ToggleEventMap,
} from '../controllers/toggle.js';

import type { UnpackCustomEvent } from '../mixins/event-emitter.js';
import { iterNodes } from '../utils/dom.js';

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

  protected readonly _rootClickController: RootClickController =
    addRootClickController(this, { onHide: this._handleClosing });
  private readonly _toggleController = addToggleController(this);

  /**
   * Sets the open state of the component.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   * @attr scroll-strategy
   * @default hide
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: PopoverScrollStrategy = 'hide';

  protected override willUpdate(props: PropertyValues): void {
    super.willUpdate(props);

    // `keepOpenOnOutsideClick` belongs to `IgcComboBoxBaseLikeComponent`.
    if (props.has('open') || props.has('keepOpenOnOutsideClick')) {
      this._rootClickController.update();
    }
  }

  protected _handleAnchorClick(): void {
    this.open ? this._hide(true) : this._show(true);
  }

  protected _handleClosing(): void {
    this._hide(true);
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
export class IgcComboBoxBaseLikeComponent extends IgcBaseComboBoxComponent {
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

export function setInitialSelectionState<
  T extends HTMLElement & { selected: boolean },
>(items: T[]): T | null {
  const lastSelected = items.findLast((item) => item.selected) ?? null;

  for (const item of items) {
    item.selected = item === lastSelected;
  }

  return lastSelected;
}
