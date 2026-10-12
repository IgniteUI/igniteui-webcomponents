import type {
  AbstractConstructor,
  Constructor,
} from '../mixins/constructor.js';

/** The API root does not import the class; a wrapper needs a deep import. */
export function blazorDeepImport(
  _constructor: Constructor | AbstractConstructor
) {}
