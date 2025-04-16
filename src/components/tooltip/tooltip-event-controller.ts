import type { ReactiveController } from 'lit';
import { getElementByIdFromRoot, isString } from '../common/util.js';
import service from './tooltip-service.js';
import type IgcTooltipComponent from './tooltip.js';

class TooltipController implements ReactiveController {
  //#region Internal properties and state

  private readonly _host: IgcTooltipComponent;
  private readonly _options: TooltipCallbacks;

  private _hostAbortController: AbortController | null = null;
  private _anchorAbortController: AbortController | null = null;

  private _showTriggers = new Set(['pointerenter']);
  private _hideTriggers = new Set(['pointerleave', 'click']);

  private _anchor: TooltipAnchor;
  private _defaultAnchor: TooltipAnchor;
  private _isTransientAnchor = false;
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
      if (this._isTransientAnchor) {
        this._isTransientAnchor = false;
        this.setAnchor(this._defaultAnchor);
      }

      this._removeTooltipListeners();
      service.remove(this._host);
    }
  }

  /**
   * Returns the current tooltip anchor target if any.
   */
  public get anchor(): TooltipAnchor {
    return this._anchor;
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
    this._removeAnchorListeners();
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
    this._removeAnchorListeners();
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
    if (!this._anchor) return;

    this._anchorAbortController = new AbortController();
    const signal = this._anchorAbortController.signal;

    for (const each of this._showTriggers) {
      this._anchor.addEventListener(each, this, { passive: true, signal });
    }

    for (const each of this._hideTriggers) {
      this._anchor.addEventListener(each, this, { passive: true, signal });
    }
  }

  private _removeAnchorListeners(): void {
    this._anchorAbortController?.abort();
    this._anchorAbortController = null;
  }

  private _addTooltipListeners(): void {
    this._hostAbortController = new AbortController();
    const signal = this._hostAbortController.signal;

    this._host.addEventListener('pointerenter', this, {
      passive: true,
      signal,
    });
    this._host.addEventListener('pointerleave', this, {
      passive: true,
      signal,
    });
  }

  private _removeTooltipListeners(): void {
    this._hostAbortController?.abort();
    this._hostAbortController = null;
  }

  //#endregion

  //#region Event handlers

  private _handleTooltipEvent(event: Event): void {
    switch (event.type) {
      case 'pointerenter':
        this._options.onShow.call(this._host);
        break;
      case 'pointerleave':
        this._options.onHide.call(this._host);
    }
  }

  private _handleAnchorEvent(event: Event): void {
    if (!this._open && this._showTriggers.has(event.type)) {
      this._options.onShow.call(this._host);
    }

    if (this._open && this._hideTriggers.has(event.type)) {
      this._options.onHide.call(this._host);
    }
  }

  /** @internal */
  public handleEvent(event: Event): void {
    if (event.target === this._host) {
      this._handleTooltipEvent(event);
    } else if (event.target === this._anchor) {
      this._handleAnchorEvent(event);
    } else if (event.target === this._defaultAnchor) {
      this.open = false;
      this._handleAnchorEvent(event);
    }
  }

  //#endregion

  private _dispose(): void {
    this._removeAnchorListeners();
    this._anchor = null;
  }

  //#region Public API

  /**
   * Removes all triggers from the previous `anchor` target and rebinds the current
   * sets back to the new value if it exists.
   */
  public setAnchor(value: TooltipAnchor, transient = false): void {
    if (this._anchor === value) return;

    if (this._anchor !== this._defaultAnchor) {
      this._removeAnchorListeners();
    }

    this._anchor = value;
    this._isTransientAnchor = transient;
    this._addAnchorListeners();
  }

  public resolveAnchor(value: Element | string | undefined): void {
    const resolvedElement = isString(value)
      ? getElementByIdFromRoot(this._host, value)
      : value;

    this._defaultAnchor = resolvedElement;
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
    this._removeTooltipListeners();
    service.remove(this._host);
  }

  //#endregion
}

function parseTriggers(string: string): Set<string> {
  return new Set((string ?? '').split(/[,\s]+/).filter((s) => s.trim()));
}

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
