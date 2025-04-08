import type { ReactiveController } from 'lit';
import service from './tooltip-service.js';
import type IgcTooltipComponent from './tooltip.js';

type TooltipAnchor = Element | null | undefined;

type TooltipCallbacks = {
  onShow: (event?: Event) => unknown;
  onHide: (event?: Event) => unknown;
};

class TooltipController implements ReactiveController {
  private readonly _host: IgcTooltipComponent;
  private _anchor: TooltipAnchor;

  private _options!: TooltipCallbacks;
  private _showTriggers = new Set(['pointerenter']);
  private _hideTriggers = new Set(['pointerleave']);

  private _open = false;

  /** Whether the tooltip is in shown state. */
  public get open(): boolean {
    return this._open;
  }

  /** Sets the shown state of the current tooltip. */
  public set open(value: boolean) {
    this._open = value;
    this._open
      ? service.add(this._host, this._options.onHide)
      : service.remove(this._host);
  }

  /**
   * Returns the current tooltip anchor target if any.
   */
  public get anchor(): TooltipAnchor {
    return this._anchor;
  }

  /**
   * Removes all triggers from the previous `anchor` target and rebinds the current
   * sets back to the new value if it exists.
   */
  public set anchor(value: TooltipAnchor) {
    this._dispose();
    this._anchor = value;

    for (const each of this._showTriggers) {
      this._anchor?.addEventListener(each, this);
    }

    for (const each of this._hideTriggers) {
      this._anchor?.addEventListener(each, this);
    }
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
    const triggers = parseTriggers(value);

    if (this._anchor) {
      this._toggleTriggers(this._hideTriggers, triggers);
    }

    this._hideTriggers = triggers;
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
    const triggers = parseTriggers(value);

    if (this._anchor) {
      this._toggleTriggers(this._showTriggers, triggers);
    }

    this._showTriggers = triggers;
  }

  constructor(tooltip: IgcTooltipComponent, options: TooltipCallbacks) {
    this._host = tooltip;
    this._options = options;
    this._host.addController(this);
  }

  private _toggleTriggers(previous: Set<string>, current: Set<string>): void {
    for (const each of previous) {
      this._anchor?.removeEventListener(each, this);
    }

    for (const each of current) {
      this._anchor?.addEventListener(each, this);
    }
  }

  private _dispose(): void {
    for (const each of this._showTriggers) {
      this._anchor?.removeEventListener(each, this);
    }

    for (const each of this._hideTriggers) {
      this._anchor?.removeEventListener(each, this);
    }

    this._anchor = null;
  }

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('pointerenter', this);
    this._host.addEventListener('pointerleave', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._dispose();
    service.remove(this._host);
    this._host.removeEventListener('pointerenter', this);
    this._host.removeEventListener('pointerleave', this);
  }

  /** @internal */
  public handleEvent(event: Event): void {
    // Tooltip handlers
    if (event.target === this._host) {
      switch (event.type) {
        case 'pointerenter':
          this._options.onShow.call(this._host, event);
          break;
        case 'pointerleave':
          this._options.onHide.call(this._host, event);
          break;
        default:
          return;
      }
    }

    // Anchor handlers
    if (event.target === this._anchor) {
      if (this._showTriggers.has(event.type)) {
        this._options.onShow.call(this._host, event);
      }

      if (this._hideTriggers.has(event.type)) {
        this._options.onHide.call(this._host, event);
      }
    }
  }
}

function parseTriggers(string: string): Set<string> {
  return new Set((string ?? '').split(',').map((part) => part.trim()));
}

export function addTooltipController(
  host: IgcTooltipComponent,
  options: TooltipCallbacks
): TooltipController {
  return new TooltipController(host, options);
}
