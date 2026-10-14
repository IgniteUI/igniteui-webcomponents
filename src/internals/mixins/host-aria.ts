import type { Constructor, LitElementConstructor } from './constructor.js';

/** @internal */
export const HOST_ARIA_ATTRIBUTES = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
];

/** @internal */
export declare class HostAriaElementInterface {
  /** @internal */
  protected _handleHostAriaChange(name: string): void;
}

/**
 * Renders the component again when a name or description source of its host
 * changes, so the render can forward it into the shadow root.
 * @internal
 */
export function HostAriaMixin<T extends LitElementConstructor>(base: T) {
  class HostAriaElement extends base {
    /** @internal */
    public static override get observedAttributes(): string[] {
      return [...super.observedAttributes, ...HOST_ARIA_ATTRIBUTES];
    }

    /** @internal */
    public override attributeChangedCallback(
      name: string,
      prev: string | null,
      current: string | null
    ): void {
      super.attributeChangedCallback(name, prev, current);

      if (HOST_ARIA_ATTRIBUTES.includes(name)) {
        this._handleHostAriaChange(name);
      }
    }

    /** @internal */
    protected _handleHostAriaChange(_name: string): void {
      this.requestUpdate();
    }
  }

  return HostAriaElement as unknown as Constructor<HostAriaElementInterface> &
    T;
}
