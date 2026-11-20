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

/** Ends the CSS transitions that `getCSSTransitions()` returns, so their end styles show at once. */
export function finishCSSTransitions(
  element: Element | ShadowRoot,
  options?: GetAnimationsOptions
): void {
  for (const transition of getCSSTransitions(element, options)) {
    transition.finish();
  }
}

/** Returns a promise that settles when each transition finishes or is canceled. */
export function transitionsSettled(
  transitions: readonly Animation[]
): Promise<unknown> {
  return Promise.allSettled(transitions.map(({ finished }) => finished));
}
