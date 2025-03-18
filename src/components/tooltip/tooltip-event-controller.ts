import type { ReactiveController } from 'lit';
import type IgcTooltipComponent from './tooltip.js';

type TooltipAnchor = Element | null | undefined;
type TooltipTriggers = {
  show: string[];
  hide: string[];
};

class TooltipController implements ReactiveController {
  private readonly _host: IgcTooltipComponent;
  private _showTriggers: string[] = [];
  private _hideTriggers: string[] = [];

  constructor(host: IgcTooltipComponent) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Sets the current collections of show/hide triggers on the given anchor for the tooltip.
   * Removes any previously set triggers.
   */
  public set(anchor: TooltipAnchor, triggers: TooltipTriggers) {
    if (!anchor) {
      return;
    }

    const { show, hide } = triggers;
    this._showTriggers = show;
    this._hideTriggers = hide;

    this.remove(anchor);

    for (const trigger of show) {
      anchor.addEventListener(trigger, this._host.show);
    }

    for (const trigger of hide) {
      anchor.addEventListener(trigger, this._host[hideOnTrigger]);
    }
  }

  /** Removes all tooltip trigger events from the given anchor */
  public remove(anchor?: TooltipAnchor) {
    if (!anchor) {
      return;
    }

    for (const trigger of this._showTriggers) {
      anchor.removeEventListener(trigger, this._host.show);
    }

    for (const trigger of this._hideTriggers) {
      anchor.removeEventListener(trigger, this._host[hideOnTrigger]);
    }
  }

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('pointerenter', this._host.show);
    this._host.addEventListener('pointerleave', this._host[hideOnTrigger]);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.removeEventListener('pointerenter', this._host.show);
    this._host.removeEventListener('pointerleave', this._host[hideOnTrigger]);
  }
}

export const hideOnTrigger = Symbol();

export function addTooltipController(
  host: IgcTooltipComponent
): TooltipController {
  return new TooltipController(host);
}
