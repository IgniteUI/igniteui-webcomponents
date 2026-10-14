import type {
  AbstractConstructor,
  Constructor,
} from '../mixins/constructor.js';

/** Marks a class for the indirect renderer in Blazor. */
export function blazorIndirectRender(
  _constructor: Constructor | AbstractConstructor
) {}
