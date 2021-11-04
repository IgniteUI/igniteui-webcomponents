/**
 * Indicates that a property will be updated from the inside, paired with an event, so can be used for bidirectional binding.
 * @param _eventName the name of the event that will be fired when the value changes.
 * @param _argsPath indicated the path to the updated value withing the event arguments.
 * @returns a function that does nothing, given that this decorator is for static analysis only.
 */
export function blazorTwoWayBind(_eventName: string, _argsPath: string) {
  return (_descriptor: any, _memberName: string): any => {};
}
