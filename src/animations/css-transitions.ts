/**
 * Returns the CSS transitions of `element`, and of its descendants with
 * `{ subtree: true }`. Author animations, which can run forever, are left out.
 */
export function getCSSTransitions(
  element: Element,
  options?: GetAnimationsOptions
): CSSTransition[] {
  return element
    .getAnimations(options)
    .filter((animation) => animation instanceof CSSTransition);
}

/** Returns a promise that settles when each transition finishes or is canceled. */
export function transitionsSettled(
  transitions: readonly Animation[]
): Promise<unknown> {
  return Promise.allSettled(transitions.map(({ finished }) => finished));
}
