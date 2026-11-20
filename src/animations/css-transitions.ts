/**
 * Returns the CSS transitions of `element`, and of its descendants with
 * `{ subtree: true }`, or of all the tree of a shadow root. Author animations,
 * which can run forever, are left out.
 */
export function getCSSTransitions(
  element: Element | ShadowRoot,
  options?: GetAnimationsOptions
): CSSTransition[] {
  const animations =
    element instanceof ShadowRoot
      ? element.getAnimations()
      : element.getAnimations(options);

  return animations.filter((animation) => animation instanceof CSSTransition);
}

/** Returns a promise that settles when each transition finishes or is canceled. */
export function transitionsSettled(
  transitions: readonly Animation[]
): Promise<unknown> {
  return Promise.allSettled(transitions.map(({ finished }) => finished));
}
