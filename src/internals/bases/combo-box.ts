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
export class IgcBaseComboBoxComponent extends LitElement {
  /* blazorSuppress */
  /** @hidden @internal */
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
   * Whether the component is open.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * The behavior of the component when a parent container scrolls.
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

  /**
   * Opens the component. It does not emit events. The promise resolves to
   * `false` when the component is already open, or when a later call replaces
   * this one.
   */
  public async show(): Promise<boolean> {
    return this._show();
  }

  /**
   * Closes the component. It does not emit events. The promise resolves to
   * `false` when the component is already closed, or when a later call
   * replaces this one.
   */
  public async hide(): Promise<boolean> {
    return this._hide();
  }

  /**
   * Opens the component when it is closed, and closes it when it is open. It
   * does not emit events. The promise resolves to `true` when the state
   * changes.
   */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }
}

/* blazorIndirectRender */
/* omitModule */
export class IgcComboBoxBaseLikeComponent extends IgcBaseComboBoxComponent {
  /**
   * Whether the component stays open after the user selects an item.
   * @attr keep-open-on-select
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'keep-open-on-select' })
  public keepOpenOnSelect = false;

  /**
   * Whether the component stays open when the user clicks outside of it.
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
