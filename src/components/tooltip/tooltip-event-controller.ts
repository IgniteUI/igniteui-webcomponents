import type { ReactiveController } from 'lit';
import { getElementByIdFromRoot } from '../common/util.js';
import service from './tooltip-service.js';
import type IgcTooltipComponent from './tooltip.js';

type TooltipAnchor = Element | null | undefined;

type TooltipCallbacks = {
  onShow: (event?: Event) => unknown;
  onHide: (event?: Event) => unknown;
  onEscape: (event?: Event) => unknown;
};

class TooltipController implements ReactiveController {
  private readonly _host: IgcTooltipComponent;
  private _anchor: TooltipAnchor;
  private _isTransientAnchor = false;

  private _options!: TooltipCallbacks;
  private _showTriggers = new Set(['pointerenter']);
  private _hideTriggers = new Set(['pointerleave', 'click']);

  private _open = false;

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
      this._removeTooltipListeners();
      service.remove(this._host);

      if (this._isTransientAnchor) {
        this._dispose();
        this._isTransientAnchor = false;
      }
    }
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
  public setAnchor(value: TooltipAnchor, transient = false): void {
    if (this._anchor === value) return;

    this._dispose();
    this._anchor = value;
    this._isTransientAnchor = transient;

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

  public resolveAnchor(value: Element | string | undefined): void {
    const resolvedAnchor =
      typeof value === 'string'
        ? getElementByIdFromRoot(this._host, value)
        : (value ?? null);

    this.setAnchor(resolvedAnchor);
  }

  private _addTooltipListeners(): void {
    this._host.addEventListener('pointerenter', this, { passive: true });
    this._host.addEventListener('pointerleave', this, { passive: true });
  }

  private _removeTooltipListeners(): void {
    this._host.removeEventListener('pointerenter', this);
    this._host.removeEventListener('pointerleave', this);
  }

  private _toggleTriggers(previous: Set<string>, current: Set<string>): void {
    for (const each of previous) {
      this._anchor?.removeEventListener(each, this);
    }

    for (const each of current) {
      this._anchor?.addEventListener(each, this, { passive: true });
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
    const attr = this._host.getAttribute('anchor');
    if (attr) {
      this.resolveAnchor(attr);
    }
  }

  /** @internal */
  public hostDisconnected(): void {
    this._dispose();
    this._removeTooltipListeners();
    service.remove(this._host);
  }

  /** @internal */
  public handleEvent(event: Event): void {
    // Tooltip handlers
    if (event.target === this._host) {
      switch (event.type) {
        case 'pointerenter':
          this._options.onShow.call(this._host);
          break;
        case 'pointerleave':
          this._options.onHide.call(this._host);
          break;
        default:
          return;
      }
    }

    // Anchor handlers
    if (event.target === this._anchor) {
      if (this._showTriggers.has(event.type)) {
        this._options.onShow.call(this._host);
      }

      if (this._hideTriggers.has(event.type)) {
        this._options.onHide.call(this._host);
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
