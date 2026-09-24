import { isPopoverOpen } from '#internals/utils/dom.js';
import type { PopoverPositionHost } from './types.js';

/**
 * Positions the container of a popover against an anchor.
 *
 * For each open cycle the host calls `attach`, then `show`. The host calls
 * `update` after a property changes, and `hide` to close the container.
 */
export abstract class PopoverPositionStrategy {
  protected readonly _host: PopoverPositionHost;

  /** The strategy calls this callback if the anchor leaves the DOM. */
  protected readonly _onAnchorRemoved: () => void;

  protected _target?: Element;
  protected _container?: HTMLElement;

  constructor(host: PopoverPositionHost, onAnchorRemoved: () => void) {
    this._host = host;
    this._onAnchorRemoved = onAnchorRemoved;
  }

  /** Starts to position the `container` against the `target`. */
  public attach(target: Element, container: HTMLElement): void {
    this.detach();
    this._target = target;
    this._container = container;
  }

  /**
   * Resolves when the strategy positioned the container.
   *
   * A synchronous strategy needs no wait. The host awaits this promise in
   * `getUpdateComplete`.
   */
  public whenPositioned(): Promise<unknown> {
    return Promise.resolve();
  }

  /** Shows the container in the top layer. */
  public abstract show(): void;

  /** Hides the container. */
  public hide(): void {
    if (this._container && isPopoverOpen(this._container)) {
      this._container.hidePopover();
    }
  }

  /** Positions the container again after a property of the host changes. */
  public abstract update(): void;

  /** Stops all observers, listeners and pending updates of the strategy. */
  public abstract detach(): void;

  /**
   * Removes the styles and the attributes of this strategy from the
   * container. The host calls it when it changes the strategy.
   */
  public abstract clear(): void;
}
