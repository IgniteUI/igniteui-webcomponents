import type { ReactiveController } from 'lit';
import { createAbortHandle } from '#internals/abort-handler.js';
import {
  getElementByIdFromRoot,
  setOrRemoveAttribute,
} from '#internals/utils/dom.js';
import { addWeakEventListener } from '#internals/utils/events.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
import type { PopoverRect } from '../popover/position/types.js';
import service from './service.js';
import type IgcTooltipComponent from './tooltip.js';

class TooltipController implements ReactiveController {
  //#region Internal properties and state

  private static readonly _listeners = [
    'pointerenter',
    'pointerleave',
  ] as const;

  private readonly _host: IgcTooltipComponent;
  private readonly _options: TooltipCallbacks;

  private readonly _hostAbortHandle = createAbortHandle();
  private readonly _initialAbortHandle = createAbortHandle();
  private readonly _transientAbortHandle = createAbortHandle();

  private _showTriggers = new Set(['pointerenter', 'focusin']);
  private _hideTriggers = new Set(['pointerleave', 'click', 'focusout']);

  private _anchor: WeakRef<Element> | null = null;
  private _initialAnchor: WeakRef<Element> | null = null;

  /** The element currently describing itself with this tooltip. */
  private _describedElement: WeakRef<Element> | null = null;

  /**
   * The rectangle of `showAt()`. It replaces the anchor until the tooltip
   * closes.
   */
  private _rect: PopoverRect | null = null;

  private _isTransient = false;
  private _open = false;

  //#endregion

  //#region Public properties

  public get open(): boolean {
    return this._open;
  }

  public set open(value: boolean) {
    if (value === this._open) {
      return;
    }

    this._open = value;

    if (!value && this._isTransient) {
      this._isTransient = false;
      this.setAnchor(this._initialAnchor?.deref());
    }

    this._syncOpenListeners();
  }

  public get anchor(): TooltipAnchor {
    return this._anchor?.deref();
  }

  public get rect(): PopoverRect | null {
    return this._rect;
  }

  /** The hide triggers as a comma-separated string. */
  public get hideTriggers(): string {
    return Array.from(this._hideTriggers).join();
  }

  public set hideTriggers(value: string) {
    this._hideTriggers = parseTriggers(value);
    this._bindAnchors();
  }

  /** The show triggers as a comma-separated string. */
  public get showTriggers(): string {
    return Array.from(this._showTriggers).join();
  }

  public set showTriggers(value: string) {
    this._showTriggers = parseTriggers(value);
    this._bindAnchors();
  }

  //#endregion

  constructor(tooltip: IgcTooltipComponent, options: TooltipCallbacks) {
    this._host = tooltip;
    this._options = options;
    this._host.addController(this);
  }

  //#region Internal event listeners state

  /** Binds one listener for each trigger event, and one for `click`. */
  private _bindTriggers(anchor: TooltipAnchor, signal: AbortSignal): void {
    if (!anchor) {
      return;
    }

    const events = new Set([
      ...this._showTriggers,
      ...this._hideTriggers,
      'click',
    ]);

    for (const event of events) {
      addWeakEventListener(anchor, event, this, { passive: true, signal });
    }
  }

  /**
   * The configured anchor keeps its triggers while a transient anchor shows,
   * so an interaction with it drops the transient one. A rectangle has no
   * triggers, so it unbinds them.
   */
  private _bindInitialAnchor(): void {
    this._initialAbortHandle.abort();

    if (!this._rect) {
      this._bindTriggers(
        this._initialAnchor?.deref(),
        this._initialAbortHandle.signal
      );
    }
  }

  private _bindTransientAnchor(): void {
    this._transientAbortHandle.abort();

    if (this.anchor !== this._initialAnchor?.deref()) {
      this._bindTriggers(this.anchor, this._transientAbortHandle.signal);
    }
  }

  private _bindAnchors(): void {
    this._bindInitialAnchor();
    this._bindTransientAnchor();
  }

  /**
   * Binds the Escape key while the tooltip is open, and the pointer on the
   * tooltip unless it shows at a rectangle.
   */
  private _syncOpenListeners(): void {
    this._hostAbortHandle.abort();

    // A removed tooltip can still open, at the end of its show animation.
    // `hostConnected` binds the listeners when it connects again.
    if (!(this._open && this._host.isConnected)) {
      service.remove(this._host);
      return;
    }

    if (!this._rect) {
      const { signal } = this._hostAbortHandle;

      for (const event of TooltipController._listeners) {
        this._host.addEventListener(event, this, { passive: true, signal });
      }
    }

    service.add(this._host, this._options.onEscape);
  }

  /**
   * Points the anchor's `aria-describedby` at the tooltip, releasing the
   * previously described element. Tokens already on the anchor are kept.
   */
  private _syncAnchorARIA(): void {
    const anchor = this.anchor;
    const previous = this._describedElement?.deref();

    if (previous === anchor) {
      return;
    }

    if (previous) {
      this._toggleDescribedBy(previous, false);
    }

    this._describedElement = anchor ? new WeakRef(anchor) : null;

    if (anchor) {
      this._toggleDescribedBy(anchor, true);
    }
  }

  private _toggleDescribedBy(element: Element, state: boolean): void {
    const id = (this._host.id ||= nextTooltipId());
    const tokens = new Set(
      (element.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
    );

    state ? tokens.add(id) : tokens.delete(id);

    setOrRemoveAttribute(
      element,
      'aria-describedby',
      tokens.size > 0 ? Array.from(tokens).join(' ') : null
    );
  }

  //#endregion

  //#region Event handlers

  private _handleTooltipEvent(event: Event): void {
    event.type === 'pointerenter'
      ? this._options.onShow()
      : this._options.onHide();
  }

  private _handleAnchorEvent(event: Event): void {
    const isShowTrigger = this._showTriggers.has(event.type);
    const isHideTrigger = this._hideTriggers.has(event.type);

    // Not a configured trigger, so this is the synthetic `click` listener.
    // Clicking the anchor cancels a queued show - see issue #1828.
    if (!(isShowTrigger || isHideTrigger)) {
      this._options.onClick();
      return;
    }

    // The same event drives both directions - toggle on the committed state.
    if (isShowTrigger && isHideTrigger) {
      this._open ? this._options.onHide() : this._options.onShow();
      return;
    }

    // Not gated on the committed state, so a trigger during a transition is
    // not lost. The host ignores a move to the state it already has.
    isShowTrigger ? this._options.onShow() : this._options.onHide();
  }

  /** @internal */
  public handleEvent(event: Event): void {
    // Not `event.target`, which can be a descendant of the anchor.
    const target = event.currentTarget;

    if (target === this._host) {
      this._handleTooltipEvent(event);
    } else if (target === this._anchor?.deref()) {
      this._handleAnchorEvent(event);
    } else if (target === this._initialAnchor?.deref()) {
      // Interacting with the initial anchor drops the transient one.
      this._options.onReset();
      this._handleAnchorEvent(event);
    }
  }

  //#endregion

  private _resolve(value: TooltipAnchor | string): TooltipAnchor | null {
    return isString(value) ? getElementByIdFromRoot(this._host, value) : value;
  }

  //#region Public API

  /** Moves the triggers from the previous anchor to the new one, if any. */
  public setAnchor(value: TooltipAnchor | string, transient = false): void {
    const newAnchor = this._resolve(value);

    if (this._anchor?.deref() === newAnchor && !this._rect) {
      return;
    }

    // `show()` was called with a target while the tooltip is up - close it
    // before it moves to the new anchor.
    if (transient && this._open) {
      this._options.onReset();
    }

    this._anchor = newAnchor ? new WeakRef(newAnchor) : null;
    this._isTransient = transient;

    // Any new anchor, also none, ends a rectangle.
    if (this._rect) {
      this._toggleRect(null);
    }

    this._bindTransientAnchor();
    this._syncAnchorARIA();
  }

  /**
   * Anchors the tooltip to a rectangle until it closes. The first rectangle
   * closes the tooltip and drops the anchor, as `show(target)` does. A later
   * one only moves it.
   */
  public setRect(rect: PopoverRect): void {
    if (!this._rect) {
      this._options.onReset();
      this.setAnchor(null, true);
      this._toggleRect(rect);
    } else if (!isSameRect(this._rect, rect)) {
      this._rect = rect;
      this._host.requestUpdate();
    }
  }

  private _toggleRect(rect: PopoverRect | null): void {
    this._rect = rect;
    this._bindInitialAnchor();
    this._syncOpenListeners();
    this._host.requestUpdate();
  }

  /**
   * Sets the configured anchor. A rectangle stays until the tooltip closes,
   * and the new anchor applies then.
   */
  public resolveAnchor(value: TooltipAnchor | string): void {
    const resolvedElement = this._resolve(value);

    // Both the connect and the first update resolve, for an IDREF that
    // renders late. The same anchor needs no new bindings.
    if ((resolvedElement ?? undefined) === this._initialAnchor?.deref()) {
      return;
    }

    this._initialAnchor = resolvedElement ? new WeakRef(resolvedElement) : null;

    if (!this._rect) {
      this.setAnchor(resolvedElement);
      this._bindAnchors();
    }
  }

  //#endregion

  //#region ReactiveController interface

  /** @internal */
  public hostConnected(): void {
    this.resolveAnchor(this._host.anchor);
    // Binds again the listeners that `hostDisconnected` released.
    this._syncOpenListeners();
  }

  /** @internal */
  public hostDisconnected(): void {
    this._initialAbortHandle.abort();
    this._transientAbortHandle.abort();
    this._hostAbortHandle.abort();
    service.remove(this._host);
    this._anchor = null;
    this._initialAnchor = null;
    this._syncAnchorARIA();
  }

  //#endregion
}

const nextTooltipId = createIdGenerator('igc-tooltip');

const triggersSeparator = /[,\s]+/;

function parseTriggers(value: string): Set<string> {
  // Removing the attribute passes `null` through the property accessor.
  return new Set((value ?? '').split(triggersSeparator).filter(Boolean));
}

function isSameRect(a: PopoverRect, b: PopoverRect): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

export function addTooltipController(
  host: IgcTooltipComponent,
  options: TooltipCallbacks
): TooltipController {
  return new TooltipController(host, options);
}

type TooltipAnchor = Element | null | undefined;

type TooltipCallbacks = {
  /** A show trigger fired, or the pointer entered the tooltip itself. */
  onShow: () => unknown;
  /** A hide trigger fired, or the pointer left the tooltip itself. */
  onHide: () => unknown;
  /** The `Escape` key was pressed while the tooltip is shown. */
  onEscape: () => unknown;
  /** The anchor was clicked with `click` bound to neither trigger set. */
  onClick: () => unknown;
  /** The tooltip must drop the anchor it is currently bound to. */
  onReset: () => unknown;
};
