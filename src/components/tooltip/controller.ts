import type { ReactiveController } from 'lit';
import { createAbortHandle } from '../common/abort-handler.js';
import {
  addWeakEventListener,
  getElementByIdFromRoot,
  isString,
} from '../common/util.js';
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

  private _showTriggers = new Set(['pointerenter']);
  private _hideTriggers = new Set(['pointerleave', 'click']);

  private _anchor: WeakRef<Element> | null = null;
  private _initialAnchor: WeakRef<Element> | null = null;

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
    return this._isTransient
      ? this._anchor?.deref()
      : this._initialAnchor?.deref();
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
  }

  private _addTooltipListeners(): void {
    const { signal } = this._hostAbortHandle;

    for (const event of TooltipController._listeners) {
      this._host.addEventListener(event, this, { passive: true, signal });
    }
  }

  //#endregion

  //#region Event handlers

  private async _handleTooltipEvent(event: Event): Promise<void> {
    switch (event.type) {
      case 'pointerenter':
        await this._options.onShow.call(this._host);
        break;
      case 'pointerleave':
        await this._options.onHide.call(this._host);
        break;
      default:
        return;
    }
  }

  private async _handleAnchorEvent(event: Event): Promise<void> {
    if (!this._open && this._showTriggers.has(event.type)) {
      await this._options.onShow.call(this._host);
    }

    if (this._open && this._hideTriggers.has(event.type)) {
      await this._options.onHide.call(this._host);
    }
  }

  /** @internal */
  public handleEvent(event: Event): void {
    if (event.target === this._host) {
      this._handleTooltipEvent(event);
    } else if (event.target === this._anchor?.deref()) {
      this._handleAnchorEvent(event);
    } else if (event.target === this._initialAnchor?.deref()) {
      this.open = false;
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

    // Tooltip `show()` method called with a target. Set to hidden state.
    if (transient && this._open) {
      this.open = false;
    }

    if (this._anchor?.deref() !== this._initialAnchor?.deref()) {
      this._anchorAbortHandle.abort();
    }

    this._anchor = newAnchor ? new WeakRef(newAnchor) : null;
    this._isTransient = transient;
    this._addAnchorListeners();
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

function parseTriggers(string: string): Set<string> {
  return new Set(
    (string ?? '').split(TooltipRegexes.triggers).filter((s) => s.trim())
  );
}

export const TooltipRegexes = Object.freeze({
  /** Used for parsing the strings passed in the tooltip `show/hide-trigger` properties. */
  triggers: /[,\s]+/,

  /** Matches horizontal `PopoverPlacement` start positions. */
  horizontalStart: /^(left|right)-start$/,

  /** Matches horizontal `PopoverPlacement` end positions. */
  horizontalEnd: /^(left|right)-end$/,

  /** Matches vertical `PopoverPlacement` start positions. */
  start: /start$/,

  /** Matches vertical `PopoverPlacement` end positions. */
  end: /end$/,
});

export function addTooltipController(
  host: IgcTooltipComponent,
  options: TooltipCallbacks
): TooltipController {
  return new TooltipController(host, options);
}

type TooltipAnchor = Element | null | undefined;

type TooltipCallbacks = {
  onShow: (event?: Event) => unknown;
  onHide: (event?: Event) => unknown;
  onEscape: (event?: Event) => unknown;
};
