import type {
  AbstractConstructor,
  Constructor,
} from '../mixins/constructor.js';

/**
 * Indicates a class should use the indirect renderer in Blazor.
 */
export function blazorIndirectRender(
  _constructor: Constructor | AbstractConstructor
) {}
