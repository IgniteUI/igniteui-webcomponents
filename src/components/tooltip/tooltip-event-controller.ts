import type { ReactiveController } from 'lit';
import type IgcTooltipComponent from './tooltip.js';

type TooltipAnchor = Element | null | undefined;
type TooltipTriggers = {
  show: string[];
  hide: string[];
};

class TooltipController implements ReactiveController {
  private readonly _tooltip: IgcTooltipComponent;
  private _showTriggers: string[] = [];
  private _hideTriggers: string[] = [];

  constructor(tooltip: IgcTooltipComponent) {
    this._tooltip = tooltip;
    this._tooltip.addController(this);
  }

  /**
   * Sets the current collections of show/hide triggers on the given anchor for the tooltip.
   * Removes any previously set triggers.
   */
  public set(anchor: TooltipAnchor, triggers: TooltipTriggers): void {
    if (!anchor) {
      return;
    }

    const { show, hide } = triggers;
    this._showTriggers = show;
    this._hideTriggers = hide;

    this.remove(anchor);

    for (const trigger of show) {
      anchor.addEventListener(trigger, this._tooltip[showOnTrigger]);
    }

    for (const trigger of hide) {
      anchor.addEventListener(trigger, this._tooltip[hideOnTrigger]);
    }
  }

  /** Removes all tooltip trigger events from the given anchor */
  public remove(anchor?: TooltipAnchor): void {
    if (!anchor) {
      return;
    }

    for (const trigger of this._showTriggers) {
      anchor.removeEventListener(trigger, this._tooltip[showOnTrigger]);
    }

    for (const trigger of this._hideTriggers) {
      anchor.removeEventListener(trigger, this._tooltip[hideOnTrigger]);
    }
  }

  /** @internal */
  public hostConnected(): void {
    this._tooltip.addEventListener(
      'pointerenter',
      this._tooltip[showOnTrigger]
    );
    this._tooltip.addEventListener(
      'pointerleave',
      this._tooltip[hideOnTrigger]
    );
  }

  /** @internal */
  public hostDisconnected(): void {
    this._tooltip.removeEventListener(
      'pointerenter',
      this._tooltip[showOnTrigger]
    );
    this._tooltip.removeEventListener(
      'pointerleave',
      this._tooltip[hideOnTrigger]
    );
  }
}

export const showOnTrigger = Symbol();
export const hideOnTrigger = Symbol();

export function addTooltipController(
  host: IgcTooltipComponent
): TooltipController {
  return new TooltipController(host);
}
