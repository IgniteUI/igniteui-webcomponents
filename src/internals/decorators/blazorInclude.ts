/**
 * Indicates a member should be included in the Blazor API even if non-public.
 * @returns a function that does nothing, given that this decorator is for static analysis only.
 */
export function blazorInclude() {
  return (_descriptor: any, _memberName: string): any => {};
}
