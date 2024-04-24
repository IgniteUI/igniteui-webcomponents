import type { AbstractConstructor, Constructor } from '../mixins/constructor';

/**
 * Indicates a class isn't imported at the root of the API, so needs to be referred to with a deep import in the wrappers.
 */
export function blazorDeepImport(
  _constructor: Constructor | AbstractConstructor
) {}
