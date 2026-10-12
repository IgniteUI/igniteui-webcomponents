/**
 * Indicates that the Blazor API must include a member that is not public.
 *
 * @returns A no-op; the decorator serves the static analysis only.
 */
export function blazorInclude() {
  return (_descriptor: any, _memberName: string): any => {};
}
