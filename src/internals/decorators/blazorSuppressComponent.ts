import type {
  AbstractConstructor,
  Constructor,
} from '../mixins/constructor.js';

/** Indicates that the Blazor API must not include a class. */
export function blazorSuppressComponent(
  _constructor: Constructor | AbstractConstructor
) {}
