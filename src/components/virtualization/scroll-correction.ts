import { scrollAndWaitForSettled } from '#internals/utils/scroll-settle.js';

const MAX_CORRECTION_PASSES = 5;
const SCROLL_END_TIMEOUT_MS = 2000;

/** A scrolling host that can report when its layout has settled. */
export interface ScrollCorrectionHost extends EventTarget {
  /** Resolves when the host has settled after a render and its measurements. */
  readonly layoutComplete: Promise<void>;
}

/** How a host applies and reads a scroll position of type `P`. */
export interface ScrollCorrectionConfig<P> {
  /** The current real scroll position. */
  current(): P;
  /** Whether two positions are the same within the host's tolerance. */
  equals(a: P, b: P): boolean;
  /** Scrolls the host to `position`. */
  scroll(position: P, behavior: ScrollBehavior): void;
}

/**
 * Scrolls a virtualized host to a target whose offset depends on item sizes
 * that are only known once the items render.
 *
 * Items outside the rendered window have an estimated size, so the first
 * jump can miss the target. The items at the landing point are then measured
 * and the position is corrected. This repeats until the offset is stable, or
 * until a newer request supersedes the running one.
 *
 * Generic in the position type: one number for a single axis, a pair for a
 * grid. The host provides the reading, comparison and application of a
 * position; the loop, the settle wait and the supersede check live here.
 */
export class ScrollCorrectionController<P> {
  private readonly _host: ScrollCorrectionHost;
  private readonly _config: ScrollCorrectionConfig<P>;
  private _requestId = 0;

  constructor(host: ScrollCorrectionHost, config: ScrollCorrectionConfig<P>) {
    this._host = host;
    this._config = config;
  }

  /**
   * Scrolls to `position` and waits for the scroll, instant or smooth, to
   * settle. A position the host is already at resolves immediately, because
   * no `scrollend` would follow.
   */
  public scrollAndWaitForEnd(
    position: P,
    behavior: ScrollBehavior
  ): Promise<void> {
    const config = this._config;

    if (config.equals(config.current(), position)) {
      return Promise.resolve();
    }

    return scrollAndWaitForSettled(
      this._host,
      () => config.scroll(position, behavior),
      SCROLL_END_TIMEOUT_MS
    );
  }

  /**
   * Scrolls to the position given by `resolve`, then re-resolves and
   * corrects it after each settle until it is stable. `resolve` is called
   * against the host's current size data, so its result improves as more
   * items are measured.
   */
  public async run(resolve: () => P, behavior: ScrollBehavior): Promise<void> {
    // A newer call supersedes a correction loop that still runs for a
    // previous call, for example under rapid, repeated calls.
    const requestId = ++this._requestId;

    let position = resolve();
    await this.scrollAndWaitForEnd(position, behavior);

    for (let i = 0; i < MAX_CORRECTION_PASSES; i++) {
      await this._host.layoutComplete;

      if (requestId !== this._requestId) {
        return;
      }

      const corrected = resolve();
      if (this._config.equals(corrected, position)) {
        break;
      }

      position = corrected;
      await this.scrollAndWaitForEnd(position, 'auto');

      if (requestId !== this._requestId) {
        return;
      }
    }
  }
}
