import type {
  AbstractConstructor,
  Constructor,
} from '../mixins/constructor.js';

/**
 * Indicates a class should not be exposed to blazor Blazor.
 */
export function blazorSuppressComponent(
  _constructor: Constructor | AbstractConstructor
) {}
