import type { ReactiveElement } from 'lit';
import { nextAnimationFrame } from '../timing.js';

/**
 * Upper limit on follow-up render passes. A host whose measurements never
 * converge, for example one whose items change size on every render, would
 * otherwise keep the promise pending.
 */
const MAX_PASSES = 20;

/**
 * Upper limit on one animation frame wait. A hidden tab or a disconnected
 * host gets no frames, and the promise must still settle.
 */
const FRAME_TIMEOUT_MS = 100;

/**
 * Tracks when a host whose renders trigger DOM measurements, which in turn
 * schedule more renders, has reached a stable DOM.
 *
 * `updateComplete` covers one Lit render pass. This covers the follow-up
 * passes as well: after each update it yields one animation frame so that
 * observers, for example a ResizeObserver, can deliver, and it repeats while
 * the host has an update pending.
 */
class LayoutSettleController {
  private readonly _host: ReactiveElement;
  private _promise: Promise<void> | null = null;

  constructor(host: ReactiveElement) {
    this._host = host;
  }

  /**
   * Resolves when the host has settled. Concurrent readers share one run;
   * a read after the run has settled starts a new one.
   */
  public get complete(): Promise<void> {
    if (!this._promise) {
      this._promise = this._settle();
    }
    return this._promise;
  }

  private async _settle(): Promise<void> {
    try {
      await this._host.updateComplete;

      for (let i = 0; i < MAX_PASSES; i++) {
        await nextAnimationFrame(FRAME_TIMEOUT_MS);

        if (!this._host.isUpdatePending) {
          break;
        }

        await this._host.updateComplete;
      }
    } finally {
      // Cleared here, not after the loop, so a run that throws cannot leave
      // the getter with a permanently rejected promise.
      this._promise = null;
    }
  }
}

/** Creates a layout settle controller bound to `host`. */
export function createLayoutSettleController(
  host: ReactiveElement
): LayoutSettleController {
  return new LayoutSettleController(host);
}
