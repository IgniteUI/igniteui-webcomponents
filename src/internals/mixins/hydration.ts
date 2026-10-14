import type { LitElement, PropertyValues } from 'lit';
import type { Constructor } from './constructor.js';

/** @internal */
export declare class HydrationElementInterface {
  /**
   * Set while a server-rendered host is hydrating. During that time `render()`
   * withholds what the server did not render, so that both renders match.
   * @internal
   */
  protected _hydrating: boolean;

  /**
   * Runs after the hydration, off the update cycle. Renders the host again.
   * @internal
   */
  protected _onHydrated(): void;
}

/**
 * Detects the hydration of a server-rendered host: the host has a shadow root
 * before Lit creates one. The first update then ends the hydration and calls
 * `_onHydrated()`, so an override of `firstUpdated` must call the super method.
 * @internal
 */
export function HydrationMixin<T extends Constructor<LitElement>>(base: T) {
  class HydrationElement extends base {
    /** @internal */
    protected _hydrating = false;

    /** @internal */
    protected override createRenderRoot(): HTMLElement | DocumentFragment {
      this._hydrating = this.shadowRoot !== null;
      return super.createRenderRoot();
    }

    /** @internal */
    protected override firstUpdated(props: PropertyValues): void {
      super.firstUpdated(props);

      if (this._hydrating) {
        this._hydrating = false;
        // Off the current update cycle - avoids Lit's change-in-update warning.
        queueMicrotask(() => this._onHydrated());
      }
    }

    /** @internal */
    protected _onHydrated(): void {
      this.requestUpdate();
    }
  }

  return HydrationElement as unknown as Constructor<HydrationElementInterface> &
    T;
}
