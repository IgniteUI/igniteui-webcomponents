import { LitElement } from 'lit';

/**
 * Sets the shadow DOM options of a LitElement component, merged over the
 * default `shadowRootOptions`.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options
 */
export function shadowOptions(
  options: Partial<ShadowRootInit>
): (proto: unknown) => void {
  return (proto: unknown) => {
    (proto as typeof LitElement).shadowRootOptions = {
      ...LitElement.shadowRootOptions,
      ...options,
    };
  };
}
