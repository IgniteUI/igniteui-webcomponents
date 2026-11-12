import { isServer, LitElement, type PropertyValues } from 'lit';
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
import { coercedProperty } from '../decorators/coerced-property.js';
import type { UnpackCustomEvent } from '../mixins/event-emitter.js';
import { isEmpty } from '../utils/arrays.js';
import {
  closestComposed,
  getFocusableElements,
  isElement,
} from '../utils/dom.js';
import { focusTabStop } from '../utils/events.js';

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
  private readonly _toggleController = addToggleController(this, {
    transition: this._toggleTransition,
  });

  /**
   * Whether the component is open.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  @coercedProperty<boolean, IgcBaseComboBoxComponent>({
    onChange: ({ host, value }) => host._toggleController.sync(value),
  })
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

    // The closed popup is inert, so the focus in it would fall to the document.
    if (
      this.hasUpdated &&
      props.has('open') &&
      !this.open &&
      this._popupElement?.()?.matches(':focus-within')
    ) {
      this._returnFocus();
    }
  }

  /** The popup that turns inert on close. A close moves the focus out of it. */
  protected _popupElement?(): Element | null;

  /** Takes the focus from a closing popup. */
  protected _returnFocus(): void {
    this.focus({ preventScroll: true });
  }

  protected _handleAnchorClick(): void {
    this.open ? this._hide(true) : this._show(true);
  }

  protected _handleClosing(): void {
    this._hide(true);
  }

  /** The open and close transition of a subclass. Read once at construction, so declare it as a method. */
  protected _toggleTransition?(
    open: boolean,
    signal: AbortSignal
  ): boolean | Promise<boolean>;

  /** Whether a close runs. */
  protected get _isClosing(): boolean {
    return this._toggleController.closing;
  }

  protected _hide(emitEvent = false, detail?: unknown): Promise<boolean> {
    return this._toggleController.hide(emitEvent, detail);
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

/** Returns the elements of `root` that match `tagName`. */
export function getItems<T extends HTMLElement>(
  root: ParentNode,
  tagName: string
): T[] {
  return isServer ? [] : Array.from(root.querySelectorAll<T>(tagName));
}

/**
 * Whether `event` comes from content of `popup` that is not an item, such as a
 * control in the header or the footer. That content keeps its own keys.
 */
export function isPopupContentEvent(
  event: Event,
  popup: Element | null,
  itemTag: string
): boolean {
  // An item is on the path before the popup that holds it.
  for (const node of event.composedPath()) {
    if (node === popup) {
      return true;
    }
    if (isElement(node) && node.localName === itemTag) {
      return false;
    }
  }

  return false;
}

/**
 * Moves a Tab `event` through `anchor` and the focusable content of an open
 * `popup`, and returns whether the Tab leaves the popup. Without content other
 * than items, only a plain Tab leaves.
 */
export function tabThroughPopup(
  event: KeyboardEvent,
  anchor: HTMLElement | undefined,
  popup: Element | null,
  itemTag: string
): boolean {
  // A control in an item gets the keys of the item, so it is not a stop.
  const content = popup
    ? Iterator.from(getFocusableElements(popup))
        .filter(
          (element) =>
            element.localName === itemTag || !closestComposed(element, itemTag)
        )
        .toArray()
    : [];
  const stops =
    anchor && content.some((element) => element.localName !== itemTag)
      ? [anchor, ...content]
      : [];

  if (focusTabStop(event, stops)) {
    event.preventDefault();
    return false;
  }

  return !(event.shiftKey && isEmpty(stops));
}

/** Keeps the last selected item, and makes it the only active item. */
export function setInitialSelectionState<
  T extends HTMLElement & { selected: boolean; active: boolean },
>(items: T[]): T | null {
  const lastSelected = items.findLast((item) => item.selected) ?? null;

  for (const item of items) {
    item.selected = item === lastSelected;
    item.active = item === lastSelected;
  }

  return lastSelected;
}
