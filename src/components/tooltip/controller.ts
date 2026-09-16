import type { ReactiveController } from 'lit';
import { createAbortHandle } from '#internals/abort-handler.js';
import { getElementByIdFromRoot } from '#internals/utils/dom.js';
import { addWeakEventListener } from '#internals/utils/events.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { isString } from '#internals/utils/types.js';
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
  private readonly _anchorAbortHandle = createAbortHandle();

  private _showTriggers = new Set(['pointerenter', 'focusin']);
  private _hideTriggers = new Set(['pointerleave', 'click', 'focusout']);

  private _anchor: WeakRef<Element> | null = null;
  private _initialAnchor: WeakRef<Element> | null = null;

  /** The element currently describing itself with this tooltip. */
  private _describedElement: WeakRef<Element> | null = null;

  private _isTransient = false;
  private _open = false;

  //#endregion

  //#region Public properties

  /** Whether the tooltip is in shown state. */
  public get open(): boolean {
    return this._open;
  }

  /** Sets the shown state of the current tooltip. */
  public set open(value: boolean) {
    this._open = value;

    if (this._open) {
      this._addTooltipListeners();
      service.add(this._host, this._options.onEscape);
    } else {
      if (this._isTransient) {
        this._isTransient = false;
        this.setAnchor(this._initialAnchor?.deref());
      }

      this._hostAbortHandle.abort();
      service.remove(this._host);
    }
  }

  /**
   * Returns the current tooltip anchor target if any.
   */
  public get anchor(): TooltipAnchor {
    // `setAnchor` keeps this in sync with `_initialAnchor` unless transient.
    return this._anchor?.deref();
  }

  /**
   * Returns the current set of hide triggers as a comma-separated string.
   */
  public get hideTriggers(): string {
    return Array.from(this._hideTriggers).join();
  }

  /**
   * Sets a new set of hide triggers from a comma-separated string.
   *
   * @remarks
   * If the tooltip already has an `anchor` bound it will remove the old
   * set of triggers from it and rebind it with the new one.
   */
  public set hideTriggers(value: string) {
    this._hideTriggers = parseTriggers(value);
    this._anchorAbortHandle.abort();
    this._addAnchorListeners();
  }

  /**
   * Returns the current set of show triggers as a comma-separated string.
   */
  public get showTriggers(): string {
    return Array.from(this._showTriggers).join();
  }

  /**
   * Sets a new set of show triggers from a comma-separated string.
   *
   * @remarks
   * If the tooltip already has an `anchor` bound it will remove the old
   * set of triggers from it and rebind it with the new one.
   */
  public set showTriggers(value: string) {
    this._showTriggers = parseTriggers(value);
    this._anchorAbortHandle.abort();
    this._addAnchorListeners();
  }

  //#endregion

  constructor(tooltip: IgcTooltipComponent, options: TooltipCallbacks) {
    this._host = tooltip;
    this._options = options;
    this._host.addController(this);
  }

  //#region Internal event listeners state

  private _addAnchorListeners(): void {
    const anchor = this.anchor;

    if (!anchor) {
      return;
    }

    const { signal } = this._anchorAbortHandle;

    for (const each of this._showTriggers) {
      addWeakEventListener(anchor, each, this, { passive: true, signal });
    }

    for (const each of this._hideTriggers) {
      addWeakEventListener(anchor, each, this, { passive: true, signal });
    }

    if (!this._showTriggers.has('click') && !this._hideTriggers.has('click')) {
      addWeakEventListener(anchor, 'click', this, { passive: true, signal });
    }
  }

  private _addTooltipListeners(): void {
    const { signal } = this._hostAbortHandle;

    for (const event of TooltipController._listeners) {
      this._host.addEventListener(event, this, { passive: true, signal });
    }
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

    tokens.size > 0
      ? element.setAttribute('aria-describedby', Array.from(tokens).join(' '))
      : element.removeAttribute('aria-describedby');
  }

  //#endregion

  //#region Event handlers

  private _handleTooltipEvent(event: Event): void {
    if (event.type === 'pointerenter') {
      this._options.onShow();
    } else if (event.type === 'pointerleave') {
      this._options.onHide();
    }
  }

  private _handleAnchorEvent(event: Event): void {
    const isShowTrigger = this._showTriggers.has(event.type);
    const isHideTrigger = this._hideTriggers.has(event.type);

    // Not a configured trigger, so this is the synthetic `click` listener.
    // Clicking the anchor cancels a queued show - see issue #1828.
    if (!(isShowTrigger || isHideTrigger)) {
      if (event.type === 'click') {
        this._options.onClick();
      }
      return;
    }

    // The same event drives both directions - toggle on the committed state.
    if (isShowTrigger && isHideTrigger) {
      this._open ? this._options.onHide() : this._options.onShow();
      return;
    }

    // Deliberately not gated on the committed state - that would swallow
    // triggers arriving while a transition is still running. The host is
    // already a no-op when it is heading to the requested state.
    isShowTrigger ? this._options.onShow() : this._options.onHide();
  }

  /** @internal */
  public handleEvent(event: Event): void {
    // The element the listener sits on, not `event.target` - a bubbling
    // trigger such as `click` or `focusin` reports the descendant of the
    // anchor it originated from.
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

  private _dispose(): void {
    this._anchorAbortHandle.abort();
    this._hostAbortHandle.abort();
    service.remove(this._host);
    this._anchor = null;
    this._initialAnchor = null;
    this._syncAnchorARIA();
  }

  //#region Public API

  /**
   * Removes all triggers from the previous `anchor` target and rebinds the current
   * sets back to the new value if it exists.
   */
  public setAnchor(value: TooltipAnchor | string, transient = false): void {
    const newAnchor = isString(value)
      ? getElementByIdFromRoot(this._host, value)
      : value;

    if (this._anchor?.deref() === newAnchor) {
      return;
    }

    // `show()` was called with a target while the tooltip is up - close it
    // before it moves to the new anchor.
    if (transient && this._open) {
      this._options.onReset();
    }

    if (this._anchor?.deref() !== this._initialAnchor?.deref()) {
      this._anchorAbortHandle.abort();
    }

    this._anchor = newAnchor ? new WeakRef(newAnchor) : null;
    this._isTransient = transient;
    this._addAnchorListeners();
    this._syncAnchorARIA();
  }

  public resolveAnchor(value: TooltipAnchor | string): void {
    const resolvedElement = isString(value)
      ? getElementByIdFromRoot(this._host, value)
      : value;

    this._initialAnchor = resolvedElement ? new WeakRef(resolvedElement) : null;
    this.setAnchor(resolvedElement);
  }

  //#endregion

  //#region ReactiveController interface

  /** @internal */
  public hostConnected(): void {
    this.resolveAnchor(this._host.anchor);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._dispose();
  }

  //#endregion
}

const nextTooltipId = createIdGenerator('igc-tooltip');

/** Splits the strings passed to the `show/hide-triggers` properties. */
const triggersSeparator = /[,\s]+/;

function parseTriggers(value: string): Set<string> {
  // Removing the attribute passes `null` through the property accessor.
  return new Set(
    (value ?? '').split(triggersSeparator).filter((trigger) => trigger.trim())
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
