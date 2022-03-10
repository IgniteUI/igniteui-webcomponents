/**
 * Indicates an alternate member name that can be used for a member due to collisions in a wrapping API.
 * @param _typeName an alternate type name to use.
 * @param _allWeb indicates that the alternate type is used for all modern web rather than just blazor.
 * @returns a function that does nothing, given that this decorator is for static analysis only.
 */
export function blazorTypeOverride(_typeName: string, _allWeb = false) {
  return (_descriptor: any, _memberName: string): any => {};
}
