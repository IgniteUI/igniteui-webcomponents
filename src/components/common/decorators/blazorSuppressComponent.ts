import type { AbstractConstructor, Constructor } from '../mixins/constructor';

/**
 * Indicates a class should not be exposed to blazor Blazor.
 */
export function blazorSuppressComponent(
  _constructor: Constructor | AbstractConstructor
) {}
