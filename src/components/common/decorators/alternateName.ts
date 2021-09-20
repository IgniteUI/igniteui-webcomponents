/**
 * Indicates an alternate member name that can be used for a member due to collisions in a wrapping API.
 * @param propName an alternate member name to use.
 * @param allWeb indicates that the original name is used for all modern web rather than just web components.
 * @returns a function that does nothing, given that this decorator is for static analysis only.
 */
export function alternateName(alternateName: string, allWeb = false) {
  return (descriptor: any, memberName: string): any => {};
}
