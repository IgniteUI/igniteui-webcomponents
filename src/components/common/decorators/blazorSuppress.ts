/**
 * Indicates a member should be suppressed in the Blazor API.
 * @returns a function that does nothing, given that this decorator is for static analysis only.
 */
export function blazorSuppress() {
  return (_descriptor: any, _memberName: string): any => {};
}
